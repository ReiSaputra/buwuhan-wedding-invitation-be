import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { buwuhanRouter } from "../../src/modules/buwuhan/buwuhan.routes";
import { BuwuhanRepository } from "../../src/modules/buwuhan/buwuhan.repository";
import { MemberRepository } from "../../src/modules/member/member.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(MemberRepository, "findInvitationById");
  vi.spyOn(MemberRepository, "findMemberRole");
  vi.spyOn(BuwuhanRepository, "findInvitationByIdAndOwner");
  vi.spyOn(BuwuhanRepository, "create");
  vi.spyOn(BuwuhanRepository, "findManyByInvitationId");
  vi.spyOn(BuwuhanRepository, "findManyByOwnerId");
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

const validAuthToken = jwt.sign({ id: mockOwnerId, role: "USER", planTier: "FREE" }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

const mockInvitation = { id: mockInvitationId, ownerId: mockOwnerId, slug: "nikahan-ayu-budi" };

const mockBuwuhanItems = [
  {
    id: "item-001",
    buwuhanId: mockBuwuhanId,
    itemName: "Uang Tunai",
    quantity: { toString: () => "1", toNumber: () => 1 } as any,
    unit: "transaksi",
    category: null,
    estimatedValue: { toString: () => "100000", toNumber: () => 100000 } as any,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
  },
  {
    id: "item-002",
    buwuhanId: mockBuwuhanId,
    itemName: "Beras",
    quantity: { toString: () => "25", toNumber: () => 25 } as any,
    unit: "kg",
    category: "Sembako",
    estimatedValue: { toString: () => "350000.75", toNumber: () => 350000.75 } as any,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
  },
];

const mockBuwuhan = {
  id: mockBuwuhanId,
  invitationId: mockInvitationId,
  giverName: "Ahmad",
  giverAddress: "Ds. Kedungwaru, Kec. Tulungagung",
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
    giverAddress: "Ds. Kedungwaru, Kec. Tulungagung",
    note: "Semoga berkah",
    receivedAt: "2026-08-21T20:15:00.000Z",
    items: [
      { itemName: "Uang Tunai", quantity: 1, unit: "transaksi", estimatedValue: 100000 },
      { itemName: "Beras", quantity: 25, unit: "kg", category: "Sembako", estimatedValue: 350000 },
    ],
  };

  beforeEach(() => {
    (MemberRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (MemberRepository.findMemberRole as Mock).mockResolvedValue("OWNER");
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.create as Mock).mockResolvedValue(mockBuwuhan);
  });

  it("201 - berhasil membuat catatan buwuh", async () => {
    const res = await request(app).post(`/v1/api/invitations/${mockInvitationId}/buwuhans`).set("Authorization", `Bearer ${validAuthToken}`).send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.giverName).toBe("Ahmad");
    expect(res.body.data.giverAddress).toBe("Ds. Kedungwaru, Kec. Tulungagung");
    expect(res.body.data.items).toHaveLength(2);
  });

  it("400 - gagal jika items kosong", async () => {
    const res = await request(app).post(`/v1/api/invitations/${mockInvitationId}/buwuhans`).set("Authorization", `Bearer ${validAuthToken}`).send({ giverName: "Ahmad", items: [] });

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
    const res = await request(app).post(`/v1/api/invitations/${mockInvitationId}/buwuhans`).send(validBody);

    expect(res.status).toBe(401);
  });

  it("404 - undangan tidak ditemukan", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app).post(`/v1/api/invitations/unknown-id/buwuhans`).set("Authorization", `Bearer ${validAuthToken}`).send(validBody);

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
    const res = await request(app).get(`/v1/api/invitations/${mockInvitationId}/buwuhans`).set("Authorization", `Bearer ${validAuthToken}`);

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

    const res = await request(app).get(`/v1/api/invitations/unknown-id/buwuhans`).set("Authorization", `Bearer ${validAuthToken}`);

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
    const res = await request(app).get(`/v1/api/invitations/${mockInvitationId}/buwuhans/summary`).set("Authorization", `Bearer ${validAuthToken}`);

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
    const res = await request(app).get(`/v1/api/buwuhans/${mockBuwuhanId}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockBuwuhanId);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0].quantity).toBe(1);
    expect(res.body.data.items[1].estimatedValue).toBe(350000);
  });

  it("404 - ID tidak ditemukan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).get(`/v1/api/buwuhans/nonexistent-id`).set("Authorization", `Bearer ${validAuthToken}`);

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
    giverAddress: "Jl. Baru No. 123",
    items: [{ itemName: "Gula", quantity: 5, unit: "kg", estimatedValue: 75000 }],
  };

  const updatedMock = {
    ...mockBuwuhan,
    giverName: "Ahmad Updated",
    giverAddress: "Jl. Baru No. 123",
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
    const res = await request(app).patch(`/v1/api/buwuhans/${mockBuwuhanId}`).set("Authorization", `Bearer ${validAuthToken}`).send(updateBody);

    expect(res.status).toBe(200);
    expect(res.body.data.giverName).toBe("Ahmad Updated");
    expect(res.body.data.giverAddress).toBe("Jl. Baru No. 123");
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].itemName).toBe("Gula");
  });

  it("404 - ID tidak ditemukan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).patch(`/v1/api/buwuhans/nonexistent-id`).set("Authorization", `Bearer ${validAuthToken}`).send(updateBody);

    expect(res.status).toBe(404);
  });

  it("401 - tanpa token", async () => {
    const res = await request(app).patch(`/v1/api/buwuhans/${mockBuwuhanId}`).send(updateBody);

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
    const res = await request(app).delete(`/v1/api/buwuhans/${mockBuwuhanId}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("berhasil dihapus");
  });

  it("404 - ID tidak ditemukan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/v1/api/buwuhans/nonexistent-id`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
  });

  it("401 - tanpa token", async () => {
    const res = await request(app).delete(`/v1/api/buwuhans/${mockBuwuhanId}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// GET /v1/api/buwuhans (Lintas Undangan)
// ─────────────────────────────────────────────
describe("GET /v1/api/buwuhans", () => {
  const mockBuwuhanInv1 = {
    id: "buwuhan-001",
    invitationId: "inv-001",
    giverName: "H. Ahmad & Keluarga",
    giverAddress: "Jl. Merdeka No. 1",
    note: "Selamat menempuh hidup baru",
    receivedAt: new Date("2026-08-22T10:00:00.000Z"),
    createdAt: new Date("2026-08-22T10:00:00.000Z"),
    updatedAt: new Date("2026-08-22T10:00:00.000Z"),
    invitation: {
      id: "inv-001",
      title: "Han & Saputra",
      slug: "han-saputra",
    },
    items: [
      {
        id: "item-001",
        buwuhanId: "buwuhan-001",
        itemName: "Beras",
        quantity: { toNumber: () => 50 } as any,
        unit: "kg",
        category: "Sembako",
        estimatedValue: { toNumber: () => 650000 } as any,
        createdAt: new Date("2026-08-22T10:00:00.000Z"),
      },
    ],
  };

  const mockBuwuhanInv2 = {
    id: "buwuhan-002",
    invitationId: "inv-002",
    giverName: "Budi Santoso",
    giverAddress: null,
    note: "Semoga samawa",
    receivedAt: new Date("2026-08-20T08:00:00.000Z"),
    createdAt: new Date("2026-08-20T08:00:00.000Z"),
    updatedAt: new Date("2026-08-20T08:00:00.000Z"),
    invitation: {
      id: "inv-002",
      title: "Resepsi Putri & Dimas",
      slug: "putri-dimas",
    },
    items: [
      {
        id: "item-002",
        buwuhanId: "buwuhan-002",
        itemName: "Uang Tunai",
        quantity: { toNumber: () => 1 } as any,
        unit: "transaksi",
        category: "Uang",
        estimatedValue: { toNumber: () => 200000 } as any,
        createdAt: new Date("2026-08-20T08:00:00.000Z"),
      },
    ],
  };

  it("401 - tanpa token autentikasi", async () => {
    const res = await request(app).get("/v1/api/buwuhans");
    expect(res.status).toBe(401);
  });

  it("200 - mengembalikan array kosong jika user belum punya catatan buwuh", async () => {
    (BuwuhanRepository.findManyByOwnerId as Mock).mockResolvedValue([]);

    const res = await request(app).get("/v1/api/buwuhans").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Daftar buwuh berhasil diambil");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
    expect(BuwuhanRepository.findManyByOwnerId).toHaveBeenCalledWith(mockOwnerId);
  });

  it("200 - mengembalikan seluruh catatan buwuh lintas undangan dengan title & slug undangan", async () => {
    (BuwuhanRepository.findManyByOwnerId as Mock).mockResolvedValue([mockBuwuhanInv1, mockBuwuhanInv2]);

    const res = await request(app).get("/v1/api/buwuhans").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);

    // Verifikasi data undangan pertama
    expect(res.body.data[0].id).toBe("buwuhan-001");
    expect(res.body.data[0].invitationId).toBe("inv-001");
    expect(res.body.data[0].invitationTitle).toBe("Han & Saputra");
    expect(res.body.data[0].invitationSlug).toBe("han-saputra");
    expect(res.body.data[0].giverName).toBe("H. Ahmad & Keluarga");
    expect(res.body.data[0].giverAddress).toBe("Jl. Merdeka No. 1");

    // Verifikasi data undangan kedua
    expect(res.body.data[1].id).toBe("buwuhan-002");
    expect(res.body.data[1].invitationId).toBe("inv-002");
    expect(res.body.data[1].invitationTitle).toBe("Resepsi Putri & Dimas");
    expect(res.body.data[1].invitationSlug).toBe("putri-dimas");
    expect(res.body.data[1].giverName).toBe("Budi Santoso");
    expect(res.body.data[1].giverAddress).toBeNull();
  });

  it("memanggil repository dengan ownerId pengguna yang login (tidak menyertakan catatan milik orang lain)", async () => {
    (BuwuhanRepository.findManyByOwnerId as Mock).mockResolvedValue([mockBuwuhanInv1]);

    await request(app).get("/v1/api/buwuhans").set("Authorization", `Bearer ${validAuthToken}`);

    expect(BuwuhanRepository.findManyByOwnerId).toHaveBeenCalledWith(mockOwnerId);
  });

  it("quantity dan estimatedValue bertipe number pada response payload", async () => {
    (BuwuhanRepository.findManyByOwnerId as Mock).mockResolvedValue([mockBuwuhanInv1]);

    const res = await request(app).get("/v1/api/buwuhans").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    const item = res.body.data[0].items[0];
    expect(typeof item.quantity).toBe("number");
    expect(item.quantity).toBe(50);
    expect(typeof item.estimatedValue).toBe("number");
    expect(item.estimatedValue).toBe(650000);
  });

  it("mempertahankan urutan receivedAt descending dari repository", async () => {
    (BuwuhanRepository.findManyByOwnerId as Mock).mockResolvedValue([mockBuwuhanInv1, mockBuwuhanInv2]);

    const res = await request(app).get("/v1/api/buwuhans").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    const date1 = new Date(res.body.data[0].receivedAt).getTime();
    const date2 = new Date(res.body.data[1].receivedAt).getTime();
    expect(date1).toBeGreaterThan(date2);
  });
});

describe("Petugas Buwuhan: Otorisasi & Audit Log Pencatatan", () => {
  const mockPetugasMemberId = "member-petugas-001";
  const mockPetugasToken = jwt.sign({ id: "user-petugas-1", role: "USER", planTier: "FREE", memberId: mockPetugasMemberId, invitationId: mockInvitationId, invitationRole: "USER" }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

  const mockOtherPetugasToken = jwt.sign({ id: "user-petugas-2", role: "USER", planTier: "FREE", memberId: "member-petugas-002", invitationId: mockInvitationId, invitationRole: "USER" }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  it("Petugas (role USER) berhasil menginput buwuhan dan data recordedBy tersimpan", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.create as Mock).mockResolvedValue({
      id: "buwuhan-recorded-01",
      invitationId: mockInvitationId,
      giverName: "Pak Camat",
      note: "Titip dari warga",
      receivedAt: new Date(),
      recordedByMemberId: mockPetugasMemberId,
      recordedByName: "Budi Meja 1",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "item-rec-1",
          buwuhanId: "buwuhan-recorded-01",
          itemName: "Amplop",
          quantity: { toNumber: () => 1 },
          unit: "transaksi",
          category: null,
          estimatedValue: { toNumber: () => 500000 },
          createdAt: new Date(),
        },
      ],
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitationId}/buwuhans`)
      .set("Authorization", `Bearer ${mockPetugasToken}`)
      .set("X-Actor-Name", "Budi Meja 1")
      .send({
        giverName: "Pak Camat",
        note: "Titip dari warga",
        items: [{ itemName: "Amplop", quantity: 1, unit: "transaksi", estimatedValue: 500000 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Catatan buwuh berhasil ditambahkan");
    expect(res.body.data.recordedBy.memberId).toBe(mockPetugasMemberId);
    expect(res.body.data.recordedBy.name).toBe("Budi Meja 1");
    expect(BuwuhanRepository.create).toHaveBeenCalledWith(mockInvitationId, expect.anything(), mockPetugasMemberId, "Budi Meja 1");
  });

  it("Petugas diizinkan mengedit buwuhan yang dicatat oleh dirinya sendiri", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      id: "buwuhan-recorded-01",
      invitationId: mockInvitationId,
      recordedByMemberId: mockPetugasMemberId,
      invitation: { ownerId: mockOwnerId },
    });
    (BuwuhanRepository.update as Mock).mockResolvedValue({
      id: "buwuhan-recorded-01",
      invitationId: mockInvitationId,
      giverName: "Pak Camat Revisi",
      note: "Revisi catatan",
      receivedAt: new Date(),
      recordedByMemberId: mockPetugasMemberId,
      recordedByName: "Budi Meja 1",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    const res = await request(app).patch("/v1/api/buwuhans/buwuhan-recorded-01").set("Authorization", `Bearer ${mockPetugasToken}`).send({ giverName: "Pak Camat Revisi" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Catatan buwuh berhasil diperbarui");
  });

  it("Petugas DITOLAK (403 Forbidden) saat mencoba mengedit buwuhan milik petugas lain", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      id: "buwuhan-recorded-01",
      invitationId: mockInvitationId,
      recordedByMemberId: mockPetugasMemberId, // Dibuat oleh Petugas 1
      invitation: { ownerId: mockOwnerId },
    });

    const res = await request(app)
      .patch("/v1/api/buwuhans/buwuhan-recorded-01")
      .set("Authorization", `Bearer ${mockOtherPetugasToken}`) // Dicoba edit oleh Petugas 2
      .send({ giverName: "Pak Camat Diretas" });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Anda hanya dapat mengedit catatan yang Anda buat sendiri");
  });

  it("Petugas DITOLAK (403 Forbidden) saat mencoba menghapus buwuhan", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      id: "buwuhan-recorded-01",
      invitationId: mockInvitationId,
      recordedByMemberId: mockPetugasMemberId,
      invitation: { ownerId: mockOwnerId },
    });

    const res = await request(app).delete("/v1/api/buwuhans/buwuhan-recorded-01").set("Authorization", `Bearer ${mockPetugasToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Petugas tidak diizinkan menghapus");
  });
});

// ─────────────────────────────────────────────────
// POST /v1/api/buwuhans/standalone
// ─────────────────────────────────────────────────
describe("POST /v1/api/buwuhans/standalone", () => {
  const validBody = {
    giverName: "Ahmad Mandiri",
    giverAddress: "Ds. Kedungwaru",
    note: "Catatan mandiri",
    receivedAt: "2026-08-21T20:15:00.000Z",
    items: [{ itemName: "Uang Tunai", quantity: 1, unit: "transaksi", estimatedValue: 200000 }],
  };

  const mockStandaloneBuwuhan = {
    id: "buwuhan-standalone-001",
    invitationId: null,
    userId: mockOwnerId,
    giverName: "Ahmad Mandiri",
    giverAddress: "Ds. Kedungwaru",
    note: "Catatan mandiri",
    receivedAt: new Date("2026-08-21T20:15:00.000Z"),
    recordedByMemberId: null,
    recordedByName: null,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
    updatedAt: new Date("2026-08-21T20:15:00.000Z"),
    items: [
      {
        id: "item-standalone-001",
        buwuhanId: "buwuhan-standalone-001",
        itemName: "Uang Tunai",
        quantity: { toNumber: () => 1 } as any,
        unit: "transaksi",
        category: null,
        estimatedValue: { toNumber: () => 200000 } as any,
        createdAt: new Date("2026-08-21T20:15:00.000Z"),
      },
    ],
  };

  beforeEach(() => {
    vi.spyOn(BuwuhanRepository, "createStandalone").mockResolvedValue(mockStandaloneBuwuhan as any);
  });

  it("BERHASIL (201) membuat catatan buwuh mandiri", async () => {
    const res = await request(app).post("/v1/api/buwuhans/standalone").set("Authorization", `Bearer ${validAuthToken}`).send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.invitationId).toBeNull();
    expect(res.body.data.userId).toBe(mockOwnerId);
    expect(res.body.data.giverName).toBe("Ahmad Mandiri");
  });

  it("GAGAL (400) jika validasi gagal (items kosong)", async () => {
    const res = await request(app).post("/v1/api/buwuhans/standalone").set("Authorization", `Bearer ${validAuthToken}`).send({ giverName: "Ahmad", items: [] });

    expect(res.status).toBe(400);
  });

  it("GAGAL (401) jika tidak ada token", async () => {
    const res = await request(app).post("/v1/api/buwuhans/standalone").send(validBody);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────
// GET /v1/api/buwuhans/standalone
// ─────────────────────────────────────────────────
describe("GET /v1/api/buwuhans/standalone", () => {
  const mockStandaloneBuwuhan = {
    id: "buwuhan-standalone-001",
    invitationId: null,
    userId: mockOwnerId,
    giverName: "Ahmad Mandiri",
    giverAddress: null,
    note: null,
    receivedAt: new Date("2026-08-21T20:15:00.000Z"),
    recordedByMemberId: null,
    recordedByName: null,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
    updatedAt: new Date("2026-08-21T20:15:00.000Z"),
    items: [],
  };

  beforeEach(() => {
    vi.spyOn(BuwuhanRepository, "findManyStandaloneByUserId").mockResolvedValue([mockStandaloneBuwuhan] as any);
  });

  it("BERHASIL (200) mengambil daftar catatan buwuh mandiri", async () => {
    const res = await request(app).get("/v1/api/buwuhans/standalone").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].invitationId).toBeNull();
    expect(res.body.data[0].userId).toBe(mockOwnerId);
  });

  it("GAGAL (401) jika tidak ada token", async () => {
    const res = await request(app).get("/v1/api/buwuhans/standalone");
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────
// PATCH & DELETE /buwuhans/:id — Standalone mode
// ─────────────────────────────────────────────────
describe("PATCH & DELETE /v1/api/buwuhans/:id (Standalone)", () => {
  const mockStandaloneBuwuhan = {
    id: "buwuhan-standalone-001",
    invitationId: null,
    userId: mockOwnerId,
    giverName: "Ahmad Mandiri",
    giverAddress: null,
    note: null,
    receivedAt: new Date("2026-08-21T20:15:00.000Z"),
    recordedByMemberId: null,
    recordedByName: null,
    createdAt: new Date("2026-08-21T20:15:00.000Z"),
    updatedAt: new Date("2026-08-21T20:15:00.000Z"),
    items: [],
    invitation: null,
    user: { id: mockOwnerId },
  };

  const anotherUserId = "user-other-999";
  const anotherUserToken = jwt.sign({ id: anotherUserId, role: "USER", planTier: "FREE" }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

  beforeEach(() => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue(mockStandaloneBuwuhan);
    (BuwuhanRepository.update as Mock).mockResolvedValue(mockStandaloneBuwuhan);
  });

  it("BERHASIL (200) pemilik dapat mengedit catatan buwuh mandiri", async () => {
    const res = await request(app).patch("/v1/api/buwuhans/buwuhan-standalone-001").set("Authorization", `Bearer ${validAuthToken}`).send({ giverName: "Ahmad Diperbarui" });

    expect(res.status).toBe(200);
  });

  it("DITOLAK (403) user lain tidak dapat mengedit catatan buwuh mandiri orang lain", async () => {
    const res = await request(app).patch("/v1/api/buwuhans/buwuhan-standalone-001").set("Authorization", `Bearer ${anotherUserToken}`).send({ giverName: "Hack Attempt" });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Anda tidak memiliki akses");
  });

  it("BERHASIL (200) pemilik dapat menghapus catatan buwuh mandiri", async () => {
    const res = await request(app).delete("/v1/api/buwuhans/buwuhan-standalone-001").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
  });

  it("DITOLAK (403) user lain tidak dapat menghapus catatan buwuh mandiri orang lain", async () => {
    const res = await request(app).delete("/v1/api/buwuhans/buwuhan-standalone-001").set("Authorization", `Bearer ${anotherUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Anda tidak memiliki akses");
  });
});

describe("buwuhan test: export buwuhan", () => {
  it("berhasil mengekspor data buwuh ke format CSV dengan presisi Decimal terjaga (200)", async () => {
    (MemberRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (MemberRepository.findMemberRole as Mock).mockResolvedValue("OWNER");
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.findManyByInvitationId as Mock).mockResolvedValue([mockBuwuhan]);

    const res = await request(app).get(`/v1/api/invitations/${mockInvitation.id}/buwuhans/export?format=csv`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain(`attachment; filename="${mockInvitation.slug}-buwuhans-`);
    expect(res.headers["content-disposition"]).toContain(".csv");
    expect(res.text).toContain("Nama Pemberi");
    expect(res.text).toContain("Ahmad");
    expect(res.text).toContain("Beras");
    expect(res.text).toContain("350000.75");
  });

  it("berhasil mengekspor data buwuh ke format XLSX (200)", async () => {
    (MemberRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (MemberRepository.findMemberRole as Mock).mockResolvedValue("OWNER");
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.findManyByInvitationId as Mock).mockResolvedValue([mockBuwuhan]);

    const res = await request(app).get(`/v1/api/invitations/${mockInvitation.id}/buwuhans/export?format=xlsx`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("spreadsheetml.sheet");
    expect(res.headers["content-disposition"]).toContain(`attachment; filename="${mockInvitation.slug}-buwuhans-`);
    expect(res.headers["content-disposition"]).toContain(".xlsx");
  });

  it("gagal jika format ekspor tidak valid (422)", async () => {
    (MemberRepository.findInvitationById as Mock).mockResolvedValue(mockInvitation);
    (MemberRepository.findMemberRole as Mock).mockResolvedValue("OWNER");

    const res = await request(app).get(`/v1/api/invitations/${mockInvitation.id}/buwuhans/export?format=json`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe("buwuhan test: otorisasi petugas instant access link (magic link)", () => {
  const instantMemberId = "instant-staff-001";
  const instantToken = jwt.sign(
    {
      id: instantMemberId,
      role: "USER",
      planTier: "FREE",
      memberId: instantMemberId,
      invitationId: mockInvitation.id,
      invitationRole: "USER",
      accessType: "INSTANT",
      accessScope: "BUWUHAN_ONLY",
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );

  it("BERHASIL (200) petugas instant dapat melihat daftar Catatan Buwuh undangan terkait", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.findManyByInvitationId as Mock).mockResolvedValue([mockBuwuhan]);

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/buwuhans`)
      .set("Authorization", `Bearer ${instantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("BERHASIL (200) petugas instant dapat melihat ringkasan summary Catatan Buwuh", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.getSummary as Mock).mockResolvedValue({
      totalCount: 1,
      totalCashValue: 100000,
      totalGoodsCount: 1,
      totalEstimatedValue: 450000,
      uniqueGiversCount: 1,
      categories: [{ category: "Sembako", count: 1, totalValue: 350000 }],
    });

    const res = await request(app)
      .get(`/v1/api/invitations/${mockInvitation.id}/buwuhans/summary`)
      .set("Authorization", `Bearer ${instantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalCashValue).toBe(100000);
  });

  it("BERHASIL (201) petugas instant dapat mencatat buwuh baru", async () => {
    (BuwuhanRepository.findInvitationByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (BuwuhanRepository.create as Mock).mockResolvedValue({
      ...mockBuwuhan,
      recordedByMemberId: instantMemberId,
    });

    const res = await request(app)
      .post(`/v1/api/invitations/${mockInvitation.id}/buwuhans`)
      .set("Authorization", `Bearer ${instantToken}`)
      .send({
        giverName: "H. Joko",
        items: [{ itemName: "Uang Amplop", quantity: 1, unit: "transaksi", estimatedValue: 200000 }],
      });

    expect(res.status).toBe(201);

  });

  it("DITOLAK (403) petugas instant tidak dapat mengakses Catatan Buwuh milik undangan lain", async () => {
    const res = await request(app)
      .get("/v1/api/invitations/other-inv-999/buwuhans")
      .set("Authorization", `Bearer ${instantToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Link petugas tidak berlaku untuk undangan ini");
  });

  it("BERHASIL (200) petugas instant dapat melihat detail catatan buwuh undangannya", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      ...mockBuwuhan,
      invitationId: mockInvitation.id,
      recordedByMemberId: instantMemberId,
    });

    const res = await request(app)
      .get(`/v1/api/buwuhans/${mockBuwuhan.id}`)
      .set("Authorization", `Bearer ${instantToken}`);

    expect(res.status).toBe(200);
  });

  it("DITOLAK (403) petugas instant tidak dapat melihat detail catatan buwuh undangan lain", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      ...mockBuwuhan,
      invitationId: "other-inv-999",
    });

    const res = await request(app)
      .get(`/v1/api/buwuhans/${mockBuwuhan.id}`)
      .set("Authorization", `Bearer ${instantToken}`);

    expect(res.status).toBe(403);
  });

  it("BERHASIL (200) petugas instant dapat mengubah catatan buwuh yang dicatat sendiri", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      ...mockBuwuhan,
      invitationId: mockInvitation.id,
      recordedByMemberId: instantMemberId,
    });
    (BuwuhanRepository.update as Mock).mockResolvedValue({
      ...mockBuwuhan,
      giverName: "H. Joko Diperbarui",
    });

    const res = await request(app)
      .patch(`/v1/api/buwuhans/${mockBuwuhan.id}`)
      .set("Authorization", `Bearer ${instantToken}`)
      .send({ giverName: "H. Joko Diperbarui" });

    expect(res.status).toBe(200);
  });

  it("DITOLAK (403) petugas instant tidak dapat mengubah catatan buwuh yang dicatat orang lain", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      ...mockBuwuhan,
      invitationId: mockInvitation.id,
      recordedByMemberId: "other-member-or-owner",
    });

    const res = await request(app)
      .patch(`/v1/api/buwuhans/${mockBuwuhan.id}`)
      .set("Authorization", `Bearer ${instantToken}`)
      .send({ giverName: "H. Joko Hack" });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("hanya dapat mengubah catatan yang dibuat sendiri");
  });

  it("DITOLAK (403) petugas instant dilarang menghapus catatan buwuh", async () => {
    (BuwuhanRepository.findById as Mock).mockResolvedValue({
      ...mockBuwuhan,
      invitationId: mockInvitation.id,
      recordedByMemberId: instantMemberId,
    });

    const res = await request(app)
      .delete(`/v1/api/buwuhans/${mockBuwuhan.id}`)
      .set("Authorization", `Bearer ${instantToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Petugas tidak diizinkan menghapus");
  });

  it("DITOLAK (403) petugas instant tidak dapat mengakses catatan buwuh mandiri (standalone)", async () => {
    const resList = await request(app)
      .get("/v1/api/buwuhans/standalone")
      .set("Authorization", `Bearer ${instantToken}`);

    expect(resList.status).toBe(403);
    expect(resList.body.message).toContain("Catatan Buwuh");

    const resCreate = await request(app)
      .post("/v1/api/buwuhans/standalone")
      .set("Authorization", `Bearer ${instantToken}`)
      .send({
        giverName: "Mandiri",
        items: [{ itemName: "Uang", quantity: 1, unit: "transaksi" }],
      });

    expect(resCreate.status).toBe(403);
  });
});

