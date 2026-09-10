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

  static async getById(id: string, actorUserId: string): Promise<GetBuwuhanRes> {
    const buwuhan = await BuwuhanRepository.findById(id);
    if (!buwuhan) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    const effectiveRole = (buwuhan.invitation.ownerId === actorUserId ? "OWNER" : null) ?? (await MemberRepository.findMemberRole(buwuhan.invitationId, actorUserId));

    if (!effectiveRole) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
    }

    return getBuwuhanResponse(buwuhan);
  }

  /**
   * Memperbarui catatan buwuhan.
   * - OWNER / ADMIN : boleh edit semua entri.
   * - USER (petugas): hanya boleh edit entri yang dia buat sendiri.
   */
  static async update(id: string, actorUserId: string, actorMemberId: string | null, invitationRole: InvitationRole | undefined, req: UpdateBuwuhanReq): Promise<UpdateBuwuhanRes> {
    const existing = await BuwuhanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    const effectiveRole = invitationRole ?? (existing.invitation.ownerId === actorUserId ? "OWNER" : null) ?? (await MemberRepository.findMemberRole(existing.invitationId, actorUserId));

    if (!effectiveRole) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
    }

    // Petugas USER hanya boleh edit entri miliknya sendiri
    if (effectiveRole === "USER") {
      if (!actorMemberId || existing.recordedByMemberId !== actorMemberId) {
        throw new ForbiddenError("Anda hanya dapat mengedit catatan yang Anda buat sendiri");
      }
    }

    const updated = await BuwuhanRepository.update(id, req);
    return updateBuwuhanResponse(updated);
  }

  /**
   * Menghapus catatan buwuhan.
   * Hanya OWNER dan ADMIN yang diizinkan. Petugas USER dilarang keras.
   */
  static async remove(id: string, actorUserId: string, invitationRole: InvitationRole | undefined): Promise<DeleteBuwuhanRes> {
    const existing = await BuwuhanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    const effectiveRole = invitationRole ?? (existing.invitation.ownerId === actorUserId ? "OWNER" : null) ?? (await MemberRepository.findMemberRole(existing.invitationId, actorUserId));

    // Petugas USER tidak diizinkan menghapus data apapun
    if (effectiveRole === "USER") {
      throw new ForbiddenError("Petugas tidak diizinkan menghapus catatan buwuhan");
    }

    if (!effectiveRole || (effectiveRole !== "OWNER" && effectiveRole !== "ADMIN")) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
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
}
