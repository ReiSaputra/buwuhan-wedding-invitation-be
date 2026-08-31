import { BuwuhanRepository } from "./buwuhan.repository";
import {
  createBuwuhanResponse,
  deleteBuwuhanResponse,
  getBuwuhanResponse,
  getBuwuhanSummaryResponse,
  listBuwuhanResponse,
  updateBuwuhanResponse,
  type CreateBuwuhanReq,
  type CreateBuwuhanRes,
  type DeleteBuwuhanRes,
  type GetBuwuhanRes,
  type GetBuwuhanSummaryRes,
  type ListBuwuhanRes,
  type UpdateBuwuhanReq,
  type UpdateBuwuhanRes,
} from "./buwuhan.types";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";

export class BuwuhanService {
  static async create(invitationId: string, ownerId: string, req: CreateBuwuhanReq): Promise<CreateBuwuhanRes> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, ownerId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const buwuhan = await BuwuhanRepository.create(invitationId, req);
    return createBuwuhanResponse(buwuhan);
  }

  static async list(invitationId: string, ownerId: string): Promise<ListBuwuhanRes> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, ownerId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const buwuhans = await BuwuhanRepository.findManyByInvitationId(invitationId);
    return listBuwuhanResponse(buwuhans);
  }

  static async getById(id: string, ownerId: string): Promise<GetBuwuhanRes> {
    const buwuhan = await BuwuhanRepository.findById(id);
    if (!buwuhan) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    if (buwuhan.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
    }

    return getBuwuhanResponse(buwuhan);
  }

  static async update(id: string, ownerId: string, req: UpdateBuwuhanReq): Promise<UpdateBuwuhanRes> {
    const existing = await BuwuhanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    if (existing.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
    }

    const updated = await BuwuhanRepository.update(id, req);
    return updateBuwuhanResponse(updated);
  }

  static async remove(id: string, ownerId: string): Promise<DeleteBuwuhanRes> {
    const existing = await BuwuhanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Catatan buwuh tidak ditemukan");
    }

    if (existing.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan buwuh ini");
    }

    await BuwuhanRepository.delete(id);
    return deleteBuwuhanResponse();
  }

  static async getSummary(invitationId: string, ownerId: string): Promise<GetBuwuhanSummaryRes> {
    const invitation = await BuwuhanRepository.findInvitationByIdAndOwner(invitationId, ownerId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const summary = await BuwuhanRepository.getSummary(invitationId);
    return getBuwuhanSummaryResponse(summary);
  }
}
