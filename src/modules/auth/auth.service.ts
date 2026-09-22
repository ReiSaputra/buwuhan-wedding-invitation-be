// Taruh file ini di: src/modules/auth/auth.service.ts
// PERUBAHAN dari versi sebelumnya:
//   - signAccessToken() sekarang menerima & meng-encode `role` di payload JWT
//   - signIn() mengirim role user ke signAccessToken()
//   - refreshToken() query ulang user (AuthRepository.findUserById) buat
//     ambil role terbaru sebelum bikin access token baru -- soalnya Session
//     cuma nyimpen userId, bukan role, dan role bisa saja berubah sejak
//     access token lama diterbitkan

import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { AuthRepository, hashToken } from "./auth.repository";
import {
  deleteSessionResponse,
  listSessionsResponse,
  logoutAllResponse,
  logoutResponse,
  refreshTokenResponse,
  signInResponse,
  signUpResponse,
  type DeleteSessionRes,
  type GoogleAuthReq,
  type ListSessionsRes,
  type LogoutAllRes,
  type LogoutReq,
  type LogoutRes,
  type RefreshTokenReq,
  type RefreshTokenRes,
  type RequestMeta,
  type SignInReq,
  type SignInRes,
  type SignUpReq,
  type SignUpRes,
} from "./auth.types";

import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/app.error";
import { logger } from "../../utils/log";
import type { PlanTier, PlatformRole } from "../../generated/prisma/client";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "postmessage"
);

const REFRESH_TOKEN_TTL_DAYS = 7;

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

function refreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

// role & planTier ikut di-embed di JWT supaya requireRole()/cek tier di
// middleware & service tidak perlu query DB tiap request -- konsekuensinya:
// perubahan role ATAU planTier oleh admin baru kepakai setelah access token
// lama expired/di-refresh (maksimal delay sesuai TTL access token, 1 hari)
function signAccessToken(userId: string, role: PlatformRole, planTier: PlanTier): string {
  return jwt.sign({ id: userId, role, planTier }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
}

export class AuthService {
  static async signUp(request: SignUpReq): Promise<SignUpRes> {
    const existingEmail = await AuthRepository.findUserByEmail(request.email);

    if (existingEmail) throw new ConflictError("Email sudah terdaftar");

    const user = await AuthRepository.createUser(request);

    return signUpResponse(user);
  }

  static async signIn(request: SignInReq, meta?: RequestMeta | undefined): Promise<SignInRes> {
    const existingEmail = await AuthRepository.findUserByEmail(request.email);

    if (!existingEmail) throw new UnauthorizedError("Email atau password salah");
    if (!existingEmail || !existingEmail.passwordHash) {
      throw new UnauthorizedError("Email atau password salah");
    }

    if (!(await bcrypt.compare(request.password, existingEmail.passwordHash))) {
      throw new UnauthorizedError("Email atau password salah");
    }

    const accessToken = signAccessToken(existingEmail.id, existingEmail.role, existingEmail.planTier);

    const refreshToken = generateRefreshToken();
    await AuthRepository.createSession({
      userId: existingEmail.id,
      refreshToken,
      expiresAt: refreshTokenExpiry(),
      meta,
    });

    return signInResponse(existingEmail, accessToken, refreshToken);
  }

  static async googleAuth(request: GoogleAuthReq, meta?: RequestMeta | undefined): Promise<SignInRes> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID belum dikonfigurasi di environment");
    }

    let email: string | undefined;
    let fullName: string | undefined;
    let googleId: string | undefined;
    let avatarUrl: string | undefined;
    let emailVerified: boolean | undefined;

    if (request.idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken: request.idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError("Token Google tidak valid");
      }
      email = payload.email;
      fullName = payload.name;
      googleId = payload.sub;
      avatarUrl = payload.picture;
      emailVerified = payload.email_verified;
    } else if (request.code) {
      const { tokens } = await googleClient.getToken({
        code: request.code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "postmessage",
      });
      if (!tokens.id_token) {
        throw new UnauthorizedError("Gagal mendapatkan ID token dari Google");
      }
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError("Payload token Google tidak valid");
      }
      email = payload.email;
      fullName = payload.name;
      googleId = payload.sub;
      avatarUrl = payload.picture;
      emailVerified = payload.email_verified;
    } else {
      throw new UnauthorizedError("idToken atau code Google wajib disertakan");
    }

    if (!email || !googleId) {
      throw new UnauthorizedError("Informasi profil Google tidak lengkap");
    }

    if (!emailVerified) {
      throw new UnauthorizedError("Email Google belum terverifikasi");
    }

    const safeEmail = email;
    const safeFullName = (fullName && fullName.trim().length > 0) ? fullName : (safeEmail.split("@")[0] ?? "User");

    // 1. Cek apakah user sudah terhubung via Account Google
    const existingAccount = await AuthRepository.findAccount("GOOGLE", googleId);
    let user = existingAccount?.user;

    if (!user) {
      // 2. Cek apakah email sudah terdaftar sebelumnya di sistem
      const existingUser = await AuthRepository.findUserByEmail(safeEmail);

      if (existingUser) {
        await AuthRepository.linkAccount({
          userId: existingUser.id,
          provider: "GOOGLE",
          providerAccountId: googleId,
        });

        if (!existingUser.avatarUrl && avatarUrl) {
          await AuthRepository.updateUserAvatarIfNull(existingUser.id, avatarUrl);
        }

        user = existingUser;
      } else {
        // 3. Daftarkan user baru dari profil Google
        user = await AuthRepository.createUserFromOAuth({
          email: safeEmail,
          fullName: safeFullName,
          avatarUrl: avatarUrl ?? null,
          provider: "GOOGLE",
          providerAccountId: googleId,
        });
      }
    }

    const accessToken = signAccessToken(user.id, user.role, user.planTier);
    const refreshToken = generateRefreshToken();

    await AuthRepository.createSession({
      userId: user.id,
      refreshToken,
      expiresAt: refreshTokenExpiry(),
      meta,
    });

    return signInResponse(user, accessToken, refreshToken);
  }

  static async refreshToken(request: RefreshTokenReq, meta?: RequestMeta | undefined): Promise<RefreshTokenRes> {
    const session = await AuthRepository.findSessionByRefreshToken(request.refreshToken);

    // Jika session tidak ditemukan atau sudah kedaluwarsa
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token tidak valid");
    }

    // Deteksi reuse: session sudah pernah di-revoke (indikasi pencurian token)
    if (session.revokedAt) {
      logger.warn("Refresh token reuse detected", {
        userId: session.userId,
        sessionId: session.id,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      // Revoke semua sesi aktif milik user sebagai mitigasi keamanan
      await AuthRepository.revokeAllSessionsByUserId(session.userId);
      throw new UnauthorizedError("Refresh token tidak valid");
    }

    // ambil role terbaru -- jangan asumsikan dari access token lama, karena
    // access token lama tidak tersedia di sini (cuma refresh token)
    const user = await AuthRepository.findUserById(session.userId);

    if (!user) {
      // user sudah dihapus tapi session-nya masih ada -- tolak
      throw new UnauthorizedError("Refresh token tidak valid");
    }

    await AuthRepository.revokeSessionById(session.id);

    const newRefreshToken = generateRefreshToken();
    await AuthRepository.createSession({
      userId: session.userId,
      refreshToken: newRefreshToken,
      expiresAt: refreshTokenExpiry(),
      meta,
    });

    const accessToken = signAccessToken(user.id, user.role, user.planTier);

    return refreshTokenResponse(accessToken, newRefreshToken);
  }

  // ---------------------------------------------------------------------------
  // Session management
  // ---------------------------------------------------------------------------

  static async listSessions(userId: string, currentRefreshToken?: string | undefined): Promise<ListSessionsRes> {
    const sessions = await AuthRepository.listActiveSessionsByUserId(userId);
    const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

    const sessionItems = sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      isCurrent: Boolean(currentHash && session.refreshTokenHash === currentHash),
    }));

    return listSessionsResponse(sessionItems);
  }

  static async logoutAll(userId: string): Promise<LogoutAllRes> {
    await AuthRepository.revokeAllSessionsByUserId(userId);
    return logoutAllResponse();
  }

  static async deleteSession(userId: string, sessionId: string): Promise<DeleteSessionRes> {
    const session = await AuthRepository.findSessionById(sessionId);

    if (!session || session.revokedAt) {
      throw new NotFoundError("Sesi tidak ditemukan");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke sesi ini");
    }

    await AuthRepository.revokeSessionById(sessionId);
    return deleteSessionResponse();
  }

  static async logout(request: LogoutReq): Promise<LogoutRes> {
    await AuthRepository.revokeSessionByRefreshToken(request.refreshToken);

    return logoutResponse();
  }
}


