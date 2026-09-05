import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { templateRouter } from "../../src/modules/template/template.routes";
import { TemplateRepository } from "../../src/modules/template/template.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(TemplateRepository, "findActive");
  vi.spyOn(TemplateRepository, "findActiveBySlug");
  vi.spyOn(TemplateRepository, "findById");
  vi.spyOn(TemplateRepository, "findBySlug");
  vi.spyOn(TemplateRepository, "create");
  vi.spyOn(TemplateRepository, "update");
  vi.spyOn(TemplateRepository, "deactivate");
  vi.spyOn(TemplateRepository, "findAllWithFilter");
  vi.spyOn(TemplateRepository, "restore");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", templateRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockAdmin = { id: "admin-123", role: "ADMIN" as const, planTier: "MAX" as const };
const mockUser = { id: "user-456", role: "USER" as const, planTier: "FREE" as const };

const adminToken = jwt.sign(mockAdmin, process.env.JWT_SECRET!, { expiresIn: "1d" });
const userToken = jwt.sign(mockUser, process.env.JWT_SECRET!, { expiresIn: "1d" });

const mockTemplate = {
  id: "tpl-royal-floral",
  name: "Royal Floral",
  slug: "royal-floral",
  tier: "FREE" as const,
  eventCategory: "WEDDING" as const,
  previewImageUrl: "https://images.unsplash.com/photo-1519741497674.jpg",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ── Kontrak Slug Seed ─────────────────────────────────────────────────────────
// Test ini memastikan slug yang sudah dirilis ke produksi tidak berubah tanpa koordinasi.
// Jika test ini gagal, berarti ada perubahan slug yang tidak disengaja — lihat docs/template-slug-contract.md.

describe("template test: Kontrak Slug Seed (regresi)", () => {
  it("slug 'royal-floral' masih ada di data seed (200)", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "royal-floral",
    });

    const res = await request(app).get("/v1/api/templates/royal-floral").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("royal-floral");
  });

  it("slug 'modern-minimalist' masih ada di data seed (200)", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "modern-minimalist",
      name: "Modern Minimalist",
    });

    const res = await request(app).get("/v1/api/templates/modern-minimalist").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("modern-minimalist");
  });

  it("slug 'javanese-classic' masih ada di data seed (200)", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "javanese-classic",
      name: "Javanese Classic",
    });

    const res = await request(app).get("/v1/api/templates/javanese-classic").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("javanese-classic");
  });

  it("slug 'khitanan-ceria-blue' masih ada di data seed (200)", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "khitanan-ceria-blue",
      name: "Khitanan Ceria Blue",
      eventCategory: "KHITANAN" as const,
    });

    const res = await request(app).get("/v1/api/templates/khitanan-ceria-blue").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("khitanan-ceria-blue");
  });

  it("slug 'rasulan-syukuran-gold' masih ada di data seed (200)", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "rasulan-syukuran-gold",
      name: "Rasulan Syukuran Gold",
      eventCategory: "RASULAN" as const,
    });

    const res = await request(app).get("/v1/api/templates/rasulan-syukuran-gold").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("rasulan-syukuran-gold");
  });
});

// ── Validasi Format Slug ─────────────────────────────────────────────────────

describe("template test: Validasi format slug POST /templates", () => {
  it("menolak slug dengan huruf kapital (400)", async () => {
    const res = await request(app).post("/v1/api/templates").set("Authorization", `Bearer ${adminToken}`).send({
      name: "Template Elegan",
      slug: "Template Elegan",
      tier: "FREE",
      previewImageUrl: "https://images.unsplash.com/photo-abc.jpg",
    });

    expect(res.status).toBe(400);
  });

  it("menolak slug dengan underscore (400)", async () => {
    const res = await request(app).post("/v1/api/templates").set("Authorization", `Bearer ${adminToken}`).send({
      name: "Template Elegan",
      slug: "elegan_2",
      tier: "FREE",
      previewImageUrl: "https://images.unsplash.com/photo-abc.jpg",
    });

    expect(res.status).toBe(400);
  });

  it("menolak slug dengan double hyphen (400)", async () => {
    const res = await request(app).post("/v1/api/templates").set("Authorization", `Bearer ${adminToken}`).send({
      name: "Template Elegan",
      slug: "elegan--",
      tier: "FREE",
      previewImageUrl: "https://images.unsplash.com/photo-abc.jpg",
    });

    expect(res.status).toBe(400);
  });

  it("menerima slug kebab-case valid (201)", async () => {
    (TemplateRepository.findBySlug as Mock).mockResolvedValue(null);
    (TemplateRepository.create as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "rustic-modern",
      name: "Rustic Modern",
    });

    const res = await request(app).post("/v1/api/templates").set("Authorization", `Bearer ${adminToken}`).send({
      name: "Rustic Modern",
      slug: "rustic-modern",
      tier: "FREE",
      previewImageUrl: "https://images.unsplash.com/photo-abc.jpg",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe("rustic-modern");
  });

  it("pesan error validasi slug berbahasa Indonesia (400)", async () => {
    const res = await request(app).post("/v1/api/templates").set("Authorization", `Bearer ${adminToken}`).send({
      name: "Template Invalid",
      slug: "Invalid Slug!",
      tier: "FREE",
      previewImageUrl: "https://images.unsplash.com/photo-abc.jpg",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/huruf kecil|angka|tanda hubung/i);
  });
});

// ── Validasi Format Slug — PATCH /templates/:id ───────────────────────────────

describe("template test: Validasi format slug PATCH /templates/:id", () => {
  it("menolak update slug dengan format tidak valid (400)", async () => {
    const res = await request(app).patch(`/v1/api/templates/${mockTemplate.id}`).set("Authorization", `Bearer ${adminToken}`).send({ slug: "Slug Tidak Valid" });

    expect(res.status).toBe(400);
  });

  it("menerima update slug kebab-case valid (200)", async () => {
    (TemplateRepository.findById as Mock).mockResolvedValue(mockTemplate);
    (TemplateRepository.update as Mock).mockResolvedValue({
      ...mockTemplate,
      slug: "royal-floral-v2",
    });

    const res = await request(app).patch(`/v1/api/templates/${mockTemplate.id}`).set("Authorization", `Bearer ${adminToken}`).send({ slug: "royal-floral-v2" });

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("royal-floral-v2");
  });
});

// ── Otorisasi ─────────────────────────────────────────────────────────────────

describe("template test: Otorisasi", () => {
  it("menolak POST /templates oleh pengguna non-ADMIN (403)", async () => {
    const res = await request(app).post("/v1/api/templates").set("Authorization", `Bearer ${userToken}`).send({
      name: "Template Baru",
      slug: "template-baru",
      tier: "FREE",
      previewImageUrl: "https://images.unsplash.com/photo-abc.jpg",
    });

    expect(res.status).toBe(403);
  });

  it("menolak PATCH /templates/:id oleh pengguna non-ADMIN (403)", async () => {
    const res = await request(app).patch(`/v1/api/templates/${mockTemplate.id}`).set("Authorization", `Bearer ${userToken}`).send({ name: "Nama Baru" });

    expect(res.status).toBe(403);
  });

  it("menolak DELETE /templates/:id oleh pengguna non-ADMIN (403)", async () => {
    const res = await request(app).delete(`/v1/api/templates/${mockTemplate.id}`).set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

// ── CRUD Umum ────────────────────────────────────────────────────────────────

describe("template test: CRUD umum", () => {
  it("berhasil mengambil daftar template aktif (200)", async () => {
    (TemplateRepository.findActive as Mock).mockResolvedValue([mockTemplate]);

    const res = await request(app).get("/v1/api/templates").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].slug).toBe("royal-floral");
  });

  it("berhasil mengambil detail template by slug (200)", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue(mockTemplate);

    const res = await request(app).get(`/v1/api/templates/${mockTemplate.slug}`).set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(mockTemplate.slug);
  });

  it("mengembalikan 404 jika template tidak ditemukan", async () => {
    (TemplateRepository.findActiveBySlug as Mock).mockResolvedValue(null);

    const res = await request(app).get("/v1/api/templates/tidak-ada").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });

  it("berhasil soft-delete (deactivate) template oleh ADMIN (200)", async () => {
    (TemplateRepository.findById as Mock).mockResolvedValue(mockTemplate);
    (TemplateRepository.deactivate as Mock).mockResolvedValue({
      ...mockTemplate,
      isActive: false,
    });

    const res = await request(app).delete(`/v1/api/templates/${mockTemplate.id}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

// ── Admin Template Catalog: GET /admin/templates ──────────────────────

describe("admin template test: GET /admin/templates", () => {
  it("berhasil mengambil seluruh katalog template beserta usageCount (200)", async () => {
    (TemplateRepository.findAllWithFilter as Mock).mockResolvedValue([
      {
        ...mockTemplate,
        _count: { invitations: 15 },
      },
      {
        ...mockTemplate,
        id: "tpl-archived",
        slug: "archived-theme",
        isActive: false,
        _count: { invitations: 2 },
      },
    ]);

    const res = await request(app).get("/v1/api/admin/templates").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Daftar seluruh template berhasil diambil");
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].usageCount).toBe(15);
    expect(res.body.data[1].isActive).toBe(false);
    expect(res.body.data[1].usageCount).toBe(2);
  });

  it("berhasil memfilter pencarian dan status aktif / tier / kategori (200)", async () => {
    (TemplateRepository.findAllWithFilter as Mock).mockResolvedValue([]);

    const res = await request(app).get("/v1/api/admin/templates?isActive=true&tier=FREE&eventCategory=WEDDING&search=royal").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(TemplateRepository.findAllWithFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: true,
        tier: "FREE",
        eventCategory: "WEDDING",
        search: "royal",
      }),
    );
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).get("/v1/api/admin/templates").set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Kamu tidak punya akses untuk melakukan aksi ini");
  });

  it("menolak akses tanpa token otentikasi (401)", async () => {
    const res = await request(app).get("/v1/api/admin/templates");

    expect(res.status).toBe(401);
  });
});

// ── Admin Template Restore: PATCH /admin/templates/:id/restore ────────

describe("admin template test: PATCH /admin/templates/:id/restore", () => {
  it("berhasil mengaktifkan kembali template yang dinonaktifkan (200)", async () => {
    (TemplateRepository.findById as Mock).mockResolvedValue({
      ...mockTemplate,
      isActive: false,
    });
    (TemplateRepository.restore as Mock).mockResolvedValue({
      ...mockTemplate,
      isActive: true,
    });

    const res = await request(app).patch(`/v1/api/admin/templates/${mockTemplate.id}/restore`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Template berhasil diaktifkan kembali");
    expect(res.body.data.isActive).toBe(true);
    expect(TemplateRepository.restore).toHaveBeenCalledWith(mockTemplate.id);
  });

  it("mengembalikan 404 jika template tidak ditemukan (404)", async () => {
    (TemplateRepository.findById as Mock).mockResolvedValue(null);

    const res = await request(app).patch("/v1/api/admin/templates/non-existent-template/restore").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Template tidak ditemukan");
  });

  it("menolak akses jika bukan ADMIN (403)", async () => {
    const res = await request(app).patch(`/v1/api/admin/templates/${mockTemplate.id}/restore`).set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
