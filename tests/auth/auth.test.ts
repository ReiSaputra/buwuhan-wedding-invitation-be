import { describe, expect, it, vi, beforeAll, beforeEach, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// PENTING: sesuaikan jumlah "../" di bawah ini dengan lokasi file test kamu
// yang sebenarnya relatif ke folder src/. Contoh ini mengasumsikan test ada
// di tests/auth/auth.test.ts (dua level di atas src/).
import { authRouter } from "../../src/modules/auth/auth.routes";
import { AuthRepository } from "../../src/modules/auth/auth.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

// ── Spy setup ────────────────────────────────────────────────────────
// Pakai vi.spyOn, BUKAN vi.mock(). vi.mock() mengganti modul di level
// resolusi import, dan gampang meleset kalau ada perbedaan path (alias vs
// relative, dsb) antara file test dan kode aplikasi -- gejalanya persis
// seperti error yang kamu dapat ("X.mockResolvedValue is not a function"),
// karena yang ter-import ternyata class ASLI, bukan hasil mock.
// vi.spyOn() lebih aman: dia menimpa method langsung di objek class yang
// SUDAH berhasil di-import di atas, jadi tidak peduli lagi soal resolusi
// path -- selama importnya sukses (yang terbukti sukses dari error kamu),
// spyOn pasti nempel.
//
// Rate limiter otomatis nonaktif saat NODE_ENV=test (lihat skipInTest di
// rate-limit.middleware.ts), jadi tidak perlu khawatir jumlah request di
// file ini numbrung kena limit register/login/refresh-token.
beforeAll(() => {
  vi.spyOn(AuthRepository, "findUserByEmail");
  vi.spyOn(AuthRepository, "createUser");
  vi.spyOn(AuthRepository, "createSession");
  vi.spyOn(AuthRepository, "findSessionByRefreshToken");
  vi.spyOn(AuthRepository, "revokeSessionById");
  vi.spyOn(AuthRepository, "revokeSessionByRefreshToken");

  vi.spyOn(bcrypt, "hash");
  vi.spyOn(bcrypt, "compare");
  vi.spyOn(jwt, "sign");
});

// ── Test app ─────────────────────────────────────────────────────────
function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/v1", authRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const testUser = {
  fullName: "Test User",
  email: "testuser@example.com",
  password: "Password123!",
};

const mockUserRecord = {
  id: "user-id-123",
  fullName: testUser.fullName,
  email: testUser.email,
  passwordHash: "hashed-password",
  role: "USER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function getSetCookieHeaders(res: request.Response): string[] {
  const raw = res.headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function findRefreshTokenCookie(res: request.Response): string | undefined {
  return getSetCookieHeaders(res).find((c) => c.startsWith("refreshToken="));
}

beforeEach(() => {
  // resetAllMocks = hapus history call DAN implementation (bukan cuma clear
  // history seperti clearAllMocks) -- supaya tiap test benar-benar mulai
  // dari kondisi bersih, lalu default implementation bcrypt/jwt di-set ulang.
  vi.resetAllMocks();
  (bcrypt.hash as Mock).mockResolvedValue("hashed-password");
  (jwt.sign as unknown as Mock).mockReturnValue("fake-jwt-token");
});

describe("auth test: signUp", () => {
  it("berhasil mendaftarkan user baru dengan data valid (201)", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(null);
    (AuthRepository.createUser as Mock).mockResolvedValue(mockUserRecord);

    const res = await request(app).post("/v1/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "User created successfully",
      status: 201,
      data: {
        id: mockUserRecord.id,
        fullName: mockUserRecord.fullName,
        email: mockUserRecord.email,
      },
    });
    expect(AuthRepository.createUser).toHaveBeenCalledWith(testUser);
  });

  it("menolak signUp jika email sudah terdaftar (409)", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(mockUserRecord);

    const res = await request(app).post("/v1/auth/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: "Email sudah terdaftar" });
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika format email tidak valid (400)", async () => {
    const res = await request(app)
      .post("/v1/auth/register")
      .send({ ...testUser, email: "bukan-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika password lemah / kurang dari 8 karakter (400)", async () => {
    const res = await request(app)
      .post("/v1/auth/register")
      .send({ ...testUser, password: "abc123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika password tidak mengandung angka (400)", async () => {
    const res = await request(app)
      .post("/v1/auth/register")
      .send({ ...testUser, password: "passwordsaja" });

    expect(res.status).toBe(400);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika field wajib tidak diisi (400)", async () => {
    const res = await request(app).post("/v1/auth/register").send({ email: testUser.email });

    expect(res.status).toBe(400);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });
});

describe("auth test: signIn", () => {
  it("berhasil signIn dengan kredensial yang benar (200) dan set refresh token cookie", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(mockUserRecord);
    (bcrypt.compare as unknown as Mock).mockResolvedValue(true);
    (AuthRepository.createSession as Mock).mockResolvedValue({ id: "session-id" });

    const res = await request(app).post("/v1/auth/login").send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    // refreshToken TIDAK boleh ada di body -- hanya di cookie
    expect(res.body).toEqual({
      message: "User signed in successfully",
      status: 200,
      data: {
        id: mockUserRecord.id,
        fullName: mockUserRecord.fullName,
        email: mockUserRecord.email,
        accessToken: "fake-jwt-token",
      },
    });

    const createSessionArgs = (AuthRepository.createSession as Mock).mock.calls[0][0];
    const cookie = findRefreshTokenCookie(res);

    expect(cookie).toBeDefined();
    expect(cookie).toContain(`refreshToken=${createSessionArgs.refreshToken}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/v1/auth");
  });

  it("menolak signIn jika email tidak terdaftar (401)", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(null);

    const res = await request(app).post("/v1/auth/login").send({ email: "tidakada@example.com", password: testUser.password });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Email atau password salah" });
    expect(findRefreshTokenCookie(res)).toBeUndefined();
  });

  it("menolak signIn jika password salah (401)", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(mockUserRecord);
    (bcrypt.compare as unknown as Mock).mockResolvedValue(false);

    const res = await request(app).post("/v1/auth/login").send({ email: testUser.email, password: "PasswordSalah123!" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Email atau password salah" });
  });
});

describe("auth test: refreshToken", () => {
  const validSession = {
    id: "session-id",
    userId: mockUserRecord.id,
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 jam lagi
  };

  it("berhasil rotate token dengan refresh token yang valid (200)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue(validSession);
    (AuthRepository.revokeSessionById as Mock).mockResolvedValue(undefined);
    (AuthRepository.createSession as Mock).mockResolvedValue({ id: "new-session-id" });

    const res = await request(app).post("/v1/auth/refresh-token").set("Cookie", "refreshToken=old-valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Token refreshed successfully",
      status: 200,
      data: { accessToken: "fake-jwt-token" },
    });
    expect(AuthRepository.revokeSessionById).toHaveBeenCalledWith(validSession.id);

    const cookie = findRefreshTokenCookie(res);
    expect(cookie).toBeDefined();
    expect(cookie).not.toContain("refreshToken=old-valid-token");
  });

  it("menolak refresh jika tidak ada cookie refresh token (401)", async () => {
    const res = await request(app).post("/v1/auth/refresh-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak ditemukan" });
    expect(AuthRepository.findSessionByRefreshToken).not.toHaveBeenCalled();
  });

  it("menolak refresh jika token sudah direvoke (401)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue({
      ...validSession,
      revokedAt: new Date(),
    });

    const res = await request(app).post("/v1/auth/refresh-token").set("Cookie", "refreshToken=revoked-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
    expect(AuthRepository.revokeSessionById).not.toHaveBeenCalled();
  });

  it("menolak refresh jika token sudah kedaluwarsa (401)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue({
      ...validSession,
      expiresAt: new Date(Date.now() - 1000), // sudah lewat
    });

    const res = await request(app).post("/v1/auth/refresh-token").set("Cookie", "refreshToken=expired-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
  });

  it("menolak refresh jika token tidak dikenal (401)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue(null);

    const res = await request(app).post("/v1/auth/refresh-token").set("Cookie", "refreshToken=tidak-dikenal");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
  });
});

describe("auth test: logout", () => {
  it("berhasil logout dan revoke session, clear cookie (200)", async () => {
    (AuthRepository.revokeSessionByRefreshToken as Mock).mockResolvedValue({ count: 1 });

    const res = await request(app).post("/v1/auth/logout").set("Cookie", "refreshToken=some-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Logged out successfully", status: 200 });
    expect(AuthRepository.revokeSessionByRefreshToken).toHaveBeenCalledWith("some-token");

    const cookie = findRefreshTokenCookie(res);
    expect(cookie).toBeDefined();
    // clearCookie mengirim ulang cookie dengan expiry di masa lalu
    expect(cookie).toMatch(/refreshToken=;/);
  });

  it("tetap 200 walau tidak ada cookie refresh token", async () => {
    (AuthRepository.revokeSessionByRefreshToken as Mock).mockResolvedValue({ count: 0 });

    const res = await request(app).post("/v1/auth/logout");

    expect(res.status).toBe(200);
    expect(AuthRepository.revokeSessionByRefreshToken).toHaveBeenCalledWith("");
  });
});
