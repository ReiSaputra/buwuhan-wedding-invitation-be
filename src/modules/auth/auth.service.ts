// Taruh file ini di: src/modules/auth/auth.service.ts
// PERUBAHAN dari versi sebelumnya:
//   - signAccessToken() sekarang menerima & meng-encode `role` di payload JWT
//   - signIn() mengirim role user ke signAccessToken()
//   - refreshToken() query ulang user (AuthRepository.findUserById) buat
//     ambil role terbaru sebelum bikin access token baru -- soalnya Session
//     cuma nyimpen userId, bukan role, dan role bisa saja berubah sejak
//     access token lama diterbitkan

import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { AuthRepository, hashToken } from "./auth.repository";
import {
  deleteSessionResponse,
  forgotPasswordResponse,
  listSessionsResponse,
  logoutAllResponse,
  logoutResponse,
  refreshTokenResponse,
  resetPasswordResponse,
  signInResponse,
  signUpResponse,
  type DeleteSessionRes,
  type FacebookAuthReq,
  type ForgotPasswordReq,
  type ForgotPasswordRes,
  type GoogleAuthReq,
  type ListSessionsRes,
  type LogoutAllRes,
  type LogoutReq,
  type LogoutRes,
  type RefreshTokenReq,
  type RefreshTokenRes,
  type RequestMeta,
  type ResetPasswordReq,
  type ResetPasswordRes,
  type SignInReq,
  type SignInRes,
  type SignUpReq,
  type SignUpRes,
} from "./auth.types";

import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/app.error";
import { logger } from "../../utils/log";
import { mailer } from "../../lib/mailer";
import type { PlanTier, PlatformRole } from "../../generated/prisma/client";

function renderResetPasswordEmail(params: { fullName: string; resetUrl: string }): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Kata Sandi</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Buwuhan Digital Invitation</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #111827;">Permintaan Reset Kata Sandi</h2>
      <p style="font-size: 14px; line-height: 22px; color: #4b5563; margin-bottom: 24px;">
        Halo <strong>${params.fullName}</strong>,<br>
        Kami menerima permintaan untuk mengatur ulang kata sandi akun Buwuhan Anda. Klik tombol di bawah ini untuk melanjutkan:
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${params.resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          Reset Kata Sandi Saya
        </a>
      </div>
      <p style="font-size: 13px; line-height: 20px; color: #6b7280; margin-bottom: 16px;">
        Tautan ini hanya berlaku selama <strong>15 menit</strong>. Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin tautan berikut ke browser Anda:
      </p>
      <p style="font-size: 12px; line-height: 18px; color: #4f46e5; word-break: break-all; background-color: #f3f4f6; padding: 10px 12px; border-radius: 6px; margin-bottom: 24px;">
        ${params.resetUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="font-size: 12px; line-height: 18px; color: #9ca3af; margin: 0;">
        Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini dengan aman. Kata sandi akun Anda tidak akan berubah.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getGoogleClient(): OAuth2Client {
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || "postmessage");
}

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

    const googleClient = getGoogleClient();

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
    const safeFullName = fullName && fullName.trim().length > 0 ? fullName : (safeEmail.split("@")[0] ?? "User");

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

  static async facebookAuth(request: FacebookAuthReq, meta?: RequestMeta | undefined): Promise<SignInRes> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("FACEBOOK_APP_ID atau FACEBOOK_APP_SECRET belum dikonfigurasi di environment");
    }

    let userAccessToken: string;

    if (request.accessToken) {
      userAccessToken = request.accessToken;
    } else if (request.code) {
      const redirectUri = process.env.FACEBOOK_REDIRECT_URI || "http://localhost:5173/auth/facebook/callback";
      const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
      tokenUrl.searchParams.set("client_id", appId);
      tokenUrl.searchParams.set("client_secret", appSecret);
      tokenUrl.searchParams.set("redirect_uri", redirectUri);
      tokenUrl.searchParams.set("code", request.code);

      const tokenRes = await fetch(tokenUrl.toString());
      const tokenData = (await tokenRes.json()) as { access_token?: string; error?: { message: string } };

      if (!tokenRes.ok || !tokenData.access_token) {
        logger.error("Facebook token exchange failed", { error: tokenData.error });
        throw new UnauthorizedError(tokenData.error?.message || "Gagal mendapatkan access token dari Facebook");
      }

      userAccessToken = tokenData.access_token;
    } else {
      throw new UnauthorizedError("accessToken atau code Facebook wajib disertakan");
    }

    // Ambil profil user dari Facebook Graph API dengan HMAC SHA256 appsecret_proof
    const appSecretProof = crypto.createHmac("sha256", appSecret).update(userAccessToken).digest("hex");
    const meUrl = new URL("https://graph.facebook.com/v19.0/me");
    meUrl.searchParams.set("fields", "id,name,email,picture.type(large)");
    meUrl.searchParams.set("access_token", userAccessToken);
    meUrl.searchParams.set("appsecret_proof", appSecretProof);

    const meRes = await fetch(meUrl.toString());
    const fbProfile = (await meRes.json()) as {
      id?: string;
      name?: string;
      email?: string;
      picture?: {
        data?: {
          url?: string;
        };
      };
      error?: {
        message: string;
      };
    };

    if (!meRes.ok || !fbProfile.id) {
      logger.error("Facebook profile fetch failed", { error: fbProfile.error });
      throw new UnauthorizedError(fbProfile.error?.message || "Token Facebook tidak valid atau kedaluwarsa");
    }

    const facebookId = fbProfile.id;
    const email = fbProfile.email;
    const fullName = fbProfile.name;
    const avatarUrl = fbProfile.picture?.data?.url;

    // 1. Cek apakah user sudah terhubung via Account Facebook
    const existingAccount = await AuthRepository.findAccount("FACEBOOK", facebookId);
    let user = existingAccount?.user;

    if (!user) {
      if (!email) {
        throw new UnauthorizedError(
          "Akun Facebook Anda tidak membagikan alamat email. Pastikan izin email telah diizinkan pada aplikasi Facebook Anda."
        );
      }

      const safeEmail = email.toLowerCase().trim();
      const safeFullName = fullName && fullName.trim().length > 0 ? fullName : (safeEmail.split("@")[0] ?? "User");

      // 2. Cek apakah email sudah terdaftar sebelumnya di sistem
      const existingUser = await AuthRepository.findUserByEmail(safeEmail);

      if (existingUser) {
        await AuthRepository.linkAccount({
          userId: existingUser.id,
          provider: "FACEBOOK",
          providerAccountId: facebookId,
        });

        if (!existingUser.avatarUrl && avatarUrl) {
          await AuthRepository.updateUserAvatarIfNull(existingUser.id, avatarUrl);
        }

        user = existingUser;
      } else {
        // 3. Daftarkan user baru dari profil Facebook
        user = await AuthRepository.createUserFromOAuth({
          email: safeEmail,
          fullName: safeFullName,
          avatarUrl: avatarUrl ?? null,
          provider: "FACEBOOK",
          providerAccountId: facebookId,
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

  // ── Password Reset Flow ────────────────────────────────────────────

  static async forgotPassword(request: ForgotPasswordReq): Promise<ForgotPasswordRes> {
    const user = await AuthRepository.findUserByEmail(request.email);

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

      await AuthRepository.createPasswordResetToken({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const frontendBaseUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",")[0].trim() : "http://localhost:5173";
      const resetUrl = `${frontendBaseUrl}/reset-password?token=${rawToken}`;

      try {
        await mailer.sendMail({
          to: user.email,
          subject: "Permintaan Reset Kata Sandi - Buwuhan",
          html: renderResetPasswordEmail({ fullName: user.fullName, resetUrl }),
          text: `Halo ${user.fullName}, buka tautan berikut untuk reset kata sandi Anda: ${resetUrl} (berlaku 15 menit).`,
        });
      } catch (error) {
        logger.error("Gagal mengirim email reset password", { userId: user.id, error });
      }
    }

    return forgotPasswordResponse();
  }

  static async resetPassword(request: ResetPasswordReq): Promise<ResetPasswordRes> {
    const tokenHash = hashToken(request.token);
    const tokenRecord = await AuthRepository.findPasswordResetToken(tokenHash);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError("Token reset password tidak valid atau sudah kedaluwarsa");
    }

    const newPasswordHash = await bcrypt.hash(request.newPassword, 10);
    await AuthRepository.updateUserPassword(tokenRecord.userId, newPasswordHash);

    // Hapus token yang telah digunakan
    await AuthRepository.deletePasswordResetToken(tokenRecord.id);

    // Revoke seluruh sesi aktif milik user
    await AuthRepository.revokeAllSessionsByUserId(tokenRecord.userId);

    return resetPasswordResponse();
  }
}
