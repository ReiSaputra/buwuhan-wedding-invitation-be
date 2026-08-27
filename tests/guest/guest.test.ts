import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { guestRouter } from "../../src/modules/guest/guest.routes";
import { GuestRepository } from "../../src/modules/guest/guest.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(GuestRepository, "findInvitationByIdAndOwner");
  vi.spyOn(GuestRepository, "findInvitationWithCouples");
  vi.spyOn(GuestRepository, "create");
  vi.spyOn(GuestRepository, "createMany");
  vi.spyOn(GuestRepository, "findById");
  vi.spyOn(GuestRepository, "findByIdAndInvitationId");
  vi.spyOn(GuestRepository, "findByQrCodeAndInvitationId");
  vi.spyOn(GuestRepository, "findByQrCode");
  vi.spyOn(GuestRepository, "findManyByInvitationId");
  vi.spyOn(GuestRepository, "update");
  vi.spyOn(GuestRepository, "delete");
  vi.spyOn(GuestRepository, "checkIn");
  vi.spyOn(GuestRepository, "checkOut");
  vi.spyOn(GuestRepository, "getStats");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", guestRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockUser = {
  id: "owner-user-123",
  role: "USER" as const,
  planTier: "FREE" as const,
};

const validAuthToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: "1d" });

const mockInvitation = {
  id: "inv-123",
  title: "Pernikahan Ayu & Budi",
  slug: "ayu-dan-budi",
  isPublished: true,
  publishedAt: new Date(),
  additionalInfo: {},
  templateId: null,
  ownerId: mockUser.id,
  couples: [
    { id: "c-1", name: "Ayu Lestari", type: "BRIDE" as const, fatherName: "Bambang", motherName: "Siti", invitationId: "inv-123" },
    { id: "c-2", name: "Budi Santoso", type: "GROOM" as const, fatherName: "Joko", motherName: "Sri", invitationId: "inv-123" },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGuest = {
  id: "guest-123",
  name: "Rizky Ramadhan",
  category: "Teman",
  phone: "081234567890",
  email: "rizky@example.com",
  notes: "Meja 4",
  qrCode: "7B3A9C12E4F0",
  paxCount: 2,
  paxActual: null,
  isAttended: false,
  checkedInAt: null,
  checkedOutAt: null,
  invitationId: mockInvitation.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("guest test: create guest", () => {
  it("berhasil membuat tamu baru jika data valid dan user adalah owner undangan (201)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.create as Mock).mockResolvedValue(mockGuest);

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        name: "Rizky Ramadhan",
        category: "Teman",
        phone: "081234567890",
        email: "rizky@example.com",
        notes: "Meja 4",
        paxCount: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Guest created successfully");
    expect(res.body.data.name).toBe("Rizky Ramadhan");
    expect(res.body.data.qrCode).toBe(mockGuest.qrCode);
    expect(res.body.data.invitationUrl).toContain("ayu-dan-budi");
    expect(res.body.data.whatsappShareUrl).toContain("api.whatsapp.com");
  });

  it("menolak tambah tamu jika nama kosong (400)", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        name: "",
      });

    expect(res.status).toBe(400);
    expect(GuestRepository.create).not.toHaveBeenCalled();
  });

  it("menolak tambah tamu jika undangan bukan milik user atau tidak ada (404)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`/v1/api/invitations/inv-bukan-milik/guests`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        name: "Tamu Liar",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Undangan tidak ditemukan");
  });

  it("menolak tambah tamu jika tidak ada token autentikasi (401)", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests`)
      .send({
        name: "Tamu Tanpa Auth",
      });

    expect(res.status).toBe(401);
  });
});

describe("guest test: bulk create guests", () => {
  it("berhasil bulk create banyak tamu sekaligus (201)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.createMany as Mock).mockResolvedValue([mockGuest, { ...mockGuest, id: "guest-124", name: "Dina" }]);

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests/bulk`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        guests: [
          { name: "Rizky Ramadhan", category: "Teman" },
          { name: "Dina", category: "Keluarga" },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(2);
    expect(GuestRepository.createMany).toHaveBeenCalled();
  });

  it("menolak bulk create jika array guests kosong (400)", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests/bulk`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        guests: [],
      });

    expect(res.status).toBe(400);
  });
});

describe("guest test: list & detail guest", () => {
  it("berhasil mengambil daftar tamu undangan (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findManyByInvitationId as Mock).mockResolvedValue([mockGuest]);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/guests?category=Teman&search=Rizky`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(mockGuest.id);
  });

  it("berhasil mengambil detail satu tamu (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByIdAndInvitationId as Mock).mockResolvedValue(mockGuest);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/guests/${mockGuest.id}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(mockGuest.name);
  });

  it("menolak detail tamu jika data tamu tidak ditemukan (404)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByIdAndInvitationId as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/guests/id-palsu`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Data tamu tidak ditemukan");
  });
});

describe("guest test: update & delete guest", () => {
  it("berhasil mengupdate data tamu (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByIdAndInvitationId as Mock).mockResolvedValue(mockGuest);
    (GuestRepository.update as Mock).mockResolvedValue({ ...mockGuest, name: "Rizky Ramadhan SE" });

    const res = await request(app)
      .patch(`/v1/api/invitations/${mockInvitation.id}/guests/${mockGuest.id}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        name: "Rizky Ramadhan SE",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Rizky Ramadhan SE");
  });

  it("berhasil menghapus data tamu (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByIdAndInvitationId as Mock).mockResolvedValue(mockGuest);
    (GuestRepository.delete as Mock).mockResolvedValue(mockGuest);

    const res = await request(app)
      .delete(`/v1/api/invitations/${mockInvitation.id}/guests/${mockGuest.id}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Guest deleted successfully");
  });
});

describe("guest test: check-in & check-out", () => {
  it("berhasil check-in tamu via QR code (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByQrCodeAndInvitationId as Mock).mockResolvedValue(mockGuest);
    (GuestRepository.checkIn as Mock).mockResolvedValue({
      ...mockGuest,
      isAttended: true,
      checkedInAt: new Date(),
      paxActual: 2,
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests/check-in`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        qrCode: mockGuest.qrCode,
        paxActual: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Guest checked in successfully");
    expect(res.body.data.isAttended).toBe(true);
    expect(res.body.data.paxActual).toBe(2);
  });

  it("berhasil check-out tamu via QR code (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByQrCodeAndInvitationId as Mock).mockResolvedValue({
      ...mockGuest,
      isAttended: true,
      checkedInAt: new Date(),
    });
    (GuestRepository.checkOut as Mock).mockResolvedValue({
      ...mockGuest,
      isAttended: true,
      checkedOutAt: new Date(),
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests/check-out`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        qrCode: mockGuest.qrCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Guest checked out successfully");
  });

  it("menolak check-in jika QR code tidak ditemukan (404)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.findByQrCodeAndInvitationId as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/guests/check-in`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        qrCode: "QR_TIDAK_ADA",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Data tamu dengan kode tersebut tidak ditemukan");
  });
});

describe("guest test: statistics & public qr verify", () => {
  it("berhasil mengambil statistik kehadiran tamu (200)", async () => {
    (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (GuestRepository.getStats as Mock).mockResolvedValue({
      totalGuests: 50,
      totalAttended: 35,
      totalPending: 15,
      totalPaxExpected: 80,
      totalPaxActual: 60,
      byCategory: {
        Teman: { total: 30, attended: 20 },
        Keluarga: { total: 20, attended: 15 },
      },
    });

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/guests/stats`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalGuests).toBe(50);
    expect(res.body.data.totalAttended).toBe(35);
  });

  it("berhasil verifikasi QR code tamu publik (200)", async () => {
    (GuestRepository.findByQrCode as Mock).mockResolvedValue({
      ...mockGuest,
      invitation: mockInvitation,
    });

    const res = await request(app).get(`/v1/api/public/invitations/${mockInvitation.slug}/guests/verify/${mockGuest.qrCode}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(mockGuest.name);
    expect(res.body.data.qrCode).toBe(mockGuest.qrCode);
  });

  it("menolak verifikasi QR code jika slug tidak cocok / tidak published (404)", async () => {
    (GuestRepository.findByQrCode as Mock).mockResolvedValue({
      ...mockGuest,
      invitation: { ...mockInvitation, slug: "slug-lain", isPublished: false },
    });

    const res = await request(app).get(`/v1/api/public/invitations/slug-salah/guests/verify/${mockGuest.qrCode}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Undangan atau data tamu tidak ditemukan");
  });
});
