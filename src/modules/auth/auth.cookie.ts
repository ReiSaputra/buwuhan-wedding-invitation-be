import type { Response, Request } from "express";

// Nama cookie & path di-scope ke /v1/auth saja, supaya cookie ini tidak
// ikut terkirim di request ke endpoint lain yang tidak butuh refresh token.
const REFRESH_TOKEN_COOKIE = "refreshToken";
const COOKIE_PATH = "/v1/api/auth";
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari, samakan dengan REFRESH_TOKEN_TTL_DAYS di service

const isProduction = process.env.NODE_ENV === "production";

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true, // tidak bisa diakses lewat JS di browser -> mitigasi XSS
    secure: process.env.NODE_ENV === "production", // HTTPS only di production
    sameSite: "strict", // tidak ikut terkirim di request cross-site -> mitigasi CSRF
    secure: isProduction, // HTTPS only di production (wajib true jika sameSite: "none")
    sameSite: isProduction ? "none" : "lax", // "none" di prod untuk cross-subdomain/cross-origin, "lax" di dev lokal
    path: COOKIE_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: COOKIE_PATH,
  });
}

export function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE];
}
