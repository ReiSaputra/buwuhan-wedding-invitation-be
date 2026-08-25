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

const REFRESH_TOKEN_TTL_DAYS = 7;

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

function refreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function signAccessToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
}

export class AuthService {
  static async signUp(request: SignUpReq): Promise<SignUpRes> {
    // find email that is exists
    const existingEmail = await AuthRepository.findUserByEmail(request.email);

    // if email exists, return error
    if (existingEmail) throw new ConflictError("Email sudah terdaftar");

    // create user
    const user = await AuthRepository.createUser(request);

    // return user
    return signUpResponse(user);
  }

  static async signIn(request: SignInReq, meta?: RequestMeta | undefined): Promise<SignInRes> {
    // find email that is exists
    const existingEmail = await AuthRepository.findUserByEmail(request.email);

    // if email does not exists, return error
    if (!existingEmail) throw new UnauthorizedError("Email atau password salah");

    // if password is not match, return error
    if (!(await bcrypt.compare(request.password, existingEmail.passwordHash))) {
      throw new UnauthorizedError("Email atau password salah");
    }

    // generate access token
    const accessToken = signAccessToken(existingEmail.id);

    // generate & persist refresh token sebagai session baru
    const refreshToken = generateRefreshToken();
    await AuthRepository.createSession({
      userId: existingEmail.id,
      refreshToken,
      expiresAt: refreshTokenExpiry(),
      meta,
    });

    // return user
    return signInResponse(existingEmail, accessToken, refreshToken);
  }

  static async refreshToken(request: RefreshTokenReq, meta?: RequestMeta | undefined): Promise<RefreshTokenRes> {
    const session = await AuthRepository.findSessionByRefreshToken(request.refreshToken);

    // token tidak dikenal / sudah direvoke / sudah kedaluwarsa -> tolak
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token tidak valid");
    }

    // rotate: revoke session lama, buat session baru dengan refresh token baru
    // (mencegah refresh token lama dipakai ulang / replay)
    await AuthRepository.revokeSessionById(session.id);

    const newRefreshToken = generateRefreshToken();
    await AuthRepository.createSession({
      userId: session.userId,
      refreshToken: newRefreshToken,
      expiresAt: refreshTokenExpiry(),
      meta,
    });

    const accessToken = signAccessToken(session.userId);

    return refreshTokenResponse(accessToken, newRefreshToken);
  }

  static async logout(request: LogoutReq): Promise<LogoutRes> {
    await AuthRepository.revokeSessionByRefreshToken(request.refreshToken);

    // selalu return sukses meskipun token sudah invalid/tidak ada,
    // supaya tidak bocorkan info soal validitas token ke client
    return logoutResponse();
  }
}
