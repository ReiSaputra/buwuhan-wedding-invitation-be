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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validAuthToken = jwt.sign({ id: mockUser.id, role: mockUser.role, planTier: mockUser.planTier }, process.env.JWT_SECRET, { expiresIn: "1d" });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("user test: GET /users/me", () => {
  it("berhasil mengambil profil pengguna login (200)", async () => {
    (UserRepository.findById as Mock).mockResolvedValue(mockUser);

    const res = await request(app).get("/v1/api/users/me").set("Authorization", `Bearer ${validAuthToken}`);

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

    const res = await request(app).get("/v1/api/users/me").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });
});
