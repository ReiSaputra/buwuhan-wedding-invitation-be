import type { EventCategory, PlanTier } from "../../generated/prisma/client";
import { TemplateRepository } from "./template.repository";
import {
  adminTemplateListResponse,
  createTemplateResponse,
  deactivateTemplateResponse,
  getTemplateResponse,
  listTemplateResponse,
  restoreTemplateResponse,
  updateTemplateResponse,
  type AdminTemplateFilterParams,
  type AdminTemplateListItem,
  type AdminTemplateListRes,
  type CreateTemplateReq,
  type CreateTemplateRes,
  type DeactivateTemplateRes,
  type GetTemplateRes,
  type ListTemplateRes,
  type RestoreTemplateRes,
  type UpdateTemplateReq,
  type UpdateTemplateRes,
} from "./template.types";

import { ConflictError, NotFoundError } from "../../errors/app.error";

export class TemplateService {
  // dipakai di panel pembuat undangan -- cuma template aktif, `isAccessible`
  // dihitung dari planTier user yang sedang login
  static async listForUser(requesterTier: PlanTier, eventCategory?: EventCategory): Promise<ListTemplateRes> {
    const templates = await TemplateRepository.findActive(eventCategory);

    return listTemplateResponse(templates, requesterTier);
  }

  static async getBySlugForUser(slug: string, requesterTier: PlanTier): Promise<GetTemplateRes> {
    const template = await TemplateRepository.findActiveBySlug(slug);

    if (!template) throw new NotFoundError("Template tidak ditemukan");

    return getTemplateResponse(template, requesterTier);
  }

  // ── admin-only ─────────────────────────────────────────────────────

  static async create(request: CreateTemplateReq, requesterTier: PlanTier): Promise<CreateTemplateRes> {
    const existingSlug = await TemplateRepository.findBySlug(request.slug);

    if (existingSlug) throw new ConflictError("Slug sudah digunakan");

    const template = await TemplateRepository.create(request);

    return createTemplateResponse(template, requesterTier);
  }

  static async update(id: string, request: UpdateTemplateReq, requesterTier: PlanTier): Promise<UpdateTemplateRes> {
    const existing = await TemplateRepository.findById(id);

    if (!existing) throw new NotFoundError("Template tidak ditemukan");

    if (request.slug && request.slug !== existing.slug) {
      const slugTaken = await TemplateRepository.findBySlug(request.slug);
      if (slugTaken) throw new ConflictError("Slug sudah digunakan");
    }

    const updated = await TemplateRepository.update(id, request);

    return updateTemplateResponse(updated, requesterTier);
  }

  static async deactivate(id: string): Promise<DeactivateTemplateRes> {
    const existing = await TemplateRepository.findById(id);

    if (!existing) throw new NotFoundError("Template tidak ditemukan");

    await TemplateRepository.deactivate(id);

    return deactivateTemplateResponse();
  }

  static async listForAdmin(params: AdminTemplateFilterParams): Promise<AdminTemplateListRes> {
    const templates = await TemplateRepository.findAllWithFilter(params);

    const list: AdminTemplateListItem[] = templates.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tier: t.tier,
      eventCategory: t.eventCategory,
      previewImageUrl: t.previewImageUrl,
      isActive: t.isActive,
      usageCount: t._count.invitations,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return adminTemplateListResponse(list);
  }

  static async restore(id: string, requesterTier: PlanTier): Promise<RestoreTemplateRes> {
    const existing = await TemplateRepository.findById(id);

    if (!existing) throw new NotFoundError("Template tidak ditemukan");

    const restored = await TemplateRepository.restore(id);

    return restoreTemplateResponse(restored, requesterTier);
  }
}

