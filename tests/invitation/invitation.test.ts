import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import { invitationRouter } from "../../src/modules/invitation/invitation.routes";
import { InvitationRepository } from "../../src/modules/invitation/invitation.repository";
import { TemplateRepository } from "../../src/modules/template/template.repository";
import { errorHandler } from "../../src/middlewares/error.middleware";
import { Prisma } from "../../src/generated/prisma/client";

process.env.JWT_SECRET = "test-jwt-secret";

beforeAll(() => {
  vi.spyOn(InvitationRepository, "findBySlug");
  vi.spyOn(InvitationRepository, "findByIdAndOwner");
  vi.spyOn(InvitationRepository, "findManyByOwner");
  vi.spyOn(InvitationRepository, "create");
  vi.spyOn(InvitationRepository, "update");
  vi.spyOn(InvitationRepository, "updateStatus");
  vi.spyOn(InvitationRepository, "deleteById");
  vi.spyOn(InvitationRepository, "addGalleryPhoto");
  vi.spyOn(InvitationRepository, "findGalleryPhotoById");
  vi.spyOn(InvitationRepository, "updateGalleryPhoto");
  vi.spyOn(InvitationRepository, "deleteGalleryPhoto");
  vi.spyOn(InvitationRepository, "addLoveStory");
  vi.spyOn(InvitationRepository, "findLoveStoryById");
  vi.spyOn(InvitationRepository, "updateLoveStory");
  vi.spyOn(InvitationRepository, "deleteLoveStory");
  vi.spyOn(TemplateRepository, "findActiveById");
});

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/v1/api", invitationRouter);
  app.use(errorHandler);
  return app;
}

const app = buildTestApp();

const mockUser = {
  id: "user-123",
  role: "USER" as const,
  planTier: "FREE" as const,
};

const validAuthToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: "1d" });

const mockPhoto = {
  id: "photo-1",
  imageUrl: "https://storage.buwuhan.com/photos/bromo.jpg",
  caption: "Prewedding Bromo",
  order: 1,
  invitationId: "inv-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStory = {
  id: "story-1",
  yearOrDate: "2020",
  title: "Pertama Bertemu",
  story: "Kami pertama kali bertemu di kampus...",
  imageUrl: "https://storage.buwuhan.com/photos/meet.jpg",
  order: 1,
  invitationId: "inv-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockInvitation = {
  id: "inv-123",
  title: "Pernikahan Ayu & Budi",
  slug: "ayu-dan-budi",
  status: "ACTIVE" as const,
  eventCategory: "WEDDING" as const,
  publishedAt: new Date(),
  eventDate: new Date("2026-10-10T00:00:00.000Z"),
  eventTime: "07:00 WIB",
  venue: "Grand Ballroom Hotel Indonesia",
  address: "Jl. MH Thamrin No. 1, Jakarta Pusat",
  additionalInfo: {},
  templateId: null,
  template: null,
  ownerId: mockUser.id,
  couples: [
    { id: "c-1", name: "Ayu", type: "BRIDE" as const, fatherName: "Bambang", motherName: "Siti", invitationId: "inv-123" },
    { id: "c-2", name: "Budi", type: "GROOM" as const, fatherName: "Joko", motherName: "Sri", invitationId: "inv-123" },
  ],
  galleryPhotos: [mockPhoto],
  loveStories: [mockStory],
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("invitation test: CRUD & Public", () => {
  it("berhasil membuat undangan baru dengan field event (201)", async () => {
    (InvitationRepository.findBySlug as Mock).mockResolvedValue(null);
    (InvitationRepository.create as Mock).mockResolvedValue(mockInvitation);

    const res = await request(app)
      .post("/v1/api/invitations")
      .set("Authorization", `Bearer ${validAuthToken}`)
      .send({
        title: "Pernikahan Ayu & Budi",
        slug: "ayu-dan-budi",
        eventCategory: "WEDDING",
        eventDate: "2026-10-10T00:00:00.000Z",
        eventTime: "07:00 WIB",
        venue: "Grand Ballroom Hotel Indonesia",
        address: "Jl. MH Thamrin No. 1, Jakarta Pusat",
        couples: [
          { type: "BRIDE", name: "Ayu", fatherName: "Bambang", motherName: "Siti" },
          { type: "GROOM", name: "Budi", fatherName: "Joko", motherName: "Sri" },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Undangan berhasil dibuat");
    expect(res.body.data.id).toBe(mockInvitation.id);
    expect(res.body.data.status).toBe("ACTIVE");
    expect(res.body.data.eventCategory).toBe("WEDDING");
    expect(res.body.data.showCouples).toBe(true);
    expect(res.body.data.venue).toBe("Grand Ballroom Hotel Indonesia");
  });

  it("berhasil membuat undangan baru dari modal quick wizard tanpa couples (201)", async () => {
    (InvitationRepository.findBySlug as Mock).mockResolvedValue(null);
    (TemplateRepository.findActiveById as Mock).mockResolvedValue({
      id: "tpl-123",
      tier: "FREE",
    });
    (InvitationRepository.create as Mock).mockResolvedValue({
      ...mockInvitation,
      couples: [],
    });

    const res = await request(app).post("/v1/api/invitations").set("Authorization", `Bearer ${validAuthToken}`).send({
      title: "Han & Saputra",
      slug: "han-saputra",
      eventDate: "2026-10-20T00:00:00.000Z",
      templateId: "tpl-123",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Undangan berhasil dibuat");
    expect(res.body.data.slug).toBe(mockInvitation.slug);
    expect(res.body.data.showCouples).toBe(true);
  });

  it("berhasil membuat undangan non-pernikahan (KHITANAN) dengan showCouples false (201)", async () => {
    (InvitationRepository.findBySlug as Mock).mockResolvedValue(null);
    (InvitationRepository.create as Mock).mockResolvedValue({
      ...mockInvitation,
      eventCategory: "KHITANAN",
      title: "Khitanan Muhammad Farel",
      slug: "khitanan-muhammad-farel",
      couples: [],
    });

    const res = await request(app).post("/v1/api/invitations").set("Authorization", `Bearer ${validAuthToken}`).send({
      title: "Khitanan Muhammad Farel",
      slug: "khitanan-muhammad-farel",
      eventCategory: "KHITANAN",
      eventDate: "2026-11-15T00:00:00.000Z",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Undangan berhasil dibuat");
    expect(res.body.data.eventCategory).toBe("KHITANAN");
    expect(res.body.data.showCouples).toBe(false);
  });

  it("berhasil melihat daftar undangan milik sendiri (200)", async () => {
    (InvitationRepository.findManyByOwner as Mock).mockResolvedValue([mockInvitation]);

    const res = await request(app).get("/v1/api/invitations").set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe("ACTIVE");
  });

  it("berhasil melihat detail undangan sendiri lengkap dengan galeri dan cerita (200)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);

    const res = await request(app).get(`/v1/api/invitations/${mockInvitation.id}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.galleryPhotos).toHaveLength(1);
    expect(res.body.data.loveStories).toHaveLength(1);
    expect(res.body.data.galleryPhotos[0].caption).toBe(mockPhoto.caption);
    expect(res.body.data.loveStories[0].title).toBe(mockStory.title);
  });

  it("berhasil melihat undangan publik via slug jika status ACTIVE (200)", async () => {
    (InvitationRepository.findBySlug as Mock).mockResolvedValue(mockInvitation);

    const res = await request(app).get(`/v1/api/public/invitations/${mockInvitation.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(mockInvitation.slug);
    expect(res.body.data.status).toBe("ACTIVE");
    expect(res.body.data.galleryPhotos).toHaveLength(1);
  });

  it("berhasil melihat undangan publik via slug jika status COMPLETED (200)", async () => {
    (InvitationRepository.findBySlug as Mock).mockResolvedValue({
      ...mockInvitation,
      status: "COMPLETED",
    });

    const res = await request(app).get(`/v1/api/public/invitations/${mockInvitation.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });

  it("menolak akses undangan publik jika status DRAFT (404)", async () => {
    (InvitationRepository.findBySlug as Mock).mockResolvedValue({
      ...mockInvitation,
      status: "DRAFT",
    });

    const res = await request(app).get(`/v1/api/public/invitations/${mockInvitation.slug}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Undangan tidak ditemukan");
  });

  it("berhasil update status undangan (200) dan memastikan ID yang benar digunakan", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.updateStatus as Mock).mockResolvedValue({
      ...mockInvitation,
      status: "ACTIVE",
    });

    const res = await request(app).patch(`/v1/api/invitations/${mockInvitation.id}/status`).set("Authorization", `Bearer ${validAuthToken}`).send({ status: "ACTIVE" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Status undangan berhasil diperbarui");
    expect(res.body.data.status).toBe("ACTIVE");

    // Pastikan repository.updateStatus dipanggil dengan ID undangan yang tepat (bukan ID lain)
    // publishedAt = undefined karena mockInvitation sudah memiliki publishedAt (tidak di-set ulang)
    expect(InvitationRepository.updateStatus).toHaveBeenCalledWith(mockInvitation.id, mockUser.id, "ACTIVE", undefined);
    // Pastikan ID yang ada di response sesuai dengan yang diminta
    expect(res.body.data.id).toBe(mockInvitation.id);
  });

  it("menolak update status undangan milik pengguna lain atau tidak ditemukan (404)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app).patch(`/v1/api/invitations/undangan-orang-lain/status`).set("Authorization", `Bearer ${validAuthToken}`).send({ status: "ACTIVE" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Undangan tidak ditemukan");
    // Pastikan updateStatus TIDAK pernah dipanggil ketika ID tidak ditemukan / bukan milik user
    expect(InvitationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("otomatis set publishedAt saat pertama kali diaktifkan (status ACTIVE, belum pernah publish)", async () => {
    const unpublishedInvitation = { ...mockInvitation, publishedAt: null };
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(unpublishedInvitation);
    (InvitationRepository.updateStatus as Mock).mockResolvedValue({
      ...unpublishedInvitation,
      status: "ACTIVE",
      publishedAt: new Date(),
    });

    const res = await request(app).patch(`/v1/api/invitations/${mockInvitation.id}/status`).set("Authorization", `Bearer ${validAuthToken}`).send({ status: "ACTIVE" });

    expect(res.status).toBe(200);
    // Pastikan updateStatus dipanggil dengan publishedAt berupa Date (bukan undefined/null)
    const callArgs = (InvitationRepository.updateStatus as Mock).mock.calls[0];
    expect(callArgs[0]).toBe(mockInvitation.id); // id yang benar
    expect(callArgs[1]).toBe(mockUser.id); // ownerId yang benar
    expect(callArgs[2]).toBe("ACTIVE"); // status
    expect(callArgs[3]).toBeInstanceOf(Date); // publishedAt di-set otomatis
  });

  it("berhasil menghapus undangan (200)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.deleteById as Mock).mockResolvedValue(mockInvitation);

    const res = await request(app).delete(`/v1/api/invitations/${mockInvitation.id}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Undangan berhasil dihapus");
  });

  it("menolak menghapus undangan milik pengguna lain atau tidak ditemukan (404)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/v1/api/invitations/unowned-id`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Undangan tidak ditemukan");
  });

  it("menangani Prisma foreign key error saat penghapusan (409)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.deleteById as Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key violation", {
        code: "P2003",
        clientVersion: "7.9.1",
      }),
    );

    const res = await request(app).delete(`/v1/api/invitations/${mockInvitation.id}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Data ini masih terhubung dengan data lain sehingga tidak bisa dihapus");
  });
});

describe("invitation test: Galeri Foto", () => {
  it("berhasil menambahkan foto ke galeri undangan (201)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.addGalleryPhoto as Mock).mockResolvedValue(mockPhoto);

    const res = await request(app).post(`/v1/api/invitations/${mockInvitation.id}/gallery`).set("Authorization", `Bearer ${validAuthToken}`).send({
      imageUrl: mockPhoto.imageUrl,
      caption: mockPhoto.caption,
      order: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Foto galeri berhasil ditambahkan");
    expect(res.body.data.imageUrl).toBe(mockPhoto.imageUrl);
  });

  it("berhasil update caption dan urutan foto galeri (200)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.findGalleryPhotoById as Mock).mockResolvedValue(mockPhoto);
    (InvitationRepository.updateGalleryPhoto as Mock).mockResolvedValue({
      ...mockPhoto,
      caption: "Foto Baru",
      order: 2,
    });

    const res = await request(app).patch(`/v1/api/invitations/${mockInvitation.id}/gallery/${mockPhoto.id}`).set("Authorization", `Bearer ${validAuthToken}`).send({
      caption: "Foto Baru",
      order: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Foto galeri berhasil diperbarui");
    expect(res.body.data.caption).toBe("Foto Baru");
  });

  it("berhasil menghapus foto galeri (200)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.findGalleryPhotoById as Mock).mockResolvedValue(mockPhoto);
    (InvitationRepository.deleteGalleryPhoto as Mock).mockResolvedValue(mockPhoto);

    const res = await request(app).delete(`/v1/api/invitations/${mockInvitation.id}/gallery/${mockPhoto.id}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Foto galeri berhasil dihapus");
  });

  it("menolak tambah foto jika undangan bukan milik requester (404)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(null);

    const res = await request(app).post(`/v1/api/invitations/bukan-milik/gallery`).set("Authorization", `Bearer ${validAuthToken}`).send({
      imageUrl: "https://photo.jpg",
    });

    expect(res.status).toBe(404);
  });
});

describe("invitation test: Kisah Cinta (Love Story)", () => {
  it("berhasil menambahkan momen kisah cinta (201)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.addLoveStory as Mock).mockResolvedValue(mockStory);

    const res = await request(app).post(`/v1/api/invitations/${mockInvitation.id}/stories`).set("Authorization", `Bearer ${validAuthToken}`).send({
      yearOrDate: "2020",
      title: "Pertama Bertemu",
      story: "Kami pertama kali bertemu di kampus...",
      imageUrl: "https://storage.buwuhan.com/photos/meet.jpg",
      order: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Kisah cinta berhasil ditambahkan");
    expect(res.body.data.title).toBe("Pertama Bertemu");
  });

  it("berhasil update momen kisah cinta (200)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.findLoveStoryById as Mock).mockResolvedValue(mockStory);
    (InvitationRepository.updateLoveStory as Mock).mockResolvedValue({
      ...mockStory,
      title: "Momen Pertama",
    });

    const res = await request(app).patch(`/v1/api/invitations/${mockInvitation.id}/stories/${mockStory.id}`).set("Authorization", `Bearer ${validAuthToken}`).send({
      title: "Momen Pertama",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Kisah cinta berhasil diperbarui");
  });

  it("berhasil menghapus momen kisah cinta (200)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.findLoveStoryById as Mock).mockResolvedValue(mockStory);
    (InvitationRepository.deleteLoveStory as Mock).mockResolvedValue(mockStory);

    const res = await request(app).delete(`/v1/api/invitations/${mockInvitation.id}/stories/${mockStory.id}`).set("Authorization", `Bearer ${validAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Kisah cinta berhasil dihapus");
  });

  it("menolak update cerita jika cerita tidak ditemukan (404)", async () => {
    (InvitationRepository.findByIdAndOwner as Mock).mockResolvedValue(mockInvitation);
    (InvitationRepository.findLoveStoryById as Mock).mockResolvedValue(null);

    const res = await request(app).patch(`/v1/api/invitations/${mockInvitation.id}/stories/story-palsu`).set("Authorization", `Bearer ${validAuthToken}`).send({
      title: "Cerita",
    });

    expect(res.status).toBe(404);
  });
});
