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
import { generateExportFileName, setExportHeaders, streamCsvExport, streamXlsxExport, type ColumnDefinition } from "../../utils/export.util";

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

  // ── Streaming Export (CSV & XLSX) ──────────────────────────────────

  static async export(invitationId: string, ownerId: string, filter: RSVPFilterQuery | undefined, format: "csv" | "xlsx", res: import("express").Response): Promise<void> {
    const invitation = await RSVPRepository.findInvitationByIdAndOwner(invitationId, ownerId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const rsvps = await RSVPRepository.findManyByInvitationId(invitationId, filter);

    const filename = generateExportFileName(invitation.slug, "rsvps", format);
    setExportHeaders(res, filename, format);

    const columns: ColumnDefinition<(typeof rsvps)[0]>[] = [
      { header: "Nama Tamu", key: "guestName", width: 25, format: (r) => r.guest?.name ?? "-" },
      { header: "No. WhatsApp / Telepon", key: "phone", width: 20, format: (r) => r.guest?.phone ?? "-" },
      { header: "Email", key: "email", width: 25, format: (r) => r.guest?.email ?? "-" },
      {
        header: "Status Kehadiran",
        key: "status",
        width: 18,
        format: (r) => (r.status === "CONFIRMED" ? "Hadir" : "Tidak Hadir"),
      },
      { header: "Jumlah Reservasi (Pax)", key: "reservation", width: 22, format: (r) => r.reservation },
      { header: "Ucapan & Doa", key: "message", width: 35, format: (r) => r.message ?? "-" },
      {
        header: "Waktu Konfirmasi",
        key: "createdAt",
        width: 22,
        format: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : "-"),
      },
    ];

    if (format === "csv") {
      await streamCsvExport(res, columns, rsvps);
    } else {
      await streamXlsxExport(res, "Daftar RSVP", columns, rsvps);
    }
  }
}
