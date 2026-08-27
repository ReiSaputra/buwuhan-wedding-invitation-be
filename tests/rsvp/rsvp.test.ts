import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { rsvpRouter } from "../../src/modules/rsvp/rsvp.routes";
import { RSVPRepository } from "../../src/modules/rsvp/rsvp.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(RSVPRepository, "findPublishedInvitationBySlug");
  vi.spyOn(RSVPRepository, "findInvitationByIdAndOwner");
  vi.spyOn(RSVPRepository, "findGuestByQrCode");
  vi.spyOn(RSVPRepository, "createGuestForPublic");
  vi.spyOn(RSVPRepository, "upsertRSVP");
  vi.spyOn(RSVPRepository, "findManyByInvitationId");
  vi.spyOn(RSVPRepository, "findWishesByInvitationId");
  vi.spyOn(RSVPRepository, "findByIdAndInvitationId");
  vi.spyOn(RSVPRepository, "delete");
  vi.spyOn(RSVPRepository, "getStats");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", rsvpRouter);
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
    { id: "c-1", name: "Ayu", type: "BRIDE" as const, fatherName: "Bambang", motherName: "Siti", invitationId: "inv-123" },
    { id: "c-2", name: "Budi", type: "GROOM" as const, fatherName: "Joko", motherName: "Sri", invitationId: "inv-123" },
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

const mockRSVP = {
  id: "rsvp-123",
  status: "CONFIRMED" as const,
  reservation: 2,
  message: "Selamat yaa Ayu & Budi!",
  guestId: mockGuest.id,
  guest: mockGuest,
  invitationId: mockInvitation.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("rsvp test: submit RSVP (Public)", () => {
  it("berhasil submit RSVP CONFIRMED oleh tamu terdaftar via qrCode (200)", async () => {
    (RSVPRepository.findPublishedInvitationBySlug as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.findGuestByQrCode as Mock).mockResolvedValue(mockGuest);
    (RSVPRepository.upsertRSVP as Mock).mockResolvedValue(mockRSVP);

    const res = await request(app)
      .post(`/v1/api/public/invitations/${mockInvitation.slug}/rsvp`)
      .send({
        qrCode: mockGuest.qrCode,
        status: "CONFIRMED",
        reservation: 2,
        message: "Selamat yaa Ayu & Budi!",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("RSVP submitted successfully");
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(res.body.data.guestName).toBe(mockGuest.name);
    expect(res.body.data.reservation).toBe(2);
  });

  it("berhasil submit RSVP DECLINED (reservation otomatis 0) (200)", async () => {
    (RSVPRepository.findPublishedInvitationBySlug as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.findGuestByQrCode as Mock).mockResolvedValue(mockGuest);
    (RSVPRepository.upsertRSVP as Mock).mockResolvedValue({
      ...mockRSVP,
      status: "DECLINED",
      reservation: 0,
      message: "Maaf belum bisa hadir, selamat ya!",
    });

    const res = await request(app)
      .post(`/v1/api/public/invitations/${mockInvitation.slug}/rsvp`)
      .send({
        qrCode: mockGuest.qrCode,
        status: "DECLINED",
        reservation: 3, // dikirim 3 tapi service otomatis jadikan 0
        message: "Maaf belum bisa hadir, selamat ya!",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("DECLINED");
    expect(res.body.data.reservation).toBe(0);
  });

  it("berhasil submit RSVP publik baru dengan menginput nama (200)", async () => {
    (RSVPRepository.findPublishedInvitationBySlug as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.createGuestForPublic as Mock).mockResolvedValue({
      ...mockGuest,
      id: "guest-new",
      name: "Tamu Publik",
      category: "Publik",
    });
    (RSVPRepository.upsertRSVP as Mock).mockResolvedValue({
      ...mockRSVP,
      id: "rsvp-new",
      guest: { ...mockGuest, id: "guest-new", name: "Tamu Publik" },
    });

    const res = await request(app)
      .post(`/v1/api/public/invitations/${mockInvitation.slug}/rsvp`)
      .send({
        name: "Tamu Publik",
        status: "CONFIRMED",
        reservation: 1,
        message: "Selamat yaa!",
      });

    expect(res.status).toBe(200);
    expect(RSVPRepository.createGuestForPublic).toHaveBeenCalled();
  });

  it("menolak submit RSVP jika tidak menyertakan qrCode maupun name (400)", async () => {
    const res = await request(app)
      .post(`/v1/api/public/invitations/${mockInvitation.slug}/rsvp`)
      .send({
        status: "CONFIRMED",
      });

    expect(res.status).toBe(400);
  });

  it("menolak submit RSVP jika status bukan CONFIRMED atau DECLINED (400)", async () => {
    const res = await request(app)
      .post(`/v1/api/public/invitations/${mockInvitation.slug}/rsvp`)
      .send({
        name: "Tamu",
        status: "MAYBE",
      });

    expect(res.status).toBe(400);
  });

  it("menolak submit RSVP jika undangan tidak ditemukan atau belum dipublish (404)", async () => {
    (RSVPRepository.findPublishedInvitationBySlug as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`/v1/api/public/invitations/slug-tidak-ada/rsvp`)
      .send({
        name: "Tamu",
        status: "CONFIRMED",
      });

    expect(res.status).toBe(404);
  });
});

describe("rsvp test: list wishes (Public)", () => {
  it("berhasil mengambil daftar ucapan dan doa restu (200)", async () => {
    (RSVPRepository.findPublishedInvitationBySlug as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.findWishesByInvitationId as Mock).mockResolvedValue([mockRSVP]);

    const res = await request(app).get(`/v1/api/public/invitations/${mockInvitation.slug}/wishes?limit=10&page=1`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Wishes retrieved successfully");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].guestName).toBe(mockGuest.name);
    expect(res.body.data[0].message).toBe(mockRSVP.message);
  });

  it("menolak wishes jika undangan tidak ditemukan (404)", async () => {
    (RSVPRepository.findPublishedInvitationBySlug as Mock).mockResolvedValue(null);

    const res = await request(app).get(`/v1/api/public/invitations/slug-salah/wishes`);

    expect(res.status).toBe(404);
  });
});

describe("rsvp test: host dashboard list & stats", () => {
  it("berhasil mengambil list RSVP milik undangan (200)", async () => {
    (RSVPRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.findManyByInvitationId as Mock).mockResolvedValue([mockRSVP]);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/rsvps?status=CONFIRMED`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(mockRSVP.id);
  });

  it("berhasil mengambil statistik konfirmasi kehadiran RSVP (200)", async () => {
    (RSVPRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.getStats as Mock).mockResolvedValue({
      totalGuests: 100,
      totalResponded: 80,
      totalPending: 20,
      totalConfirmed: 70,
      totalDeclined: 10,
      totalPaxConfirmed: 135,
    });

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/rsvps/stats`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalConfirmed).toBe(70);
    expect(res.body.data.totalPaxConfirmed).toBe(135);
  });

  it("menolak list RSVP jika undangan bukan milik requester (404)", async () => {
    (RSVPRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/invitations/inv-bukan-milik/rsvps`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });

  it("menolak list RSVP jika tidak ada auth token (401)", async () => {
    const res = await request(app).get(`/v1/api/invitations/${mockInvitation.id}/rsvps`);

    expect(res.status).toBe(401);
  });
});

describe("rsvp test: delete RSVP", () => {
  it("berhasil menghapus data RSVP (200)", async () => {
    (RSVPRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.findByIdAndInvitationId as Mock).mockResolvedValue(mockRSVP);
    (RSVPRepository.delete as Mock).mockResolvedValue(mockRSVP);

    const res = await request(app)
      .delete(`/v1/api/invitations/${mockInvitation.id}/rsvps/${mockRSVP.id}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("RSVP deleted successfully");
  });

  it("menolak hapus RSVP jika data RSVP tidak ditemukan (404)", async () => {
    (RSVPRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (RSVPRepository.findByIdAndInvitationId as Mock).mockResolvedValue(null);

    const res = await request(app)
      .delete(`/v1/api/invitations/${mockInvitation.id}/rsvps/rsvp-palsu`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});
