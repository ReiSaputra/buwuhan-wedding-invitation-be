import type { PlanTier } from "../../generated/prisma/client";
import { InvitationRepository, type AdminInvitationFilterParams } from "./invitation.repository";
import { TemplateRepository } from "../template/template.repository";
import { isTierSufficient } from "../template/template.types";
import {
  adminInvitationDetailResponse,
  adminInvitationListResponse,
  createInvitationResponse,
  deleteInvitationResponse,
  galleryPhotoResponse,
  getInvitationResponse,
  listInvitationResponse,
  loveStoryResponse,
  toInvitationData,
  updateInvitationResponse,
  updateInvitationStatusResponse,
  type AddGalleryPhotoReq,
  type AddLoveStoryReq,
  type AdminInvitationDetailRes,
  type AdminInvitationListItem,
  type AdminInvitationListRes,
  type CreateInvitationReq,
  type CreateInvitationRes,
  type DeleteInvitationRes,
  type GalleryPhotoRes,
  type GetInvitationRes,
  type InvitationStatusType,
  type ListInvitationRes,
  type LoveStoryRes,
  type UpdateGalleryPhotoReq,
  type UpdateInvitationReq,
  type UpdateInvitationRes,
  type UpdateInvitationStatusReq,
  type UpdateInvitationStatusRes,
  type UpdateLoveStoryReq,
} from "./invitation.types";

import { ConflictError, ForbiddenError, NotFoundError } from "../../errors/app.error";
import { checkQuota, PLAN_QUOTA } from "../../lib/plan-quota";

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

    if (!invitation || (invitation.status !== "ACTIVE" && invitation.status !== "COMPLETED")) {
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

  static async updateStatus(id: string, ownerId: string, requesterTier: PlanTier, request: UpdateInvitationStatusReq): Promise<UpdateInvitationStatusRes> {
    const existing = await InvitationRepository.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundError("Undangan tidak ditemukan");

    // Jika ingin mengaktifkan undangan (status ACTIVE) dan sebelumnya belum ACTIVE, cek kuota
    if (request.status === "ACTIVE" && existing.status !== "ACTIVE") {
      const activeCount = await InvitationRepository.countActiveByOwner(ownerId);
      const quota = PLAN_QUOTA[requesterTier];
      checkQuota(activeCount, quota.maxActiveInvitations, "undangan aktif");
    }

    let publishedAt: Date | undefined = undefined;
    if (request.status === "ACTIVE" && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const updated = await InvitationRepository.updateStatus(id, ownerId, request.status, publishedAt);

    return updateInvitationStatusResponse(updated);
  }

  static async remove(id: string, ownerId: string): Promise<DeleteInvitationRes> {
    const existing = await InvitationRepository.findByIdAndOwner(id, ownerId);

    if (!existing) throw new NotFoundError("Undangan tidak ditemukan");

    await InvitationRepository.deleteById(id);

    return deleteInvitationResponse();
  }

  // ── Galeri Foto ──────────────────────────────────────────────────────

  static async addGalleryPhoto(invitationId: string, ownerId: string, requesterTier: PlanTier, request: AddGalleryPhotoReq): Promise<GalleryPhotoRes> {
    const invitation = await InvitationRepository.findByIdAndOwner(invitationId, ownerId);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    // Cek kuota foto galeri per undangan
    const photoCount = await InvitationRepository.countGalleryPhotos(invitationId);
    const quota = PLAN_QUOTA[requesterTier];
    checkQuota(photoCount, quota.maxGalleryPhotos, "foto galeri");

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

  // ── Admin Moderation & Overview ─────────────────────────────────────

  static async listInvitationsForAdmin(params: AdminInvitationFilterParams): Promise<AdminInvitationListRes> {
    const { total, invitations } = await InvitationRepository.findManyWithFilterForAdmin(params);

    const list: AdminInvitationListItem[] = invitations.map((inv) => ({
      id: inv.id,
      title: inv.title,
      slug: inv.slug,
      status: inv.status,
      eventCategory: inv.eventCategory,
      eventDate: inv.eventDate,
      eventTime: inv.eventTime,
      venue: inv.venue,
      address: inv.address,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      owner: inv.owner,
      template: inv.template,
      stats: {
        totalGuests: inv._count.guests,
        totalRsvps: inv._count.rsvps,
      },
    }));

    const totalPages = Math.ceil(total / params.limit) || 1;

    return adminInvitationListResponse(list, {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    });
  }

  static async getInvitationDetailForAdmin(id: string): Promise<AdminInvitationDetailRes> {
    const invitation = await InvitationRepository.findByIdForAdmin(id);

    if (!invitation) throw new NotFoundError("Undangan tidak ditemukan");

    const baseData = toInvitationData(invitation);

    return adminInvitationDetailResponse({
      ...baseData,
      owner: invitation.owner,
      stats: {
        totalGuests: invitation._count.guests,
        totalRsvps: invitation._count.rsvps,
      },
    });
  }

  static async updateStatusByAdmin(id: string, status: InvitationStatusType): Promise<UpdateInvitationStatusRes> {
    const existing = await InvitationRepository.findByIdForAdmin(id);

    if (!existing) throw new NotFoundError("Undangan tidak ditemukan");

    let publishedAt: Date | null | undefined = undefined;
    if (status === "ACTIVE" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (status === "DRAFT") {
      publishedAt = null;
    }

    const updated = await InvitationRepository.updateStatusByAdmin(id, status, publishedAt);

    return updateInvitationStatusResponse(updated);
  }
}
