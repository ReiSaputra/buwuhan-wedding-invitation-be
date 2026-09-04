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
  vi.spyOn(DashboardRepository, "getPlatformStats");
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

const mockAdmin = {
  id: "admin-999",
  fullName: "Admin Buwuhan",
  planTier: "MAX" as const,
  role: "ADMIN" as const,
};

const userAuthToken = jwt.sign(
  { id: mockUser.id, role: "USER", planTier: mockUser.planTier },
  process.env.JWT_SECRET,
  { expiresIn: "1d" },
);

const adminAuthToken = jwt.sign(
  { id: mockAdmin.id, role: mockAdmin.role, planTier: mockAdmin.planTier },
  process.env.JWT_SECRET,
  { expiresIn: "1d" },
);

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

const mockRawPlatformStats = {
  usersByTier: [
    { planTier: "FREE" as const, _count: { _all: 10 } },
    { planTier: "PRO" as const, _count: { _all: 5 } },
    { planTier: "MAX" as const, _count: { _all: 2 } },
  ],
  usersByRole: [
    { role: "USER" as const, _count: { _all: 16 } },
    { role: "ADMIN" as const, _count: { _all: 1 } },
  ],
  invitationsByStatus: [
    { status: "ACTIVE" as const, _count: { _all: 12 } },
    { status: "DRAFT" as const, _count: { _all: 4 } },
    { status: "COMPLETED" as const, _count: { _all: 2 } },
  ],
  invitationsByCategory: [
    { eventCategory: "WEDDING" as const, _count: { _all: 15 } },
    { eventCategory: "KHITANAN" as const, _count: { _all: 3 } },
  ],
  totalGuests: 250,
  totalCheckedIn: 180,
  rsvpsByStatus: [
    { status: "CONFIRMED" as const, _count: { _all: 150 } },
    { status: "DECLINED" as const, _count: { _all: 30 } },
  ],
  topTemplates: [
    {
      id: "tpl-royal-floral",
      name: "Royal Floral",
      slug: "royal-floral",
      tier: "FREE" as const,
      previewImageUrl: "https://storage.buwuhan.com/templates/royal-floral.jpg",
      _count: { invitations: 10 },
    },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ── Host Dashboard: GET /dashboard ────────────────────────────────────

describe("dashboard test: GET /dashboard", () => {
  it("berhasil mengambil ringkasan data dashboard host beserta stats (200)", async () => {
    (DashboardRepository.findUserWithDetails as Mock).mockResolvedValue(mockUser);
    (DashboardRepository.findInvitationsWithStats as Mock).mockResolvedValue(mockInvitationsWithStats);

    const res = await request(app).get("/v1/api/dashboard").set("Authorization", `Bearer ${userAuthToken}`);

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

    const res = await request(app).get("/v1/api/dashboard").set("Authorization", `Bearer ${userAuthToken}`);

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

    const res = await request(app).get("/v1/api/dashboard").set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Pengguna tidak ditemukan");
  });
});

// ── Admin Global Analytics: GET /admin/dashboard/stats ────────────────

describe("admin dashboard test: GET /admin/dashboard/stats", () => {
  it("berhasil mengambil seluruh metrik agregat statistik platform global (200)", async () => {
    (DashboardRepository.getPlatformStats as Mock).mockResolvedValue(mockRawPlatformStats);

    const res = await request(app)
      .get("/v1/api/admin/dashboard/stats")
      .set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Statistik platform berhasil diambil");

    // Users
    expect(res.body.data.users.total).toBe(17);
    expect(res.body.data.users.byTier).toEqual({ FREE: 10, PRO: 5, MAX: 2 });
    expect(res.body.data.users.byRole).toEqual({ USER: 16, ADMIN: 1 });

    // Invitations
    expect(res.body.data.invitations.total).toBe(18);
    expect(res.body.data.invitations.byStatus).toEqual({ DRAFT: 4, ACTIVE: 12, COMPLETED: 2 });
    expect(res.body.data.invitations.byCategory.WEDDING).toBe(15);
    expect(res.body.data.invitations.byCategory.KHITANAN).toBe(3);
    expect(res.body.data.invitations.byCategory.RASULAN).toBe(0);
    expect(res.body.data.invitations.byCategory.AQIQAH).toBe(0);

    // Guests & RSVP
    expect(res.body.data.guests.totalGuests).toBe(250);
    expect(res.body.data.guests.totalCheckedIn).toBe(180);
    expect(res.body.data.guests.totalRsvps).toBe(180);
    expect(res.body.data.guests.byRsvpStatus).toEqual({ CONFIRMED: 150, DECLINED: 30 });

    // Top Templates
    expect(res.body.data.topTemplates).toHaveLength(1);
    expect(res.body.data.topTemplates[0]).toEqual({
      id: "tpl-royal-floral",
      name: "Royal Floral",
      slug: "royal-floral",
      tier: "FREE",
      previewImageUrl: "https://storage.buwuhan.com/templates/royal-floral.jpg",
      usageCount: 10,
    });
  });

  it("menolak akses jika role pengguna adalah USER biasa (403)", async () => {
    const res = await request(app)
      .get("/v1/api/admin/dashboard/stats")
      .set("Authorization", `Bearer ${userAuthToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Kamu tidak punya akses untuk melakukan aksi ini");
  });

  it("menolak akses tanpa token autentikasi (401)", async () => {
    const res = await request(app).get("/v1/api/admin/dashboard/stats");

    expect(res.status).toBe(401);
  });
});
