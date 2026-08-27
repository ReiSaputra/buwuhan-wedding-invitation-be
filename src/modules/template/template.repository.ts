// Taruh file ini di: src/modules/template/template.repository.ts

import { prisma } from "../../lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import type { CreateTemplateReq, UpdateTemplateReq } from "./template.types";

export class TemplateRepository {
  static async findActive() {
    return await prisma.template.findMany({
      where: { isActive: true },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });
  }

  static async findActiveBySlug(slug: string) {
    return await prisma.template.findFirst({
      where: { slug, isActive: true },
    });
  }

  // BARU -- dipakai InvitationService buat validasi tier sebelum
  // templateId dipasang ke sebuah undangan
  static async findActiveById(id: string) {
    return await prisma.template.findFirst({
      where: { id, isActive: true },
    });
  }

  static async findById(id: string) {
    return await prisma.template.findUnique({ where: { id } });
  }

  static async findBySlug(slug: string) {
    return await prisma.template.findUnique({ where: { slug } });
  }

  static async create(request: CreateTemplateReq) {
    try {
      return await prisma.template.create({
        data: {
          name: request.name,
          slug: request.slug,
          tier: request.tier,
          previewImageUrl: request.previewImageUrl,
          isActive: request.isActive ?? true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Slug sudah digunakan");
      }
      throw error;
    }
  }

  static async update(id: string, request: UpdateTemplateReq) {
    try {
      const data: Prisma.TemplateUpdateInput = {};

      if (request.name !== undefined) data.name = request.name;
      if (request.slug !== undefined) data.slug = request.slug;
      if (request.tier !== undefined) data.tier = request.tier;
      if (request.previewImageUrl !== undefined) data.previewImageUrl = request.previewImageUrl;
      if (request.isActive !== undefined) data.isActive = request.isActive;

      return await prisma.template.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Slug sudah digunakan");
      }
      throw error;
    }
  }

  // soft-delete -- bukan prisma.template.delete(). Invitation.templateId
  // masih boleh menunjuk ke template ini (referential action default Prisma
  // adalah Restrict), jadi hard delete akan gagal/berbahaya kalau template
  // sudah dipakai undangan manapun. Nonaktifkan saja supaya tidak muncul
  // lagi di GET /templates, tapi undangan lama yang sudah pakai tetap utuh.
  static async deactivate(id: string) {
    return await prisma.template.update({
      where: { id },
      data: { isActive: false },
    });
  }
}