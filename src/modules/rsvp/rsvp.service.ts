import crypto from "crypto";

import { RSVPRepository } from "./rsvp.repository";
import {
  deleteRSVPResponse,
  getRSVPStatsResponse,
  listRSVPResponse,
  listWishesResponse,
  submitRSVPResponse,
  type DeleteRSVPRes,
  type GetRSVPStatsRes,
  type ListRSVPRes,
  type ListWishesRes,
  type RSVPFilterQuery,
  type SubmitRSVPReq,
  type SubmitRSVPRes,
  type WishesQuery,
} from "./rsvp.types";
import { NotFoundError } from "../../errors/app.error";

function generateQrToken(): string {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

export class RSVPService {
  static async submit(slug: string, request: SubmitRSVPReq): Promise<SubmitRSVPRes> {
    const invitation = await RSVPRepository.findPublishedInvitationBySlug(slug);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan atau belum dipublikasikan");
    }

    let guest;

    if (request.qrCode) {
      guest = await RSVPRepository.findGuestByQrCode(request.qrCode, invitation.id);

      if (!guest) {
        throw new NotFoundError("Data tamu dengan kode tersebut tidak ditemukan");
      }
    } else {
      // Tamu publik baru -- otomatis dibuatkan data guest baru berkategori "Publik"
      const qrCode = generateQrToken();
      guest = await RSVPRepository.createGuestForPublic(invitation.id, {
        name: request.name!,
        phone: request.phone,
        email: request.email,
        qrCode,
      });
    }

    // Tentukan jumlah kehadiran (reservation)
    let reservation = 1;
    if (request.status === "DECLINED") {
      reservation = 0;
    } else {
      reservation = request.reservation !== undefined && request.reservation > 0 ? request.reservation : 1;
    }

    const rsvp = await RSVPRepository.upsertRSVP({
      invitationId: invitation.id,
      guestId: guest.id,
      status: request.status,
      reservation,
      message: request.message,
    });

    return submitRSVPResponse(rsvp);
  }

  static async listWishes(slug: string, query: WishesQuery): Promise<ListWishesRes> {
    const invitation = await RSVPRepository.findPublishedInvitationBySlug(slug);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan atau belum dipublikasikan");
    }

    const limit = query.limit ?? 20;
    const page = query.page ?? 1;

    const wishes = await RSVPRepository.findWishesByInvitationId(invitation.id, limit, page);

    return listWishesResponse(wishes);
  }

  static async listByInvitation(invitationId: string, ownerId: string, filter?: RSVPFilterQuery): Promise<ListRSVPRes> {
    const invitation = await RSVPRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const rsvps = await RSVPRepository.findManyByInvitationId(invitationId, filter);

    return listRSVPResponse(rsvps);
  }

  static async getStats(invitationId: string, ownerId: string): Promise<GetRSVPStatsRes> {
    const invitation = await RSVPRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const stats = await RSVPRepository.getStats(invitationId);

    return getRSVPStatsResponse(stats);
  }

  static async delete(invitationId: string, rsvpId: string, ownerId: string): Promise<DeleteRSVPRes> {
    const invitation = await RSVPRepository.findInvitationByIdAndOwner(invitationId, ownerId);

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const existing = await RSVPRepository.findByIdAndInvitationId(rsvpId, invitationId);

    if (!existing) {
      throw new NotFoundError("Data RSVP tidak ditemukan");
    }

    await RSVPRepository.delete(rsvpId);

    return deleteRSVPResponse();
  }
}
