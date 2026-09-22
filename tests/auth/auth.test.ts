import { describe, expect, it, vi, beforeAll, beforeEach, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// PENTING: sesuaikan jumlah "../" di bawah ini dengan lokasi file test kamu
// yang sebenarnya relatif ke folder src/. Contoh ini mengasumsikan test ada
// di tests/auth/auth.test.ts (dua level di atas src/).
import { authRouter } from "../../src/modules/auth/auth.routes";
import { AuthRepository, hashToken } from "../../src/modules/auth/auth.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";
import { logger } from "../../src/utils/log";

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
  vi.spyOn(AuthRepository, "findUserById");
  vi.spyOn(AuthRepository, "createUser");
  vi.spyOn(AuthRepository, "createSession");
  vi.spyOn(AuthRepository, "findSessionById");
  vi.spyOn(AuthRepository, "findSessionByRefreshToken");
  vi.spyOn(AuthRepository, "revokeSessionById");
  vi.spyOn(AuthRepository, "revokeSessionByRefreshToken");
  vi.spyOn(AuthRepository, "listActiveSessionsByUserId");
  vi.spyOn(AuthRepository, "revokeAllSessionsByUserId");
  vi.spyOn(AuthRepository, "findAccount");
  vi.spyOn(AuthRepository, "linkAccount");
  vi.spyOn(AuthRepository, "createUserFromOAuth");
  vi.spyOn(AuthRepository, "updateUserAvatarIfNull");

  vi.spyOn(logger, "warn");
  vi.spyOn(bcrypt, "hash");
  vi.spyOn(bcrypt, "compare");
  vi.spyOn(jwt, "sign");
  vi.spyOn(jwt, "verify");
});

// ── Test app ─────────────────────────────────────────────────────────
function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/v1/api", authRouter);
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
  role: "USER" as const,
  planTier: "FREE" as const,
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

    const res = await request(app).post("/v1/api/auth/register").send(testUser);

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

    const res = await request(app).post("/v1/api/auth/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: "Email sudah terdaftar" });
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika format email tidak valid (400)", async () => {
    const res = await request(app)
      .post("/v1/api/auth/register")
      .send({ ...testUser, email: "bukan-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika password lemah / kurang dari 8 karakter (400)", async () => {
    const res = await request(app)
      .post("/v1/api/auth/register")
      .send({ ...testUser, password: "abc123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika password tidak mengandung angka (400)", async () => {
    const res = await request(app)
      .post("/v1/api/auth/register")
      .send({ ...testUser, password: "passwordsaja" });

    expect(res.status).toBe(400);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });

  it("menolak signUp jika field wajib tidak diisi (400)", async () => {
    const res = await request(app).post("/v1/api/auth/register").send({ email: testUser.email });

    expect(res.status).toBe(400);
    expect(AuthRepository.createUser).not.toHaveBeenCalled();
  });
});

describe("auth test: signIn", () => {
  it("berhasil signIn dengan kredensial yang benar (200) dan set refresh token cookie", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(mockUserRecord);
    (bcrypt.compare as unknown as Mock).mockResolvedValue(true);
    (AuthRepository.createSession as Mock).mockResolvedValue({ id: "session-id" });

    const res = await request(app).post("/v1/api/auth/login").send({ email: testUser.email, password: testUser.password });

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
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/v1/api/auth");
  });

  it("menolak signIn jika email tidak terdaftar (401)", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(null);

    const res = await request(app).post("/v1/api/auth/login").send({ email: "tidakada@example.com", password: testUser.password });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Email atau password salah" });
    expect(findRefreshTokenCookie(res)).toBeUndefined();
  });

  it("menolak signIn jika password salah (401)", async () => {
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(mockUserRecord);
    (bcrypt.compare as unknown as Mock).mockResolvedValue(false);

    const res = await request(app).post("/v1/api/auth/login").send({ email: testUser.email, password: "PasswordSalah123!" });

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
    // findUserById dipanggil service untuk ambil role & planTier terbaru sebelum
    // sign access token baru -- WAJIB di-mock agar tidak return undefined
    (AuthRepository.findUserById as Mock).mockResolvedValue(mockUserRecord);
    (AuthRepository.revokeSessionById as Mock).mockResolvedValue(undefined);
    (AuthRepository.createSession as Mock).mockResolvedValue({ id: "new-session-id" });

    const res = await request(app).post("/v1/api/auth/refresh-token").set("Cookie", "refreshToken=old-valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Token refreshed successfully",
      status: 200,
      data: { accessToken: "fake-jwt-token" },
    });
    expect(AuthRepository.revokeSessionById).toHaveBeenCalledWith(validSession.id);
    expect(AuthRepository.findUserById).toHaveBeenCalledWith(validSession.userId);

    const cookie = findRefreshTokenCookie(res);
    expect(cookie).toBeDefined();
    expect(cookie).not.toContain("refreshToken=old-valid-token");
  });

  it("menolak refresh jika tidak ada cookie refresh token (401)", async () => {
    const res = await request(app).post("/v1/api/auth/refresh-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak ditemukan" });
    expect(AuthRepository.findSessionByRefreshToken).not.toHaveBeenCalled();
  });

  it("menolak refresh dan me-revoke semua sesi user jika refresh token yang sudah direvoke dipakai lagi / reuse detected (401)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue({
      ...validSession,
      revokedAt: new Date(),
    });
    (AuthRepository.revokeAllSessionsByUserId as Mock).mockResolvedValue({ count: 2 });

    const res = await request(app).post("/v1/api/auth/refresh-token").set("Cookie", "refreshToken=revoked-token").set("User-Agent", "Mozilla/5.0").set("X-Forwarded-For", "127.0.0.1");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
    expect(AuthRepository.revokeSessionById).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      "Refresh token reuse detected",
      expect.objectContaining({
        userId: validSession.userId,
        sessionId: validSession.id,
      }),
    );
    expect(AuthRepository.revokeAllSessionsByUserId).toHaveBeenCalledWith(validSession.userId);
  });

  it("menolak refresh jika token sudah kedaluwarsa (401)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue({
      ...validSession,
      expiresAt: new Date(Date.now() - 1000), // sudah lewat
    });

    const res = await request(app).post("/v1/api/auth/refresh-token").set("Cookie", "refreshToken=expired-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
  });

  it("menolak refresh jika token tidak dikenal (401)", async () => {
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue(null);

    const res = await request(app).post("/v1/api/auth/refresh-token").set("Cookie", "refreshToken=tidak-dikenal");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
  });

  it("menolak refresh jika user sudah dihapus tapi session masih ada (401)", async () => {
    // Skenario: admin hapus user, tapi session lama masih tersimpan di DB
    (AuthRepository.findSessionByRefreshToken as Mock).mockResolvedValue(validSession);
    (AuthRepository.findUserById as Mock).mockResolvedValue(null); // user tidak ada lagi
    (AuthRepository.revokeSessionById as Mock).mockResolvedValue(undefined);

    const res = await request(app).post("/v1/api/auth/refresh-token").set("Cookie", "refreshToken=orphaned-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Refresh token tidak valid" });
  });
});

describe("auth test: logout", () => {
  it("berhasil logout dan revoke session, clear cookie (200)", async () => {
    (AuthRepository.revokeSessionByRefreshToken as Mock).mockResolvedValue({ count: 1 });

    const res = await request(app).post("/v1/api/auth/logout").set("Cookie", "refreshToken=some-token");

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

    const res = await request(app).post("/v1/api/auth/logout");

    expect(res.status).toBe(200);
    expect(AuthRepository.revokeSessionByRefreshToken).toHaveBeenCalledWith("");
  });
});

describe("auth test: listSessions", () => {
  function createAuthHeader(userId = mockUserRecord.id) {
    (jwt.verify as unknown as Mock).mockReturnValue({
      id: userId,
      role: mockUserRecord.role,
      planTier: mockUserRecord.planTier,
    });
    return `Bearer valid-test-token`;
  }

  it("berhasil mendapatkan daftar sesi aktif user dengan penanda isCurrent (200)", async () => {
    const activeSessions = [
      {
        id: "session-1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0)",
        ipAddress: "127.0.0.1",
        refreshTokenHash: hashToken("current-token"),
        createdAt: new Date("2026-09-10T10:00:00Z"),
      },
      {
        id: "session-2",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)",
        ipAddress: "192.168.1.1",
        refreshTokenHash: hashToken("other-token"),
        createdAt: new Date("2026-09-09T08:00:00Z"),
      },
    ];

    (AuthRepository.listActiveSessionsByUserId as Mock).mockResolvedValue(activeSessions);

    const res = await request(app).get("/v1/api/auth/sessions").set("Authorization", createAuthHeader()).set("Cookie", "refreshToken=current-token");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toEqual({
      id: "session-1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0)",
      ipAddress: "127.0.0.1",
      createdAt: "2026-09-10T10:00:00.000Z",
      isCurrent: true,
    });
    expect(res.body.data[1]).toEqual({
      id: "session-2",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)",
      ipAddress: "192.168.1.1",
      createdAt: "2026-09-09T08:00:00.000Z",
      isCurrent: false,
    });
    expect(AuthRepository.listActiveSessionsByUserId).toHaveBeenCalledWith(mockUserRecord.id);
  });

  it("menolak akses tanpa header Authorization (401)", async () => {
    const res = await request(app).get("/v1/api/auth/sessions");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("auth test: logoutAll", () => {
  function createAuthHeader(userId = mockUserRecord.id) {
    (jwt.verify as unknown as Mock).mockReturnValue({
      id: userId,
      role: mockUserRecord.role,
      planTier: mockUserRecord.planTier,
    });
    return `Bearer valid-test-token`;
  }

  it("berhasil me-revoke semua sesi user dan membersihkan cookie refresh token (200)", async () => {
    (AuthRepository.revokeAllSessionsByUserId as Mock).mockResolvedValue({ count: 3 });

    const res = await request(app).post("/v1/api/auth/logout-all").set("Authorization", createAuthHeader()).set("Cookie", "refreshToken=some-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Logged out from all devices successfully",
      status: 200,
    });
    expect(AuthRepository.revokeAllSessionsByUserId).toHaveBeenCalledWith(mockUserRecord.id);

    const cookie = findRefreshTokenCookie(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/refreshToken=;/);
  });

  it("menolak logout-all tanpa header Authorization (401)", async () => {
    const res = await request(app).post("/v1/api/auth/logout-all");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.revokeAllSessionsByUserId).not.toHaveBeenCalled();
  });
});

describe("auth test: deleteSession", () => {
  function createAuthHeader(userId = mockUserRecord.id) {
    (jwt.verify as unknown as Mock).mockReturnValue({
      id: userId,
      role: mockUserRecord.role,
      planTier: mockUserRecord.planTier,
    });
    return `Bearer valid-test-token`;
  }

  it("berhasil menghapus satu sesi spesifik milik user (200)", async () => {
    (AuthRepository.findSessionById as Mock).mockResolvedValue({
      id: "session-target-id",
      userId: mockUserRecord.id,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 3600000),
    });
    (AuthRepository.revokeSessionById as Mock).mockResolvedValue({ id: "session-target-id" });

    const res = await request(app).delete("/v1/api/auth/sessions/session-target-id").set("Authorization", createAuthHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Session deleted successfully",
      status: 200,
    });
    expect(AuthRepository.findSessionById).toHaveBeenCalledWith("session-target-id");
    expect(AuthRepository.revokeSessionById).toHaveBeenCalledWith("session-target-id");
  });

  it("menolak deleteSession jika sesi tidak ditemukan atau sudah direvoke (404)", async () => {
    (AuthRepository.findSessionById as Mock).mockResolvedValue(null);

    const res = await request(app).delete("/v1/api/auth/sessions/non-existent-session").set("Authorization", createAuthHeader());

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.revokeSessionById).not.toHaveBeenCalled();
  });

  it("menolak deleteSession jika sesi bukan milik user yang sedang login (403)", async () => {
    (AuthRepository.findSessionById as Mock).mockResolvedValue({
      id: "other-user-session",
      userId: "different-user-id",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const res = await request(app).delete("/v1/api/auth/sessions/other-user-session").set("Authorization", createAuthHeader());

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.revokeSessionById).not.toHaveBeenCalled();
  });

  it("menolak deleteSession tanpa header Authorization (401)", async () => {
    const res = await request(app).delete("/v1/api/auth/sessions/session-123");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(AuthRepository.findSessionById).not.toHaveBeenCalled();
  });
});

describe("auth test: googleAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (jwt.sign as Mock).mockReturnValue("mock-access-token");
    (AuthRepository.createSession as Mock).mockResolvedValue({ id: "session-1" });
  });

  it("menolak request jika tidak ada idToken atau code (400)", async () => {
    const res = await request(app).post("/v1/api/auth/google").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("berhasil login/register user baru dengan Google idToken (200)", async () => {
    vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
      getPayload: () => ({
        sub: "google-12345",
        email: "googleuser@example.com",
        name: "Google User",
        picture: "https://example.com/avatar.jpg",
        email_verified: true,
      }),
    } as any);

    (AuthRepository.findAccount as Mock).mockResolvedValue(null);
    (AuthRepository.findUserByEmail as Mock).mockResolvedValue(null);
    (AuthRepository.createUserFromOAuth as Mock).mockResolvedValue({
      id: "new-google-user-id",
      fullName: "Google User",
      email: "googleuser@example.com",
      role: "USER",
      planTier: "FREE",
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const res = await request(app).post("/v1/api/auth/google").send({
      idToken: "valid-mock-google-id-token",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("googleuser@example.com");
    expect(res.body.data.accessToken).toBe("mock-access-token");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(AuthRepository.createUserFromOAuth).toHaveBeenCalledWith({
      email: "googleuser@example.com",
      fullName: "Google User",
      avatarUrl: "https://example.com/avatar.jpg",
      provider: "GOOGLE",
      providerAccountId: "google-12345",
    });
  });

  it("berhasil login jika akun Google sudah pernah ditautkan (200)", async () => {
    vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
      getPayload: () => ({
        sub: "google-12345",
        email: "googleuser@example.com",
        name: "Google User",
        picture: "https://example.com/avatar.jpg",
        email_verified: true,
      }),
    } as any);

    (AuthRepository.findAccount as Mock).mockResolvedValue({
      id: "account-1",
      provider: "GOOGLE",
      providerAccountId: "google-12345",
      user: {
        id: "existing-google-user-id",
        fullName: "Existing User",
        email: "googleuser@example.com",
        role: "USER",
        planTier: "FREE",
      },
    });

    const res = await request(app).post("/v1/api/auth/google").send({
      idToken: "valid-mock-google-id-token",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("existing-google-user-id");
    expect(AuthRepository.createUserFromOAuth).not.toHaveBeenCalled();
    expect(AuthRepository.linkAccount).not.toHaveBeenCalled();
  });
});
