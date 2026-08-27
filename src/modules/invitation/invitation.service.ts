import type { PlanTier } from "../../generated/prisma/client";
import { InvitationRepository } from "./invitation.repository";
import { TemplateRepository } from "../template/template.repository";
import { isTierSufficient } from "../template/template.types";
import {
  createInvitationResponse,
  deleteInvitationResponse,
  galleryPhotoResponse,
  getInvitationResponse,
  listInvitationResponse,
  loveStoryResponse,
  publishInvitationResponse,
  updateInvitationResponse,
  type AddGalleryPhotoReq,
  type AddLoveStoryReq,
  type CreateInvitationReq,
  type CreateInvitationRes,
  type DeleteInvitationRes,
  type GalleryPhotoRes,
  type GetInvitationRes,
  type ListInvitationRes,
  type LoveStoryRes,
  type PublishInvitationReq,
  type PublishInvitationRes,
  type UpdateGalleryPhotoReq,
  type UpdateInvitationReq,
  type UpdateInvitationRes,
  type UpdateLoveStoryReq,
} from "./invitation.types";

import { ConflictError, ForbiddenError, NotFoundError } from "../../errors/app.error";

async function ensureTemplateAccessible(templateId: string, requesterTier: PlanTier): Promise<void> {
  const template = await TemplateRepository.findActiveById(templateId);

  if (!template) throw new NotFoundError("Template tidak ditemukan");

  if (!isTierSufficient(requesterTier, template.tier)) {
    throw new ForbiddenError(`Template ini butuh paket ${template.tier} ke atas`);
  }
}

export class InvitationService {
  static async create(ownerId: string, requesterTier: PlanTier, request: CreateInvitationReq): Promise<CreateInvitationRes> {
    const existingSlug = await InvitationRepository.findBySlug(request.slug);

    if (existingSlug) throw new ConflictError("Slug sudah digunakan");

    if (request.templateId) {
      await ensureTemplateAccessible(request.templateId, requesterTier);
    }

    const invitation = await InvitationRepository.create(ownerId, request);

    return createInvitationResponse(invitation);
  }

  static async listMine(ownerId: string): Promise<ListInvitationRes> {
    const invitations = await InvitationRepository.findManyByOwner(ownerId);

    return listInvitationResponse(invitations);
  }

  static async getOwned(id: string, ownerId: string): Promise<GetInvitationRes> {
    const invitation = await InvitationRepository.findByIdAndOwner(id, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    return getInvitationResponse(invitation);
  }

  static async getPublicBySlug(slug: string): Promise<GetInvitationRes> {
    const invitation = await InvitationRepository.findBySlug(slug);

    if (!invitation || !invitation.isPublished) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    return getInvitationResponse(invitation);
  }

  static async update(id: string, ownerId: string, requesterTier: PlanTier, request: UpdateInvitationReq): Promise<UpdateInvitationRes> {
    const existing = await InvitationRepository.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundError("Undangan tidak ditemukan");

    if (request.slug && request.slug !== existing.slug) {
      const slugTaken = await InvitationRepository.findBySlug(request.slug);
      if (slugTaken) throw new ConflictError("Slug sudah digunakan");
    }

    if (request.templateId) {
      await ensureTemplateAccessible(request.templateId, requesterTier);
    }

    const updated = await InvitationRepository.update(id, request);

    return updateInvitationResponse(updated);
  }

  static async setPublishStatus(id: string, ownerId: string, request: PublishInvitationReq): Promise<PublishInvitationRes> {
    const existing = await InvitationRepository.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundError("Undangan tidak ditemukan");

    const updated = await InvitationRepository.setPublishStatus(id, request.isPublished);

    return publishInvitationResponse(updated);
  }

  static async remove(id: string, ownerId: string): Promise<DeleteInvitationRes> {
    const existing = await InvitationRepository.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundError("Undangan tidak ditemukan");

    await InvitationRepository.deleteById(id);

    return deleteInvitationResponse();
  }

  // ── Galeri Foto ──────────────────────────────────────────────────────

  static async addGalleryPhoto(invitationId: string, ownerId: string, request: AddGalleryPhotoReq): Promise<GalleryPhotoRes> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const photo = await InvitationRepository.addGalleryPhoto(invitationId, request);

    return galleryPhotoResponse(photo, "Foto galeri berhasil ditambahkan", 201);
  }

  static async updateGalleryPhoto(invitationId: string, photoId: string, ownerId: string, request: UpdateGalleryPhotoReq): Promise<GalleryPhotoRes> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const existing = await InvitationRepository.findGalleryPhotoById(photoId, invitationId);

    if (!existing) throw new NotFoundError("Foto galeri tidak ditemukan");

    const updated = await InvitationRepository.updateGalleryPhoto(photoId, request);

    return galleryPhotoResponse(updated, "Foto galeri berhasil diperbarui", 200);
  }

  static async removeGalleryPhoto(invitationId: string, photoId: string, ownerId: string): Promise<{ message: string; status: number }> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const existing = await InvitationRepository.findGalleryPhotoById(photoId, invitationId);

    if (!existing) throw new NotFoundError("Foto galeri tidak ditemukan");

    await InvitationRepository.deleteGalleryPhoto(photoId);

    return { message: "Foto galeri berhasil dihapus", status: 200 };
  }

  // ── Kisah Cinta (Love Story) ─────────────────────────────────────────

  static async addLoveStory(invitationId: string, ownerId: string, request: AddLoveStoryReq): Promise<LoveStoryRes> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const story = await InvitationRepository.addLoveStory(invitationId, request);

    return loveStoryResponse(story, "Kisah cinta berhasil ditambahkan", 201);
  }

  static async updateLoveStory(invitationId: string, storyId: string, ownerId: string, request: UpdateLoveStoryReq): Promise<LoveStoryRes> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const existing = await InvitationRepository.findLoveStoryById(storyId, invitationId);

    if (!existing) throw new NotFoundError("Kisah cinta tidak ditemukan");

    const updated = await InvitationRepository.updateLoveStory(storyId, request);

    return loveStoryResponse(updated, "Kisah cinta berhasil diperbarui", 200);
  }

  static async removeLoveStory(invitationId: string, storyId: string, ownerId: string): Promise<{ message: string; status: number }> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const existing = await InvitationRepository.findLoveStoryById(storyId, invitationId);

    if (!existing) throw new NotFoundError("Kisah cinta tidak ditemukan");

    await InvitationRepository.deleteLoveStory(storyId);

    return { message: "Kisah cinta berhasil dihapus", status: 200 };
  }
}
