import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { giftRouter } from "../../src/modules/gift/gift.routes";
import { GiftRepository } from "../../src/modules/gift/gift.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(GiftRepository, "findInvitationById");
  vi.spyOn(GiftRepository, "findGiftAccountsByInvitationId");
  vi.spyOn(GiftRepository, "findGiftAccountById");
  vi.spyOn(GiftRepository, "createGiftAccount");
  vi.spyOn(GiftRepository, "updateGiftAccount");
  vi.spyOn(GiftRepository, "deleteGiftAccount");
  vi.spyOn(GiftRepository, "findGiftsByInvitationId");
  vi.spyOn(GiftRepository, "findGiftById");
  vi.spyOn(GiftRepository, "createGift");
  vi.spyOn(GiftRepository, "updateGift");
  vi.spyOn(GiftRepository, "deleteGift");
  vi.spyOn(GiftRepository, "getSummary");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", giftRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockOwnerId = "user-123";
const mockOtherOwnerId = "user-999";
const mockInvitationId = "inv-001";
const mockAccountId = "account-001";
const mockGiftId = "gift-001";

const validAuthToken = jwt.sign(
  { id: mockOwnerId, role: "USER", planTier: "FREE" },
  process.env.JWT_SECRET as string,
  { expiresIn: "1d" }
);

const mockInvitation = { id: mockInvitationId, ownerId: mockOwnerId };

const mockGiftAccount = {
  id: mockAccountId,
  invitationId: mockInvitationId,
  bankName: "BCA",
  accountNumber: "1234567890",
  accountHolder: "Fathur Saputra",
  type: "BANK",
  order: 0,
  createdAt: new Date("2026-08-21T20:15:00.000Z"),
  updatedAt: new Date("2026-08-21T20:15:00.000Z"),
  invitation: { id: mockInvitationId, ownerId: mockOwnerId },
};

const mockGift = {
  id: mockGiftId,
  invitationId: mockInvitationId,
  giverName: "Budi Santoso",
  amount: { toNumber: () => 500000 } as any,
  method: "TRANSFER",
  note: "Selamat ya!",
  receivedAt: new Date("2026-08-21T20:15:00.000Z"),
  createdAt: new Date("2026-08-21T20:15:00.000Z"),
  updatedAt: new Date("2026-08-21T20:15:00.000Z"),
  invitation: { id: mockInvitationId, ownerId: mockOwnerId },
};

// ── Gift Account Tests ───────────────────────────────────────────────────

describe("POST /v1/api/invitations/:invitationId/gift-accounts", () => {
  const validBody = {
    bankName: "BCA",
    accountNumber: "1234567890",
    accountHolder: "Fathur Saputra",
    type: "BANK",
    order: 0,
  };

  beforeEach(() => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (GiftRepository.createGiftAccount as Mock).mockResolvedValue(mockGiftAccount);
  });

  it("201 - berhasil membuat gift account", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Rekening hadiah berhasil ditambahkan");
    expect(res.body.data.bankName).toBe("BCA");
    expect(res.body.data.accountNumber).toBe("1234567890");
  });

  it("400 - gagal jika field wajib tidak diisi", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("401 - gagal jika tanpa token otentikasi", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .send(validBody);

    expect(res.status).toBe(401);
  });

  it("403 - gagal jika bukan pemilik undangan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue({
      id: mockInvitationId,
      ownerId: mockOtherOwnerId,
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika undangan tidak ditemukan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(404);
  });
});

describe("GET /v1/api/invitations/:invitationId/gift-accounts", () => {
  beforeEach(() => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (GiftRepository.findGiftAccountsByInvitationId as Mock).mockResolvedValue([mockGiftAccount]);
  });

  it("200 - berhasil mengambil daftar rekening hadiah", async () => {
    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].bankName).toBe("BCA");
  });

  it("403 - gagal jika bukan pemilik undangan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue({
      id: mockInvitationId,
      ownerId: mockOtherOwnerId,
    });

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika undangan tidak ditemukan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gift-accounts`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /v1/api/gift-accounts/:id", () => {
  beforeEach(() => {
    (GiftRepository.findGiftAccountById as Mock).mockResolvedValue(mockGiftAccount);
    (GiftRepository.updateGiftAccount as Mock).mockResolvedValue({
      ...mockGiftAccount,
      bankName: "Mandiri",
    });
  });

  it("200 - berhasil memperbarui rekening hadiah", async () => {
    const res = await request(app)
      .patch(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ bankName: "Mandiri" });

    expect(res.status).toBe(200);
    expect(res.body.data.bankName).toBe("Mandiri");
  });

  it("400 - gagal jika body kosong", async () => {
    const res = await request(app)
      .patch(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("403 - gagal jika bukan pemilik", async () => {
    (GiftRepository.findGiftAccountById as Mock).mockResolvedValue({
      ...mockGiftAccount,
      invitation: { id: mockInvitationId, ownerId: mockOtherOwnerId },
    });

    const res = await request(app)
      .patch(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ bankName: "Mandiri" });

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika rekening tidak ditemukan", async () => {
    (GiftRepository.findGiftAccountById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ bankName: "Mandiri" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /v1/api/gift-accounts/:id", () => {
  beforeEach(() => {
    (GiftRepository.findGiftAccountById as Mock).mockResolvedValue(mockGiftAccount);
    (GiftRepository.deleteGiftAccount as Mock).mockResolvedValue(mockGiftAccount);
  });

  it("200 - berhasil menghapus rekening", async () => {
    const res = await request(app)
      .delete(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Rekening hadiah berhasil dihapus");
  });

  it("403 - gagal jika bukan pemilik", async () => {
    (GiftRepository.findGiftAccountById as Mock).mockResolvedValue({
      ...mockGiftAccount,
      invitation: { id: mockInvitationId, ownerId: mockOtherOwnerId },
    });

    const res = await request(app)
      .delete(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika rekening tidak ditemukan", async () => {
    (GiftRepository.findGiftAccountById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .delete(`/v1/api/gift-accounts/${mockAccountId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});

// ── Gifts Tests ──────────────────────────────────────────────────────────

describe("POST /v1/api/invitations/:invitationId/gifts", () => {
  const validBody = {
    giverName: "Budi Santoso",
    amount: 500000,
    method: "TRANSFER",
    note: "Selamat berbahagia",
  };

  beforeEach(() => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (GiftRepository.createGift as Mock).mockResolvedValue(mockGift);
  });

  it("201 - berhasil membuat catatan hadiah", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Catatan hadiah berhasil ditambahkan");
    expect(res.body.data.giverName).toBe("Budi Santoso");
    expect(res.body.data.amount).toBe(500000);
  });

  it("400 - gagal jika nominal <= 0", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ ...validBody, amount: -1000 });

    expect(res.status).toBe(400);
  });

  it("403 - gagal jika bukan pemilik undangan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue({
      id: mockInvitationId,
      ownerId: mockOtherOwnerId,
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika undangan tidak ditemukan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(404);
  });
});

describe("GET /v1/api/invitations/:invitationId/gifts", () => {
  beforeEach(() => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (GiftRepository.findGiftsByInvitationId as Mock).mockResolvedValue([mockGift]);
  });

  it("200 - berhasil mengambil daftar hadiah", async () => {
    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].giverName).toBe("Budi Santoso");
  });

  it("403 - gagal jika bukan pemilik undangan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue({
      id: mockInvitationId,
      ownerId: mockOtherOwnerId,
    });

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika undangan tidak ditemukan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gifts`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});

describe("GET /v1/api/invitations/:invitationId/gifts/summary", () => {
  const mockSummary = {
    totalGifts: 2,
    totalAmount: 1500000,
    byMethod: {
      CASH: { count: 1, totalAmount: 500000 },
      TRANSFER: { count: 1, totalAmount: 1000000 },
      EWALLET: { count: 0, totalAmount: 0 },
    },
  };

  beforeEach(() => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (GiftRepository.getSummary as Mock).mockResolvedValue(mockSummary);
  });

  it("200 - berhasil mengambil summary hadiah", async () => {
    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gifts/summary`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalGifts).toBe(2);
    expect(res.body.data.totalAmount).toBe(1500000);
    expect(res.body.data.byMethod.CASH.count).toBe(1);
  });

  it("403 - gagal jika bukan pemilik", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue({
      id: mockInvitationId,
      ownerId: mockOtherOwnerId,
    });

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gifts/summary`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika undangan tidak ditemukan", async () => {
    (GiftRepository.findInvitationById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/gifts/summary`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /v1/api/gifts/:id", () => {
  beforeEach(() => {
    (GiftRepository.findGiftById as Mock).mockResolvedValue(mockGift);
    (GiftRepository.updateGift as Mock).mockResolvedValue({
      ...mockGift,
      amount: { toNumber: () => 750000 } as any,
    });
  });

  it("200 - berhasil memperbarui catatan hadiah", async () => {
    const res = await request(app)
      .patch(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ amount: 750000 });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(750000);
  });

  it("400 - gagal jika body kosong", async () => {
    const res = await request(app)
      .patch(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("403 - gagal jika bukan pemilik", async () => {
    (GiftRepository.findGiftById as Mock).mockResolvedValue({
      ...mockGift,
      invitation: { id: mockInvitationId, ownerId: mockOtherOwnerId },
    });

    const res = await request(app)
      .patch(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ amount: 750000 });

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika hadiah tidak ditemukan", async () => {
    (GiftRepository.findGiftById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ amount: 750000 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /v1/api/gifts/:id", () => {
  beforeEach(() => {
    (GiftRepository.findGiftById as Mock).mockResolvedValue(mockGift);
    (GiftRepository.deleteGift as Mock).mockResolvedValue(mockGift);
  });

  it("200 - berhasil menghapus catatan hadiah", async () => {
    const res = await request(app)
      .delete(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Catatan hadiah berhasil dihapus");
  });

  it("403 - gagal jika bukan pemilik", async () => {
    (GiftRepository.findGiftById as Mock).mockResolvedValue({
      ...mockGift,
      invitation: { id: mockInvitationId, ownerId: mockOtherOwnerId },
    });

    const res = await request(app)
      .delete(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(403);
  });

  it("404 - gagal jika hadiah tidak ditemukan", async () => {
    (GiftRepository.findGiftById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .delete(`/v1/api/gifts/${mockGiftId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});

