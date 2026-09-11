import { BuwuhanRepository } from "./buwuhan.repository";
import { MemberRepository } from "../member/member.repository";
import {
  createBuwuhanResponse,
  deleteBuwuhanResponse,
  getBuwuhanResponse,
  getBuwuhanSummaryResponse,
  listBuwuhanResponse,
  listOwnerBuwuhanResponse,
  updateBuwuhanResponse,
  type CreateBuwuhanReq,
  type CreateBuwuhanRes,
  type DeleteBuwuhanRes,
  type GetBuwuhanRes,
  type GetBuwuhanSummaryRes,
  type ListBuwuhanRes,
  type ListOwnerBuwuhanRes,
  type UpdateBuwuhanReq,
  type UpdateBuwuhanRes,
} from "./buwuhan.types";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";
import type { InvitationRole } from "../../generated/prisma/client";
import { generateExportFileName, setExportHeaders, streamCsvExport, streamXlsxExport, type ColumnDefinition } from "../../utils/export.util";

export class BuwuhanService {
  /**
   * Membuat catatan buwuhan baru.
   * @param actorMemberId - ID InvitationMember pencatat (null jika owner platform langsung)
   * @param actorName     - Nama pencatat untuk audit log
   */
  static async create(invitationId: string, actorUserId: string, actorMemberId: string | null, actorName: string | null, req: CreateBuwuhanReq): Promise<CreateBuwuhanRes> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, actorUserId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const buwuhan = await BuwuhanRepository.create(invitationId, req, actorMemberId, actorName);
    return createBuwuhanResponse(buwuhan);
  }

  static async list(invitationId: string, actorUserId: string): Promise<ListBuwuhanRes> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, actorUserId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const buwuhans = await BuwuhanRepository.findManyByInvitationId(invitationId);
    return listBuwuhanResponse(buwuhans);
  }

  /**
   * Membuat catatan buwuhan mandiri baru (tidak terikat undangan).
   */
  static async createStandalone(actorUserId: string, actorName: string | null, req: CreateBuwuhanReq): Promise<CreateBuwuhanRes> {
    const buwuhan = await BuwuhanRepository.createStandalone(actorUserId, req, actorName);
    return createBuwuhanResponse(buwuhan);
  }

  /**
   * Mengambil daftar catatan buwuhan mandiri milik user login.
   */
  static async listStandalone(actorUserId: string): Promise<ListBuwuhanRes> {
    const buwuhans = await BuwuhanRepository.findManyStandaloneByUserId(actorUserId);
    return listBuwuhanResponse(buwuhans);
  }

  static async getById(
    id: string,
    actorUserId: string,
    accessType?: "INSTANT",
    instantInvitationId?: string,
  ): Promise<GetBuwuhanRes> {
    const buwuhan = await BuwuhanRepository.findById(id);
    if (!buwuhan) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    if (accessType === "INSTANT") {
      if (!instantInvitationId || buwuhan.invitationId !== instantInvitationId) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
      return getBuwuhanResponse(buwuhan);
    }

    if (buwuhan.invitationId) {
      const effectiveRole = (buwuhan.invitation?.ownerId === actorUserId ? "OWNER" : null) ?? (await MemberRepository.findMemberRole(buwuhan.invitationId, actorUserId));

      if (!effectiveRole) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
    } else {
      if (buwuhan.userId !== actorUserId) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
    }

    return getBuwuhanResponse(buwuhan);
  }

  /**
   * Memperbarui catatan buwuhan.
   * - Standalone: hanya user pemilik yang boleh mengedit.
   * - Undangan: OWNER / ADMIN boleh edit semua entri, USER (petugas) hanya entri yang dibuat sendiri.
   */
  static async update(
    id: string,
    actorUserId: string,
    actorMemberId: string | null,
    invitationRole: InvitationRole | undefined,
    accessType: "INSTANT" | undefined,
    instantInvitationId: string | undefined,
    req: UpdateBuwuhanReq,
  ): Promise<UpdateBuwuhanRes> {
    const existing = await BuwuhanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    if (accessType === "INSTANT") {
      if (!instantInvitationId || existing.invitationId !== instantInvitationId) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
      // Petugas instan hanya boleh mengedit catatan yang dibuat sendiri
      if (!actorMemberId || existing.recordedByMemberId !== actorMemberId) {
        throw new ForbiddenError("Petugas hanya dapat mengubah catatan yang dibuat sendiri");
      }
    } else if (existing.invitationId) {
      const effectiveRole = invitationRole ?? (existing.invitation?.ownerId === actorUserId ? "OWNER" : null) ?? (await MemberRepository.findMemberRole(existing.invitationId, actorUserId));

      if (!effectiveRole) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }

      // Petugas USER hanya boleh edit entri miliknya sendiri
      if (effectiveRole === "USER") {
        if (!actorMemberId || existing.recordedByMemberId !== actorMemberId) {
          throw new ForbiddenError("Anda hanya dapat mengedit catatan yang Anda buat sendiri");
        }
      }

    } else {
      if (existing.userId !== actorUserId) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
    }

    const updated = await BuwuhanRepository.update(id, req);
    return updateBuwuhanResponse(updated);
  }

  /**
   * Menghapus catatan buwuhan.
   * - Standalone: hanya user pemilik yang boleh menghapus.
   * - Undangan: Hanya OWNER dan ADMIN yang diizinkan. Petugas USER dilarang keras.
   */
  static async remove(
    id: string,
    actorUserId: string,
    invitationRole: InvitationRole | undefined,
    accessType?: "INSTANT",
  ): Promise<DeleteBuwuhanRes> {
    const existing = await BuwuhanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    if (accessType === "INSTANT") {
      throw new ForbiddenError("Petugas tidak diizinkan menghapus catatan buwuh");
    }

    if (existing.invitationId) {
      const effectiveRole = invitationRole ?? (existing.invitation?.ownerId === actorUserId ? "OWNER" : null) ?? (await MemberRepository.findMemberRole(existing.invitationId, actorUserId));

      // Petugas USER tidak diizinkan menghapus data apapun
      if (effectiveRole === "USER") {
        throw new ForbiddenError("Petugas tidak diizinkan menghapus catatan buwuh");
      }

      if (!effectiveRole || (effectiveRole !== "OWNER" && effectiveRole !== "ADMIN")) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
    } else {
      if (existing.userId !== actorUserId) {
        throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
      }
    }

    await BuwuhanRepository.delete(id);
    return deleteBuwuhanResponse();
  }



  static async getSummary(invitationId: string, actorUserId: string): Promise<GetBuwuhanSummaryRes> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, actorUserId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const summary = await BuwuhanRepository.getSummary(invitationId);
    return getBuwuhanSummaryResponse(summary);
  }

  static async listByOwner(ownerId: string): Promise<ListOwnerBuwuhanRes> {
    const buwuhans = await BuwuhanRepository.findManyByOwnerId(ownerId);
    return listOwnerBuwuhanResponse(buwuhans);
  }

  // ── Streaming Export (CSV & XLSX) ──────────────────────────────────

  static async export(invitationId: string, actorUserId: string, filter: { category?: string | undefined; search?: string | undefined }, format: "csv" | "xlsx", res: import("express").Response): Promise<void> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, actorUserId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const buwuhans = await BuwuhanRepository.findManyByInvitationId(invitationId, filter);

    const filename = generateExportFileName(invitation.slug, "buwuhans", format);
    setExportHeaders(res, filename, format);

    interface BuwuhanExportRow {
      giverName: string;
      giverAddress: string | null;
      itemName: string;
      category: string | null;
      quantity: string;
      unit: string;
      estimatedValue: string;
      note: string | null;
      receivedAt: Date;
      recordedByName: string | null;
    }

    const flatRows: BuwuhanExportRow[] = [];
    for (const b of buwuhans) {
      if (b.items && b.items.length > 0) {
        for (const item of b.items) {
          flatRows.push({
            giverName: b.giverName,
            giverAddress: b.giverAddress,
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity != null ? item.quantity.toString() : "-",
            unit: item.unit,
            estimatedValue: item.estimatedValue != null ? item.estimatedValue.toString() : "-",
            note: b.note,
            receivedAt: b.receivedAt,
            recordedByName: b.recordedByName,
          });
        }
      } else {
        flatRows.push({
          giverName: b.giverName,
          giverAddress: b.giverAddress,
          itemName: "-",
          category: "-",
          quantity: "-",
          unit: "-",
          estimatedValue: "-",
          note: b.note,
          receivedAt: b.receivedAt,
          recordedByName: b.recordedByName,
        });
      }
    }

    const columns: ColumnDefinition<BuwuhanExportRow>[] = [
      { header: "Nama Pemberi", key: "giverName", width: 25 },
      { header: "Alamat Pemberi", key: "giverAddress", width: 30, format: (r) => r.giverAddress ?? "-" },
      { header: "Nama Bantuan / Item", key: "itemName", width: 25 },
      { header: "Kategori", key: "category", width: 15, format: (r) => r.category ?? "-" },
      { header: "Jumlah", key: "quantity", width: 15 },
      { header: "Satuan", key: "unit", width: 15 },
      { header: "Estimasi Nilai (Rp)", key: "estimatedValue", width: 20 },
      { header: "Catatan", key: "note", width: 30, format: (r) => r.note ?? "-" },
      {
        header: "Tanggal Terima",
        key: "receivedAt",
        width: 22,
        format: (r) => (r.receivedAt ? new Date(r.receivedAt).toLocaleString("id-ID") : "-"),
      },
      { header: "Pencatat", key: "recordedByName", width: 20, format: (r) => r.recordedByName ?? "-" },
    ];

    if (format === "csv") {
      await streamCsvExport(res, columns, flatRows);
    } else {
      await streamXlsxExport(res, "Catatan Buwuh", columns, flatRows);
    }
  }
}
