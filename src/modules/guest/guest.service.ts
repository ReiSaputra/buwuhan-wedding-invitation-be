import crypto from "crypto";

import { GuestRepository } from "./guest.repository";
import {
  bulkCreateGuestResponse,
  checkInGuestResponse,
  checkOutGuestResponse,
  createGuestResponse,
  deleteGuestResponse,
  getGuestResponse,
  getGuestStatsResponse,
  listGuestResponse,
  updateGuestResponse,
  type BulkCreateGuestReq,
  type BulkCreateGuestRes,
  type CheckInGuestReq,
  type CheckInGuestRes,
  type CheckOutGuestReq,
  type CheckOutGuestRes,
  type CreateGuestReq,
  type CreateGuestRes,
  type DeleteGuestRes,
  type GetGuestRes,
  type GetGuestStatsRes,
  type GuestFilterQuery,
  type ListGuestRes,
  type UpdateGuestReq,
  type UpdateGuestRes,
} from "./guest.types";
import { NotFoundError } from "../../errors/app.error";

function generateQrToken(): string {
  // Generate random token 12 karakter hex huruf besar (contoh: 7B3A9C12E4F0)
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

function formatCoupleNames(couples?: { name: string }[]): string | undefined {
  if (!couples || couples.length === 0) return undefined;
  return couples.map((c) => c.name).join(" & ");
}

export class GuestService {
  static async create(invitationId: string, ownerId: string, request: CreateGuestReq): Promise<CreateGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const qrCode = generateQrToken();
    const guest = await GuestRepository.create(invitationId, request, qrCode);
    const coupleNames = formatCoupleNames(invitation.couples);

    return createGuestResponse(guest, invitation.slug, coupleNames);
  }

  static async bulkCreate(invitationId: string, ownerId: string, request: BulkCreateGuestReq): Promise<BulkCreateGuestRes> {
    const invitation = await GuestRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
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

    if (!guest || !guest.invitation || guest.invitation.slug !== slug || !guest.invitation.isPublished) {
      throw new NotFoundError("Undangan atau data tamu tidak ditemukan");
    }

    const coupleNames = formatCoupleNames(guest.invitation.couples);

    return getGuestResponse(guest, guest.invitation.slug, coupleNames);
  }
}
