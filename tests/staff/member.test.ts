import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { memberRouter } from "../../src/modules/member/member.routes";
import { guestRouter } from "../../src/modules/guest/guest.routes";
import { invitationRouter } from "../../src/modules/invitation/invitation.routes";
import { MemberRepository } from "../../src/modules/member/member.repository";
import { GuestRepository } from "../../src/modules/guest/guest.repository";
import { InvitationRepository } from "../../src/modules/invitation/invitation.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";
import { mailer } from "../../src/lib/mailer";

process.env.JWT_SECRET = "test-jwt-secret";
process.env.FRONTEND_URL = "http://localhost:5173";

beforeAll(() => {
  vi.spyOn(MemberRepository, "findInvitationById");
  vi.spyOn(MemberRepository, "findMemberRole");
  vi.spyOn(MemberRepository, "findByInvitationAndEmail");
  vi.spyOn(MemberRepository, "findById");
  vi.spyOn(MemberRepository, "findByTokenHash");
  vi.spyOn(MemberRepository, "findManyByInvitationId");
  vi.spyOn(MemberRepository, "create");
  vi.spyOn(MemberRepository, "createInstantMember");
  vi.spyOn(MemberRepository, "update");
  vi.spyOn(MemberRepository, "updateToken");
  vi.spyOn(MemberRepository, "acceptInvite");
  vi.spyOn(MemberRepository, "delete");
  vi.spyOn(MemberRepository, "countByInvitationId");

  vi.spyOn(GuestRepository, "findInvitationByIdAndOwner");
  vi.spyOn(GuestRepository, "findManyByInvitationId");
  vi.spyOn(GuestRepository, "create");
  vi.spyOn(GuestRepository, "checkIn");
  vi.spyOn(GuestRepository, "checkOut");
  vi.spyOn(GuestRepository, "findByIdAndInvitationId");
  vi.spyOn(GuestRepository, "findByQrCodeAndInvitationId");
  vi.spyOn(GuestRepository, "countByInvitationId");

  vi.spyOn(InvitationRepository, "findByIdAndOwner");
  vi.spyOn(InvitationRepository, "update");
  vi.spyOn(InvitationRepository, "deleteById");

  mailer.setTransporter(null);
  vi.spyOn(mailer, "sendMail").mockResolvedValue({ messageId: "mock-member-mail-id" });
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", memberRouter);
  app.use("/v1/api", guestRouter);
  app.use("/v1/api", invitationRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockOwnerUser = {
  id: "owner-user-123",
  role: "USER" as const,
  planTier: "FREE" as const,
};

const mockAdminMemberUser = {
  id: "admin-member-user-456",
  role: "USER" as const,
  planTier: "FREE" as const,
};

const mockUsherMemberUser = {
  id: "usher-member-user-789",
  role: "USER" as const,
  planTier: "FREE" as const,
};

const mockStrangerUser = {
  id: "stranger-user-999",
  role: "USER" as const,
  planTier: "FREE" as const,
};

const ownerToken = jwt.sign(mockOwnerUser, process.env.JWT_SECRET, { expiresIn: "1d" });
const adminMemberToken = jwt.sign(mockAdminMemberUser, process.env.JWT_SECRET, { expiresIn: "1d" });
const usherMemberToken = jwt.sign(mockUsherMemberUser, process.env.JWT_SECRET, { expiresIn: "1d" });
const strangerToken = jwt.sign(mockStrangerUser, process.env.JWT_SECRET, { expiresIn: "1d" });

const mockInvitation = {
  id: "inv-123",
  title: "Pernikahan Romeo & Juliet",
  slug: "romeo-juliet",
  ownerId: mockOwnerUser.id,
  status: "ACTIVE" as const,
  eventCategory: "WEDDING" as const,
  publishedAt: new Date(),
  eventDate: new Date(),
  eventTime: "09:00",
  venue: "Gedung Serbaguna",
  address: "Jl. Cinta No. 1",
  giftAddress: null,
  additionalInfo: {},
  templateId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: {
    id: mockOwnerUser.id,
    fullName: "Romeo Montague",
    email: "romeo@example.com",
  },
};

const mockMember = {
  id: "member-123",
  invitationId: mockInvitation.id,
  userId: null,
  email: "budi.usher@example.com",
  name: "Budi Petugas",
  role: "USER" as const,
  inviteTokenHash: "dummy-token-hash",
  inviteTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  invitedAt: new Date(),
  acceptedAt: null,
  revokedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  invitation: {
    id: mockInvitation.id,
    slug: mockInvitation.slug,
    title: mockInvitation.title,
    ownerId: mockInvitation.ownerId,
  },
};

beforeEach(() => {
  vi.resetAllMocks();

  mailer.setTransporter({
    sendMail: vi.fn().mockResolvedValue({ messageId: "mock-member-mail-id", accepted: [], rejected: [] }),
  } as never);
  vi.spyOn(mailer, "sendMail").mockResolvedValue({ messageId: "mock-member-mail-id" });

  // Default mock role mapping
  (MemberRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
  (MemberRepository.findMemberRole as Mock).mockImplementation(async (invitationId: string, userId: string) => {
    if (invitationId !== mockInvitation.id) return null;
    if (userId === mockOwnerUser.id) return "OWNER";
    if (userId === mockAdminMemberUser.id) return "ADMIN";
    if (userId === mockUsherMemberUser.id) return "USER";
    return null;
  });
});

describe("Member Service: Invite Member", () => {
  it("harus berhasil mengundang petugas baru (role USER) oleh OWNER", async () => {
    (MemberRepository.findByInvitationAndEmail as Mock).mockResolvedValue(null);
    (MemberRepository.create as Mock).mockResolvedValue({
      ...mockMember,
      role: "USER",
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        email: "budi.usher@example.com",
        name: "Budi Petugas",
        role: "USER",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Petugas berhasil diundang");
    expect(res.body.data.email).toBe("budi.usher@example.com");
    expect(res.body.data.role).toBe("USER");
    expect(mailer.sendMail).toHaveBeenCalledTimes(1);
  });

  it("harus menolak jika mencoba mengundang email pemilik sendiri", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        email: mockInvitation.owner.email,
        name: "Romeo Owner",
        role: "ADMIN",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Pemilik undangan");
  });

  it("harus menolak jika petugas sudah menjadi anggota aktif", async () => {
    (MemberRepository.findByInvitationAndEmail as Mock).mockResolvedValue({
      ...mockMember,
      acceptedAt: new Date(),
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        email: "budi.usher@example.com",
        name: "Budi Petugas",
        role: "USER",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("anggota aktif");
  });

  it("harus menolak (403) jika bukan OWNER yang mengundang", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${adminMemberToken}`)
      .send({
        email: "staff2@example.com",
        name: "Staff Baru",
        role: "USER",
      });

    expect(res.status).toBe(403);
  });
});

describe("Member Service: Resend Invite", () => {
  it("harus berhasil mengirim ulang undangan email", async () => {
    (MemberRepository.findById as Mock).mockResolvedValue(mockMember);
    (MemberRepository.updateToken as Mock).mockResolvedValue(mockMember);

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members/${mockMember.id}/resend`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Undangan petugas berhasil dikirim ulang");
    expect(mailer.sendMail).toHaveBeenCalledTimes(1);
  });

  it("harus menolak (409) jika member sudah accepted", async () => {
    (MemberRepository.findById as Mock).mockResolvedValue({
      ...mockMember,
      acceptedAt: new Date(),
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members/${mockMember.id}/resend`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(409);
  });
});

describe("Member Service: Accept Invite Token", () => {
  it("harus berhasil menerima undangan dengan token valid", async () => {
    (MemberRepository.findByTokenHash as Mock).mockResolvedValue({
      ...mockMember,
      inviteTokenExpiresAt: new Date(Date.now() + 100000),
      acceptedAt: null,
      revokedAt: null,
    });
    (MemberRepository.acceptInvite as Mock).mockResolvedValue({
      ...mockMember,
      userId: mockUsherMemberUser.id,
      acceptedAt: new Date(),
      invitation: {
        id: mockInvitation.id,
        slug: mockInvitation.slug,
        title: mockInvitation.title,
      },
    });

    const res = await request(app)
      .post("/v1/api/members/accept")
      .set("Authorization", `Bearer ${usherMemberToken}`)
      .send({ token: "raw-secret-token-123" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Undangan petugas berhasil diterima");
    expect(res.body.data.role).toBe("USER");
  });

  it("harus menolak (404) jika token tidak ditemukan", async () => {
    (MemberRepository.findByTokenHash as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/v1/api/members/accept")
      .set("Authorization", `Bearer ${usherMemberToken}`)
      .send({ token: "invalid-token" });

    expect(res.status).toBe(404);
  });

  it("harus menolak (422) jika token sudah kedaluwarsa", async () => {
    (MemberRepository.findByTokenHash as Mock).mockResolvedValue({
      ...mockMember,
      inviteTokenExpiresAt: new Date(Date.now() - 100000),
      acceptedAt: null,
      revokedAt: null,
    });

    const res = await request(app)
      .post("/v1/api/members/accept")
      .set("Authorization", `Bearer ${usherMemberToken}`)
      .send({ token: "expired-token" });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("kedaluwarsa");
  });
});

describe("Member Service: List, Detail, Update Role, Remove", () => {
  it("OWNER dan ADMIN dapat melihat daftar petugas", async () => {
    (MemberRepository.findManyByInvitationId as Mock).mockResolvedValue([mockMember]);

    const resOwner = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(resOwner.status).toBe(200);
    expect(resOwner.body.data.length).toBe(1);

    const resAdmin = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${adminMemberToken}`);

    expect(resAdmin.status).toBe(200);
  });

  it("Petugas USER (usher) ditolak (403) saat membaca daftar petugas", async () => {
    const resUsher = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/members`)
      .set("Authorization", `Bearer ${usherMemberToken}`);

    expect(resUsher.status).toBe(403);
  });

  it("OWNER dapat mengupdate role petugas", async () => {
    (MemberRepository.findById as Mock).mockResolvedValue(mockMember);
    (MemberRepository.update as Mock).mockResolvedValue({
      ...mockMember,
      role: "ADMIN",
    });

    const res = await request(app)
      .patch(`/v1/api/invitations/${mockInvitation.id}/members/${mockMember.id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ role: "ADMIN" });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("ADMIN");
  });

  it("ADMIN ditolak (403) saat mencoba mengubah role petugas", async () => {
    const res = await request(app)
      .patch(`/v1/api/invitations/${mockInvitation.id}/members/${mockMember.id}`)
      .set("Authorization", `Bearer ${adminMemberToken}`)
      .send({ role: "ADMIN" });

    expect(res.status).toBe(403);
  });

  it("OWNER dapat menghapus petugas", async () => {
    (MemberRepository.findById as Mock).mockResolvedValue(mockMember);
    (MemberRepository.delete as Mock).mockResolvedValue(mockMember);

    const res = await request(app)
      .delete(`/v1/api/invitations/${mockInvitation.id}/members/${mockMember.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  it("ADMIN ditolak (403) saat mencoba menghapus petugas", async () => {
    const res = await request(app)
      .delete(`/v1/api/invitations/${mockInvitation.id}/members/${mockMember.id}`)
      .set("Authorization", `Bearer ${adminMemberToken}`);

    expect(res.status).toBe(403);
  });
});

describe("Matriks Izin Role (RBAC Matrix Verification)", () => {
  describe("Peran USER (Usher / Petugas Penerima Tamu)", () => {
    it("diizinkan melihat daftar tamu", async () => {
      (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
      (GuestRepository.findManyByInvitationId as Mock).mockResolvedValue([]);

      const res = await request(app)
        .get(`/v1/api/invitations/${mockInvitation.id}/guests`)
        .set("Authorization", `Bearer ${usherMemberToken}`);

      expect(res.status).toBe(200);
    });

    it("diizinkan melakukan check-in tamu", async () => {
      (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
      (GuestRepository.findByQrCodeAndInvitationId as Mock).mockResolvedValue({
        id: "guest-123",
        invitationId: mockInvitation.id,
        name: "Tamu Test",
        isAttended: false,
        qrCode: "QR123",
        paxCount: 1,
      });
      (GuestRepository.checkIn as Mock).mockResolvedValue({
        id: "guest-123",
        invitationId: mockInvitation.id,
        name: "Tamu Test",
        isAttended: true,
        checkedInAt: new Date(),
        checkedOutAt: null,
        qrCode: "QR123",
        paxCount: 1,
        paxActual: 1,
      });

      const res = await request(app)
        .post(`/v1/api/invitations/${mockInvitation.id}/guests/check-in`)
        .set("Authorization", `Bearer ${usherMemberToken}`)
        .send({ qrCode: "QR123" });

      expect(res.status).toBe(200);
    });

    it("ditolak (403) saat mencoba membuat tamu baru", async () => {
      const res = await request(app)
        .post(`/v1/api/invitations/${mockInvitation.id}/guests`)
        .set("Authorization", `Bearer ${usherMemberToken}`)
        .send({ name: "Tamu Ilegal" });

      expect(res.status).toBe(403);
    });

    it("ditolak (403) saat mencoba mengedit konten undangan", async () => {
      const res = await request(app)
        .patch(`/v1/api/invitations/${mockInvitation.id}`)
        .set("Authorization", `Bearer ${usherMemberToken}`)
        .send({ title: "Judul Baru" });

      expect(res.status).toBe(403);
    });
  });

  describe("Peran ADMIN (Co-host)", () => {
    it("diizinkan membuat tamu baru", async () => {
      (GuestRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
      (GuestRepository.countByInvitationId as Mock).mockResolvedValue(0);
      (GuestRepository.create as Mock).mockResolvedValue({
        id: "guest-new-123",
        name: "Tamu Baru",
        invitationId: mockInvitation.id,
        qrCode: "QRNEW123",
        paxCount: 1,
        isAttended: false,
      });

      const res = await request(app)
        .post(`/v1/api/invitations/${mockInvitation.id}/guests`)
        .set("Authorization", `Bearer ${adminMemberToken}`)
        .send({ name: "Tamu Baru" });

      expect(res.status).toBe(201);
    });

    it("diizinkan mengedit konten undangan", async () => {
      (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
      (InvitationRepository.update as Mock).mockResolvedValue({
        ...mockInvitation,
        title: "Judul Diperbarui Admin",
      });

      const res = await request(app)
        .patch(`/v1/api/invitations/${mockInvitation.id}`)
        .set("Authorization", `Bearer ${adminMemberToken}`)
        .send({ title: "Judul Diperbarui Admin" });

      expect(res.status).toBe(200);
    });

    it("ditolak (403) saat mencoba menghapus undangan", async () => {
      const res = await request(app)
        .delete(`/v1/api/invitations/${mockInvitation.id}`)
        .set("Authorization", `Bearer ${adminMemberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Peran OWNER (Pemilik)", () => {
    it("diizinkan menghapus undangan", async () => {
      (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
      (InvitationRepository.deleteById as Mock).mockResolvedValue(mockInvitation);

      const res = await request(app)
        .delete(`/v1/api/invitations/${mockInvitation.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });
  });
});

describe("Member Service: Instant Access (Magic Link Tanpa Password)", () => {
  it("OWNER dapat membuat magic link untuk petugas tanpa butuh email (role default USER)", async () => {
    (MemberRepository.createInstantMember as Mock).mockResolvedValue({
      id: "instant-member-001",
      invitationId: mockInvitation.id,
      name: "Siti Penerima Tamu",
      role: "USER",
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members/instant-link`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Siti Penerima Tamu", role: "USER" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Link akses petugas berhasil dibuat");
    expect(res.body.data.name).toBe("Siti Penerima Tamu");
    expect(res.body.data.role).toBe("USER");
    expect(res.body.data.accessLink).toContain("/petugas/akses?token=");
  });

  it("Menolak (400) jika request instant link mencoba meminta role ADMIN atau OWNER", async () => {
    const resAdmin = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members/instant-link`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Siti Penerima Tamu", role: "ADMIN" });

    expect(resAdmin.status).toBe(400);

    const resOwner = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/members/instant-link`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Siti Penerima Tamu", role: "OWNER" });

    expect(resOwner.status).toBe(400);
  });


  it("Petugas dapat menukar token magic link menjadi session JWT instan dengan access scope BUWUHAN_ONLY", async () => {
    (MemberRepository.findByTokenHash as Mock).mockResolvedValue({
      id: "instant-member-001",
      invitationId: mockInvitation.id,
      name: "Siti Penerima Tamu",
      role: "USER",
      inviteTokenExpiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      invitation: {
        id: mockInvitation.id,
        title: mockInvitation.title,
        slug: mockInvitation.slug,
      },
    });

    const res = await request(app)
      .post("/v1/api/members/instant-access")
      .send({ token: "sample-valid-magic-token" });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Selamat bertugas");
    expect(res.body.data.sessionToken).toBeDefined();
    expect(res.body.data.access).toEqual({
      type: "INSTANT",
      scope: "BUWUHAN_ONLY",
      invitationId: mockInvitation.id,
      memberId: "instant-member-001",
      invitationRole: "USER",
      canDeleteBuwuhan: false,
    });
    expect(res.body.data.member.name).toBe("Siti Penerima Tamu");
    expect(res.body.data.invitation.id).toBe(mockInvitation.id);

    // Verifikasi JWT payload berisi memberId, role, accessType, dan accessScope
    const decoded = jwt.decode(res.body.data.sessionToken) as any;
    expect(decoded.memberId).toBe("instant-member-001");
    expect(decoded.invitationId).toBe(mockInvitation.id);
    expect(decoded.invitationRole).toBe("USER");
    expect(decoded.accessType).toBe("INSTANT");
    expect(decoded.accessScope).toBe("BUWUHAN_ONLY");
  });

  it("Menolak token instan jika token kedaluwarsa (422)", async () => {
    (MemberRepository.findByTokenHash as Mock).mockResolvedValue({
      id: "instant-member-001",
      invitationId: mockInvitation.id,
      name: "Siti Penerima Tamu",
      role: "USER",
      inviteTokenExpiresAt: new Date(Date.now() - 10000),
      revokedAt: null,
      invitation: mockInvitation,
    });

    const res = await request(app)
      .post("/v1/api/members/instant-access")
      .send({ token: "expired-magic-token" });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("kedaluwarsa");
  });

  it("Ditolak (403) saat petugas instant link mencoba mengakses fitur selain Catatan Buwuh (misal tamu)", async () => {
    const instantToken = jwt.sign(
      {
        id: "instant-member-001",
        role: "USER",
        planTier: "FREE",
        memberId: "instant-member-001",
        invitationId: mockInvitation.id,
        invitationRole: "USER",
        accessType: "INSTANT",
        accessScope: "BUWUHAN_ONLY",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    const resGuests = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/guests`)
      .set("Authorization", `Bearer ${instantToken}`);

    expect(resGuests.status).toBe(403);
    expect(resGuests.body.message).toContain("Catatan Buwuh");

    const resInvite = await request(app)
      .patch(`/v1/api/invitations/${mockInvitation.id}`)
      .set("Authorization", `Bearer ${instantToken}`)
      .send({ title: "Hack Title" });

    expect(resInvite.status).toBe(403);
  });
});



