import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { dashboardRouter } from "../../src/modules/dashboard/dashboard.routes";
import { DashboardRepository } from "../../src/modules/dashboard/dashboard.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(DashboardRepository, "findUserWithDetails");
  vi.spyOn(DashboardRepository, "findInvitationsWithStats");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", dashboardRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockUser = {
  id: "user-123",
  fullName: "Fathur Saputra",
  planTier: "FREE" as const,
};

const validAuthToken = jwt.sign({ id: mockUser.id, role: "USER", planTier: mockUser.planTier }, process.env.JWT_SECRET, { expiresIn: "1d" });

const mockInvitationsWithStats = [
  {
    id: "inv-1",
    title: "Han & Saputra",
    slug: "han-dan-saputra",
    status: "ACTIVE" as const,
    eventDate: new Date("2026-01-18T00:00:00.000Z"),
    eventTime: "07:00 WIB",
    venue: "Grand Ballroom Hotel Indonesia",
    address: "Jl. Sudirman No. 1, Jakarta",
    template: {
      previewImageUrl: "https://storage.buwuhan.com/templates/preview-1.jpg",
    },
    guests: [
      { id: "g-1", isAttended: true },
      { id: "g-2", isAttended: true },
      { id: "g-3", isAttended: false },
      { id: "g-4", isAttended: false },
    ],
  },
  {
    id: "inv-2",
    title: "Ayu & Budi",
    slug: "ayu-dan-budi",
    status: "DRAFT" as const,
    eventDate: null,
    eventTime: null,
    venue: null,
    address: null,
    template: null,
    guests: [],
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("dashboard test: GET /dashboard", () => {
  it("berhasil mengambil ringkasan data dashboard host beserta stats (200)", async () => {
    (DashboardRepository.findUserWithDetails as Mock).mockResolvedValue(mockUser);
    (DashboardRepository.findInvitationsWithStats as Mock).mockResolvedValue(mockInvitationsWithStats);

    const res = await request(app).get("/v1/api/dashboard").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Data dashboard berhasil diambil");
    expect(res.body.data.user.fullName).toBe("Fathur Saputra");
    expect(res.body.data.user.planTier).toBe("FREE");

    // Stats
    expect(res.body.data.stats.totalInvitations).toBe(2);
    expect(res.body.data.stats.totalGuests).toBe(4);
    expect(res.body.data.stats.totalCheckedIn).toBe(2);

    // Invitations
    expect(res.body.data.invitations).toHaveLength(2);
    const inv1 = res.body.data.invitations[0];
    expect(inv1.id).toBe("inv-1");
    expect(inv1.title).toBe("Han & Saputra");
    expect(inv1.status).toBe("ACTIVE");
    expect(inv1.templateThumbnail).toBe("https://storage.buwuhan.com/templates/preview-1.jpg");
    expect(inv1.totalGuests).toBe(4);
    expect(inv1.totalCheckedIn).toBe(2);
    expect(inv1.checkInPercentage).toBe(50);

    const inv2 = res.body.data.invitations[1];
    expect(inv2.id).toBe("inv-2");
    expect(inv2.status).toBe("DRAFT");
    expect(inv2.templateThumbnail).toBeNull();
    expect(inv2.totalGuests).toBe(0);
    expect(inv2.totalCheckedIn).toBe(0);
    expect(inv2.checkInPercentage).toBe(0);
  });

  it("berhasil mengembalikan dashboard kosong jika user belum memiliki undangan (200)", async () => {
    (DashboardRepository.findUserWithDetails as Mock).mockResolvedValue(mockUser);
    (DashboardRepository.findInvitationsWithStats as Mock).mockResolvedValue([]);

    const res = await request(app).get("/v1/api/dashboard").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stats.totalInvitations).toBe(0);
    expect(res.body.data.stats.totalGuests).toBe(0);
    expect(res.body.data.stats.totalCheckedIn).toBe(0);
    expect(res.body.data.invitations).toEqual([]);
  });

  it("menolak akses tanpa token autentikasi (401)", async () => {
    const res = await request(app).get("/v1/api/dashboard");

    expect(res.status).toBe(401);
  });

  it("mengembalikan 404 jika user tidak ditemukan (404)", async () => {
    (DashboardRepository.findUserWithDetails as Mock).mockResolvedValue(null);

    const res = await request(app).get("/v1/api/dashboard").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });
});
