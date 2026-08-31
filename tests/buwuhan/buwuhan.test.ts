import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { buwuhanRouter } from "../../src/modules/buwuhan/buwuhan.routes";
import { BuwuhanRepository } from "../../src/modules/buwuhan/buwuhan.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(BuwuhanRepository, "findInvitationByIdAndOwner");
  vi.spyOn(BuwuhanRepository, "create");
  vi.spyOn(BuwuhanRepository, "findManyByInvitationId");
  vi.spyOn(BuwuhanRepository, "findById");
  vi.spyOn(BuwuhanRepository, "update");
  vi.spyOn(BuwuhanRepository, "delete");
  vi.spyOn(BuwuhanRepository, "getSummary");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", buwuhanRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockOwnerId = "user-123";
const mockInvitationId = "inv-001";
const mockBuwuhanId = "buwuhan-001";

const validAuthToken = jwt.sign(
  { id: mockOwnerId, role: "USER", planTier: "FREE" },
  process.env.JWT_SECRET as string,
  { expiresIn: "1d" }
);

const mockInvitation = { id: mockInvitationId, ownerId: mockOwnerId };

const mockBuwuhanItems = [
  {
    id: "item-001",
    buwuhanId: mockBuwuhanId,
    itemName: "Uang Tunai",
    quantity: { toNumber: () => 1 } as any,
    unit: "transaksi",
    category: null,
    estimatedValue: { toNumber: () => 100000 } as any,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
  },
  {
    id: "item-002",
    buwuhanId: mockBuwuhanId,
    itemName: "Beras",
    quantity: { toNumber: () => 25 } as any,
    unit: "kg",
    category: "Sembako",
    estimatedValue: { toNumber: () => 350000 } as any,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
  },
];

const mockBuwuhan = {
  id: mockBuwuhanId,
  invitationId: mockInvitationId,
  giverName: "Ahmad",
  note: "Semoga berkah",
  receivedAt: new Date("2026-08-21T20:15:00.000Z"),
  createdAt: new Date("2026-08-21T20:15:00.000Z"),
  updatedAt: new Date("2026-08-21T20:15:00.000Z"),
  items: mockBuwuhanItems,
  invitation: { ownerId: mockOwnerId },
};

// ─────────────────────────────────────────────
// POST /v1/api/invitations/:invitationId/buwuhans
// ─────────────────────────────────────────────
describe("POST /v1/api/invitations/:invitationId/buwuhans", () => {
  const validBody = {
    giverName: "Ahmad",
    note: "Semoga berkah",
    receivedAt: "2026-08-21T20:15:00.000Z",
    items: [
      { itemName: "Uang Tunai", quantity: 1, unit: "transaksi", estimatedValue: 100000 },
      { itemName: "Beras", quantity: 25, unit: "kg", category: "Sembako", estimatedValue: 350000 },
    ],
  };

  beforeEach(() => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.create as Mock).mockResolvedValue(mockBuwuhan);
  });

  it("201 - berhasil membuat catatan buwuh", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/buwuhans`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.giverName).toBe("Ahmad");
    expect(res.body.data.items).toHaveLength(2);
  });

  it("400 - gagal jika items kosong", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/buwuhans`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ giverName: "Ahmad", items: [] });

    expect(res.status).toBe(400);
  });

  it("400 - gagal jika unit tidak valid", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/buwuhans`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({ giverName: "Ahmad", items: [{ itemName: "Beras", quantity: 25, unit: "sendok" }] });

    expect(res.status).toBe(400);
  });

  it("401 - tanpa token", async () => {
    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/buwuhans`)
      .send(validBody);

    expect(res.status).toBe(401);
  });

  it("404 - undangan tidak ditemukan", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`/v1/api/invitations/unknown-id/buwuhans`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(validBody);

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
// GET /v1/api/invitations/:invitationId/buwuhans
// ─────────────────────────────────────────────
describe("GET /v1/api/invitations/:invitationId/buwuhans", () => {
  beforeEach(() => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.findManyByInvitationId as Mock).mockResolvedValue([mockBuwuhan]);
  });

  it("200 - berhasil mengambil daftar buwuh", async () => {
    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/buwuhans`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].giverName).toBe("Ahmad");
  });

  it("401 - tanpa token", async () => {
    const res = await request(app).get(`/v1/api/invitations/${mockInvitationId}/buwuhans`);
    expect(res.status).toBe(401);
  });

  it("404 - undangan tidak ditemukan", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/invitations/unknown-id/buwuhans`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
// GET /v1/api/invitations/:invitationId/buwuhans/summary
// ─────────────────────────────────────────────
describe("GET /v1/api/invitations/:invitationId/buwuhans/summary", () => {
  const mockSummary = {
    totalItems: 3,
    totalTransactions: 1,
    totalEstimatedValue: 450000,
    totalItemsThisMonth: 3,
    topItem: { itemName: "Beras", totalQuantity: 25, unit: "kg" },
  };

  beforeEach(() => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.getSummary as Mock).mockResolvedValue(mockSummary);
  });

  it("200 - ringkasan statistik benar", async () => {
    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitationId}/buwuhans/summary`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalItems).toBe(3);
    expect(res.body.data.totalTransactions).toBe(1);
    expect(res.body.data.totalEstimatedValue).toBe(450000);
    expect(res.body.data.topItem.itemName).toBe("Beras");
  });

  it("401 - tanpa token", async () => {
    const res = await request(app).get(`/v1/api/invitations/${mockInvitationId}/buwuhans/summary`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// GET /v1/api/buwuhans/:id
// ─────────────────────────────────────────────
describe("GET /v1/api/buwuhans/:id", () => {
  beforeEach(() => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(mockBuwuhan);
  });

  it("200 - detail buwuh dengan items", async () => {
    const res = await request(app)
      .get(`/v1/api/buwuhans/${mockBuwuhanId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockBuwuhanId);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0].quantity).toBe(1);
    expect(res.body.data.items[1].estimatedValue).toBe(350000);
  });

  it("404 - ID tidak ditemukan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get(`/v1/api/buwuhans/nonexistent-id`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });

  it("401 - tanpa token", async () => {
    const res = await request(app).get(`/v1/api/buwuhans/${mockBuwuhanId}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// PATCH /v1/api/buwuhans/:id
// ─────────────────────────────────────────────
describe("PATCH /v1/api/buwuhans/:id", () => {
  const updateBody = {
    giverName: "Ahmad Updated",
    items: [{ itemName: "Gula", quantity: 5, unit: "kg", estimatedValue: 75000 }],
  };

  const updatedMock = {
    ...mockBuwuhan,
    giverName: "Ahmad Updated",
    items: [
      {
        id: "item-003",
        buwuhanId: mockBuwuhanId,
        itemName: "Gula",
        quantity: { toNumber: () => 5 } as any,
        unit: "kg",
        category: null,
        estimatedValue: { toNumber: () => 75000 } as any,
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(mockBuwuhan);
    (BuwuhanRepository.update as Mock).mockResolvedValue(updatedMock);
  });

  it("200 - update berhasil dengan replace-all items", async () => {
    const res = await request(app)
      .patch(`/v1/api/buwuhans/${mockBuwuhanId}`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(updateBody);

    expect(res.status).toBe(200);
    expect(res.body.data.giverName).toBe("Ahmad Updated");
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].itemName).toBe("Gula");
  });

  it("404 - ID tidak ditemukan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch(`/v1/api/buwuhans/nonexistent-id`)
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send(updateBody);

    expect(res.status).toBe(404);
  });

  it("401 - tanpa token", async () => {
    const res = await request(app)
      .patch(`/v1/api/buwuhans/${mockBuwuhanId}`)
      .send(updateBody);

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// DELETE /v1/api/buwuhans/:id
// ─────────────────────────────────────────────
describe("DELETE /v1/api/buwuhans/:id", () => {
  beforeEach(() => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(mockBuwuhan);
    (BuwuhanRepository.delete as Mock).mockResolvedValue(undefined);
  });

  it("200 - hapus berhasil", async () => {
    const res = await request(app)
      .delete(`/v1/api/buwuhans/${mockBuwuhanId}`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("berhasil dihapus");
  });

  it("404 - ID tidak ditemukan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .delete(`/v1/api/buwuhans/nonexistent-id`)
      .set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });

  it("401 - tanpa token", async () => {
    const res = await request(app).delete(`/v1/api/buwuhans/${mockBuwuhanId}`);
    expect(res.status).toBe(401);
  });
});
