import crypto from "crypto";

import { GuestRepository } from "./guest.repository";
import {
  bulkCreateGuestResponse,
  bulkSendGuestEmailResponse,
  buildInvitationUrl,
  checkInGuestResponse,
  checkOutGuestResponse,
  createGuestResponse,
  deleteGuestResponse,
  getGuestResponse,
  getGuestShareResponse,
  getGuestStatsResponse,
  listGuestResponse,
  sendGuestEmailResponse,
  updateGuestResponse,
  type BulkCreateGuestReq,
  type BulkCreateGuestRes,
  type BulkSendGuestEmailReq,
  type BulkSendGuestEmailRes,
  type CheckInGuestReq,
  type CheckInGuestRes,
  type CheckOutGuestReq,
  type CheckOutGuestRes,
  type CreateGuestReq,
  type CreateGuestRes,
  type DeleteGuestRes,
  type GetGuestRes,
  type GetGuestShareRes,
  type GetGuestStatsRes,
  type GuestFilterQuery,
  type ListGuestRes,
  type SendGuestEmailRes,
  type UpdateGuestReq,
  type UpdateGuestRes,
} from "./guest.types";
import { EmailDeliveryError, NotFoundError, ValidationError } from "../../errors/app.error";
import { mailer } from "../../lib/mailer";
import { generateInvitationEmailHtml, generateInvitationEmailText } from "./guest.mail";
import { logger } from "../../utils/log";
import type { PlanTier } from "../../generated/prisma/client";
import { checkQuota, PLAN_QUOTA } from "../../lib/plan-quota";

function generateQrToken(): string {
  // Generate random token 12 karakter hex huruf besar (contoh: 7B3A9C12E4F0)
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

function formatCoupleNames(couples?: { name: string }[]): string | undefined {
  if (!couples || couples.length === 0) return undefined;
  return couples.map((c) => c.name).join(" & ");
}

export class GuestService {
  static async create(invitationId: string, ownerId: string, requesterTier: PlanTier, request: CreateGuestReq): Promise<CreateGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    // Cek kuota tamu per undangan
    const guestCount = await GuestRepository.countByInvitationId(invitationId);
    const quota = PLAN_QUOTA[requesterTier];
    checkQuota(guestCount, quota.maxGuestsPerInvitation, "tamu per undangan");

    const qrCode = generateQrToken();
    const guest = await GuestRepository.create(invitationId, request, qrCode);
    const coupleNames = formatCoupleNames(invitation.couples);

    return createGuestResponse(guest, invitation.slug, coupleNames);
  }

  static async bulkCreate(invitationId: string, ownerId: string, requesterTier: PlanTier, request: BulkCreateGuestReq): Promise<BulkCreateGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    // Cek kuota tamu per undangan dengan batch
    const currentGuestCount = await GuestRepository.countByInvitationId(invitationId);
    const quota = PLAN_QUOTA[requesterTier];
    if (quota.maxGuestsPerInvitation !== -1 && currentGuestCount + request.guests.length > quota.maxGuestsPerInvitation) {
      checkQuota(quota.maxGuestsPerInvitation, quota.maxGuestsPerInvitation, "tamu per undangan");
    }

    const guestsWithQr = request.guests.map((g) => ({
      ...g,
      qrCode: generateQrToken(),
    }));

    const createdGuests = await GuestRepository.createMany(invitationId, guestsWithQr);
    const coupleNames = formatCoupleNames(invitation.couples);

    return bulkCreateGuestResponse(createdGuests, invitation.slug, coupleNames);
  }

  static async list(invitationId: string, ownerId: string, filter?: GuestFilterQuery): Promise<ListGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const guests = await GuestRepository.findManyByInvitationId(invitationId, filter);
    const coupleNames = formatCoupleNames(invitation.couples);

    return listGuestResponse(guests, invitation.slug, coupleNames);
  }

  static async getById(invitationId: string, guestId: string, ownerId: string): Promise<GetGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const guest = await GuestRepository.findByIdAndInvitationId(guestId, invitationId);

    if (!guest) {
      throw new NotFoundError("Data tamu tidak ditemukan");
    }

    const coupleNames = formatCoupleNames(invitation.couples);

    return getGuestResponse(guest, invitation.slug, coupleNames);
  }

  static async update(invitationId: string, guestId: string, ownerId: string, request: UpdateGuestReq): Promise<UpdateGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const existing = await GuestRepository.findByIdAndInvitationId(guestId, invitationId);

    if (!existing) {
      throw new NotFoundError("Data tamu tidak ditemukan");
    }

    const updated = await GuestRepository.update(guestId, request);
    const coupleNames = formatCoupleNames(invitation.couples);

    return updateGuestResponse(updated, invitation.slug, coupleNames);
  }

  static async remove(invitationId: string, guestId: string, ownerId: string): Promise<DeleteGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const existing = await GuestRepository.findByIdAndInvitationId(guestId, invitationId);

    if (!existing) {
      throw new NotFoundError("Data tamu tidak ditemukan");
    }

    await GuestRepository.delete(guestId);

    return deleteGuestResponse();
  }

  static async checkIn(invitationId: string, ownerId: string, request: CheckInGuestReq): Promise<CheckInGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    let guest;
    if (request.qrCode) {
      guest = await GuestRepository.findByQrCodeAndInvitationId(request.qrCode, invitationId);
    } else if (request.guestId) {
      guest = await GuestRepository.findByIdAndInvitationId(request.guestId, invitationId);
    }

    if (!guest) {
      throw new NotFoundError("Data tamu dengan kode tersebut tidak ditemukan");
    }

    const checkedInGuest = await GuestRepository.checkIn(guest.id, request.paxActual);
    const coupleNames = formatCoupleNames(invitation.couples);

    return checkInGuestResponse(checkedInGuest, invitation.slug, coupleNames);
  }

  static async checkOut(invitationId: string, ownerId: string, request: CheckOutGuestReq): Promise<CheckOutGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    let guest;
    if (request.qrCode) {
      guest = await GuestRepository.findByQrCodeAndInvitationId(request.qrCode, invitationId);
    } else if (request.guestId) {
      guest = await GuestRepository.findByIdAndInvitationId(request.guestId, invitationId);
    }

    if (!guest) {
      throw new NotFoundError("Data tamu dengan kode tersebut tidak ditemukan");
    }

    const checkedOutGuest = await GuestRepository.checkOut(guest.id);
    const coupleNames = formatCoupleNames(invitation.couples);

    return checkOutGuestResponse(checkedOutGuest, invitation.slug, coupleNames);
  }

  static async getStats(invitationId: string, ownerId: string): Promise<GetGuestStatsRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const stats = await GuestRepository.getStats(invitationId);

    return getGuestStatsResponse(stats);
  }

  static async getPublicByQrCode(slug: string, qrCode: string): Promise<GetGuestRes> {
    const guest = await GuestRepository.findByQrCode(qrCode);

    if (!guest || !guest.invitation || guest.invitation.slug !== slug || guest.invitation.status === "DRAFT") {
      throw new NotFoundError("Undangan atau data tamu tidak ditemukan");
    }

    const coupleNames = formatCoupleNames(guest.invitation.couples);

    return getGuestResponse(guest, guest.invitation.slug, coupleNames);
  }

  // ── Email Provider Integration ───────────────────────────────────────

  static async sendEmail(invitationId: string, guestId: string, ownerId: string): Promise<SendGuestEmailRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const guest = await GuestRepository.findByIdAndInvitationId(guestId, invitationId);

    if (!guest) {
      throw new NotFoundError("Data tamu tidak ditemukan");
    }

    if (!guest.email || !guest.email.trim()) {
      throw new ValidationError("Tamu ini belum memiliki alamat email yang terdaftar");
    }

    const coupleNames = formatCoupleNames(invitation.couples);
    const invitationUrl = buildInvitationUrl(invitation.slug, guest.qrCode);

    const emailPayload = {
      guestName: guest.name,
      guestEmail: guest.email,
      qrCode: guest.qrCode,
      invitationTitle: invitation.title,
      invitationSlug: invitation.slug,
      invitationUrl,
      coupleNames,
      eventDate: invitation.eventDate,
      eventTime: invitation.eventTime,
      venue: invitation.venue,
      address: invitation.address,
    };

    const html = generateInvitationEmailHtml(emailPayload);
    const text = generateInvitationEmailText(emailPayload);

    try {
      await mailer.sendMail({
        to: guest.email,
        subject: `Undangan: ${invitation.title}`,
        html,
        text,
      });
    } catch (err) {
      logger.error(`[GuestService.sendEmail] Failed to send email to ${guest.email}:`, err);
      throw new EmailDeliveryError("Gagal mengirim email undangan. Pastikan alamat email tamu valid atau coba beberapa saat lagi.");
    }

    return sendGuestEmailResponse(guest);
  }

  static async sendEmailBulk(invitationId: string, ownerId: string, request?: BulkSendGuestEmailReq): Promise<BulkSendGuestEmailRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const guests = await GuestRepository.findGuestsForEmail(invitationId, request?.guestIds);
    const coupleNames = formatCoupleNames(invitation.couples);

    const results: { guestId: string; guestName: string; email: string; success: boolean; error?: string }[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const guest of guests) {
      if (!guest.email || !guest.email.trim()) {
        continue;
      }

      try {
        const invitationUrl = buildInvitationUrl(invitation.slug, guest.qrCode);
        const emailPayload = {
          guestName: guest.name,
          guestEmail: guest.email,
          qrCode: guest.qrCode,
          invitationTitle: invitation.title,
          invitationSlug: invitation.slug,
          invitationUrl,
          coupleNames,
          eventDate: invitation.eventDate,
          eventTime: invitation.eventTime,
          venue: invitation.venue,
          address: invitation.address,
        };

        const html = generateInvitationEmailHtml(emailPayload);
        const text = generateInvitationEmailText(emailPayload);

        await mailer.sendMail({
          to: guest.email,
          subject: `Undangan: ${invitation.title}`,
          html,
          text,
        });

        results.push({
          guestId: guest.id,
          guestName: guest.name,
          email: guest.email,
          success: true,
        });
        totalSent += 1;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Gagal mengirim email";
        logger.error(`[GuestService.sendEmailBulk] Error sending to ${guest.email}:`, err);
        results.push({
          guestId: guest.id,
          guestName: guest.name,
          email: guest.email,
          success: false,
          error: errorMsg,
        });
        totalFailed += 1;
      }
    }

    return bulkSendGuestEmailResponse(guests.length, totalSent, totalFailed, results);
  }

  // ── WhatsApp & Share Link Helper ────────────────────────────────────

  static async getShareInfo(invitationId: string, guestId: string, ownerId: string): Promise<GetGuestShareRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const guest = await GuestRepository.findByIdAndInvitationId(guestId, invitationId);

    if (!guest) {
      throw new NotFoundError("Data tamu tidak ditemukan");
    }

    const coupleNames = formatCoupleNames(invitation.couples);

    return getGuestShareResponse(guest, invitation.slug, coupleNames);
  }
}
