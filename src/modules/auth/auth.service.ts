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

import { AuthRepository } from "./auth.repository";
import {
  logoutResponse,
  refreshTokenResponse,
  signInResponse,
  signUpResponse,
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

import { ConflictError, UnauthorizedError } from "../../errors/app.error";
import type { PlanTier, PlatformRole } from "../../generated/prisma/client";

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

  static async refreshToken(request: RefreshTokenReq, meta?: RequestMeta | undefined): Promise<RefreshTokenRes> {
    const session = await AuthRepository.findSessionByRefreshToken(request.refreshToken);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
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

  static async logout(request: LogoutReq): Promise<LogoutRes> {
    await AuthRepository.revokeSessionByRefreshToken(request.refreshToken);

    return logoutResponse();
  }
}
