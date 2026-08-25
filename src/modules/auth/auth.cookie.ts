import type { Response, Request } from "express";

// Nama cookie & path di-scope ke /v1/auth saja, supaya cookie ini tidak
// ikut terkirim di request ke endpoint lain yang tidak butuh refresh token.
const REFRESH_TOKEN_COOKIE = "refreshToken";
const COOKIE_PATH = "/v1/auth";
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari, samakan dengan REFRESH_TOKEN_TTL_DAYS di service

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true, // tidak bisa diakses lewat JS di browser -> mitigasi XSS
    secure: process.env.NODE_ENV === "production", // HTTPS only di production
    sameSite: "strict", // tidak ikut terkirim di request cross-site -> mitigasi CSRF
    path: COOKIE_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
  });
}

export function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE];
}
