import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { userRouter } from "../../src/modules/user/user.routes";
import { UserRepository } from "../../src/modules/user/user.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(UserRepository, "findById");
  vi.spyOn(UserRepository, "findManyWithFilter");
  vi.spyOn(UserRepository, "findDetailWithInvitations");
  vi.spyOn(UserRepository, "updateTier");
  vi.spyOn(UserRepository, "updateRole");
  vi.spyOn(UserRepository, "revokeAllUserSessions");
  vi.spyOn(UserRepository, "deleteById");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", userRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockUser = {
  id: "user-123",
  fullName: "Fathur Saputra",
  email: "fathur@example.com",
  passwordHash: "hash",
  role: "USER" as const,
  planTier: "FREE" as const,
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-01T00:00:00.000Z"),
};

const mockAdmin = {
  id: "admin-999",
  fullName: "Admin Buwuhan",
  email: "admin@buwuhan.com",
  passwordHash: "hash",
  role: "ADMIN" as const,
  planTier: "MAX" as const,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const userAuthToken = jwt.sign({ id: mockUser.id, role: mockUser.role, planTier: mockUser.planTier }, process.env.JWT_SECRET, { expiresIn: "1d" });

const adminAuthToken = jwt.sign({ id: mockAdmin.id, role: mockAdmin.role, planTier: mockAdmin.planTier }, process.env.JWT_SECRET, { expiresIn: "1d" });

beforeEach(() => {
  vi.resetAllMocks();
});

// ── User Profil Pribadi ────────────────────────────────────────────────

describe("user test: GET /users/me", () => {
  it("berhasil mengambil profil pengguna login (200)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockUser);

    const res = await request(app).get("/v1/api/users/me").set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profil pengguna berhasil diambil");
    expect(res.body.data.id).toBe(mockUser.id);
    expect(res.body.data.fullName).toBe("Fathur Saputra");
    expect(res.body.data.email).toBe("fathur@example.com");
    expect(res.body.data.role).toBe("USER");
    expect(res.body.data.planTier).toBe("FREE");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("menolak akses tanpa token autentikasi (401)", async () => {
    const res = await request(app).get("/v1/api/users/me");

    expect(res.status).toBe(401);
  });

  it("mengembalikan 404 jika user tidak ditemukan di database (404)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).get("/v1/api/users/me").set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });
});

// ── Admin User Management: GET /admin/users ───────────────────────────

describe("admin user test: GET /admin/users", () => {
  it("berhasil mengambil daftar pengguna dengan paginasi (200)", async () => {
    (UserRepository.findManyWithFilter as Mock).mockResolvedValue({
      total: 1,
      users: [
        {
          ...mockUser,
          _count: { invitations: 2 },
        },
      ],
    });

    const res = await request(app).get("/v1/api/admin/users?page=1&limit=10").set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Daftar pengguna berhasil diambil");
    expect(res.body.data.users).toHaveLength(1);
    expect(res.body.data.users[0].id).toBe(mockUser.id);
    expect(res.body.data.users[0].totalInvitations).toBe(2);
    expect(res.body.data.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it("berhasil memfilter pencarian dan role/tier (200)", async () => {
    (UserRepository.findManyWithFilter as Mock).mockResolvedValue({
      total: 0,
      users: [],
    });

    const res = await request(app).get("/v1/api/admin/users?search=fathur&role=USER&planTier=FREE").set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(UserRepository.findManyWithFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "fathur",
        role: "USER",
        planTier: "FREE",
      }),
    );
  });

  it("menolak akses jika pengguna bukan ADMIN (403)", async () => {
    const res = await request(app).get("/v1/api/admin/users").set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Kamu tidak punya akses untuk melakukan aksi ini");
  });

  it("menolak akses tanpa token autentikasi (401)", async () => {
    const res = await request(app).get("/v1/api/admin/users");

    expect(res.status).toBe(401);
  });
});

// ── Admin User Management: GET /admin/users/:id ───────────────────────

describe("admin user test: GET /admin/users/:id", () => {
  it("berhasil mengambil detail pengguna beserta ringkasan undangan & tamu (200)", async () => {
    (UserRepository.findDetailWithInvitations as Mock).mockResolvedValue({
      ...mockUser,
      invitations: [
        {
          id: "inv-1",
          title: "Pernikahan Ayu & Budi",
          slug: "ayu-dan-budi",
          status: "ACTIVE" as const,
          eventCategory: "WEDDING" as const,
          eventDate: new Date("2026-12-12"),
          eventTime: "08:00 WIB",
          venue: "Ballroom Hotel",
          createdAt: new Date("2026-08-10"),
          _count: { guests: 150 },
        },
      ],
    });

    const res = await request(app).get(`/v1/api/admin/users/${mockUser.id}`).set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Detail pengguna berhasil diambil");
    expect(res.body.data.id).toBe(mockUser.id);
    expect(res.body.data.stats).toEqual({
      totalInvitations: 1,
      totalGuests: 150,
    });
    expect(res.body.data.invitations).toHaveLength(1);
    expect(res.body.data.invitations[0].totalGuests).toBe(150);
  });

  it("mengembalikan 404 jika pengguna tidak ditemukan (404)", async () => {
    (UserRepository.findDetailWithInvitations as Mock).mockResolvedValue(null);

    const res = await request(app).get("/v1/api/admin/users/non-existent-user").set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).get(`/v1/api/admin/users/${mockUser.id}`).set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(403);
  });
});

// ── Admin User Management: PATCH /admin/users/:id/tier ────────────────

describe("admin user test: PATCH /admin/users/:id/tier", () => {
  it("berhasil mengubah paket tier pengguna (200)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockUser);
    (UserRepository.updateTier as Mock).mockResolvedValue({
      ...mockUser,
      planTier: "PRO" as const,
    });

    const res = await request(app).patch(`/v1/api/admin/users/${mockUser.id}/tier`).set("Authorization", `Bearer ${adminAuthToken}`).send({ planTier: "PRO" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Paket tier pengguna berhasil diperbarui");
    expect(res.body.data.planTier).toBe("PRO");
    expect(UserRepository.updateTier).toHaveBeenCalledWith(mockUser.id, "PRO");
  });

  it("menolak jika nilai planTier tidak valid (400)", async () => {
    const res = await request(app).patch(`/v1/api/admin/users/${mockUser.id}/tier`).set("Authorization", `Bearer ${adminAuthToken}`).send({ planTier: "INVALID_TIER" });

    expect(res.status).toBe(400);
  });

  it("mengembalikan 404 jika pengguna tidak ditemukan (404)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).patch(`/v1/api/admin/users/non-existent/tier`).set("Authorization", `Bearer ${adminAuthToken}`).send({ planTier: "MAX" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).patch(`/v1/api/admin/users/${mockUser.id}/tier`).set("Authorization", `Bearer ${userAuthToken}`).send({ planTier: "PRO" });

    expect(res.status).toBe(403);
  });
});

// ── Admin User Management: PATCH /admin/users/:id/role ────────────────

describe("admin user test: PATCH /admin/users/:id/role", () => {
  it("berhasil mengubah role pengguna menjadi ADMIN (200)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockUser);
    (UserRepository.updateRole as Mock).mockResolvedValue({
      ...mockUser,
      role: "ADMIN" as const,
    });

    const res = await request(app).patch(`/v1/api/admin/users/${mockUser.id}/role`).set("Authorization", `Bearer ${adminAuthToken}`).send({ role: "ADMIN" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Role pengguna berhasil diperbarui");
    expect(res.body.data.role).toBe("ADMIN");
    expect(UserRepository.updateRole).toHaveBeenCalledWith(mockUser.id, "ADMIN");
  });

  it("menolak jika admin mencoba mencabut role ADMIN dari akunnya sendiri (403)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockAdmin);

    const res = await request(app).patch(`/v1/api/admin/users/${mockAdmin.id}/role`).set("Authorization", `Bearer ${adminAuthToken}`).send({ role: "USER" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Kamu tidak dapat mencabut hak akses ADMIN dari akunmu sendiri");
    expect(UserRepository.updateRole).not.toHaveBeenCalled();
  });

  it("menolak jika nilai role tidak valid (400)", async () => {
    const res = await request(app).patch(`/v1/api/admin/users/${mockUser.id}/role`).set("Authorization", `Bearer ${adminAuthToken}`).send({ role: "SUPERADMIN" });

    expect(res.status).toBe(400);
  });

  it("mengembalikan 404 jika pengguna tidak ditemukan (404)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).patch(`/v1/api/admin/users/non-existent/role`).set("Authorization", `Bearer ${adminAuthToken}`).send({ role: "USER" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).patch(`/v1/api/admin/users/${mockUser.id}/role`).set("Authorization", `Bearer ${userAuthToken}`).send({ role: "ADMIN" });

    expect(res.status).toBe(403);
  });
});

// ── Admin User Management: POST /admin/users/:id/revoke-sessions ───────

describe("admin user test: POST /admin/users/:id/revoke-sessions", () => {
  it("berhasil mencabut seluruh sesi aktif pengguna (200)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockUser);
    (UserRepository.revokeAllUserSessions as Mock).mockResolvedValue(3);

    const res = await request(app).post(`/v1/api/admin/users/${mockUser.id}/revoke-sessions`).set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Semua sesi pengguna berhasil dicabut");
    expect(res.body.data.userId).toBe(mockUser.id);
    expect(res.body.data.revokedCount).toBe(3);
    expect(UserRepository.revokeAllUserSessions).toHaveBeenCalledWith(mockUser.id);
  });

  it("mengembalikan 404 jika pengguna tidak ditemukan (404)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).post(`/v1/api/admin/users/non-existent/revoke-sessions`).set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).post(`/v1/api/admin/users/${mockUser.id}/revoke-sessions`).set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("menolak akses tanpa token autentikasi (401)", async () => {
    const res = await request(app).post(`/v1/api/admin/users/${mockUser.id}/revoke-sessions`);

    expect(res.status).toBe(401);
  });
});

// ── Admin User Management: DELETE /admin/users/:id ─────────────────────

describe("admin user test: DELETE /admin/users/:id", () => {
  it("berhasil menghapus pengguna secara permanen (200)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockUser);
    (UserRepository.deleteById as Mock).mockResolvedValue(mockUser);

    const res = await request(app).delete(`/v1/api/admin/users/${mockUser.id}`).set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Pengguna berhasil dihapus secara permanen");
    expect(UserRepository.deleteById).toHaveBeenCalledWith(mockUser.id);
  });

  it("menolak jika admin mencoba menghapus akunnya sendiri (403)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockAdmin);

    const res = await request(app).delete(`/v1/api/admin/users/${mockAdmin.id}`).set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Kamu tidak dapat menghapus akunmu sendiri");
    expect(UserRepository.deleteById).not.toHaveBeenCalled();
  });

  it("mengembalikan 404 jika pengguna tidak ditemukan (404)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/v1/api/admin/users/non-existent`).set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).delete(`/v1/api/admin/users/${mockUser.id}`).set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("menolak akses tanpa token autentikasi (401)", async () => {
    const res = await request(app).delete(`/v1/api/admin/users/${mockUser.id}`);

    expect(res.status).toBe(401);
  });
});
