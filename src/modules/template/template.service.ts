import type { EventCategory, PlanTier } from "../../generated/prisma/client";
import { TemplateRepository } from "./template.repository";
import {
  createTemplateResponse,
  deactivateTemplateResponse,
  getTemplateResponse,
  listTemplateResponse,
  updateTemplateResponse,
  type CreateTemplateReq,
  type CreateTemplateRes,
  type DeactivateTemplateRes,
  type GetTemplateRes,
  type ListTemplateRes,
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
}
