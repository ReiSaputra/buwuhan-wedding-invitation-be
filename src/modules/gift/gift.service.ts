import { GiftRepository } from "./gift.repository";
import {
  createGiftAccountResponse,
  createGiftResponse,
  deleteGiftAccountResponse,
  deleteGiftResponse,
  getGiftSummaryResponse,
  listGiftAccountResponse,
  listGiftResponse,
  updateGiftAccountResponse,
  updateGiftResponse,
  type CreateGiftAccountReq,
  type CreateGiftAccountRes,
  type CreateGiftReq,
  type CreateGiftRes,
  type DeleteGiftAccountRes,
  type DeleteGiftRes,
  type GetGiftSummaryRes,
  type ListGiftAccountRes,
  type ListGiftRes,
  type UpdateGiftAccountReq,
  type UpdateGiftAccountRes,
  type UpdateGiftReq,
  type UpdateGiftRes,
} from "./gift.types";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";

export class GiftService {
  private static async ensureInvitationOwnership(invitationId: string, ownerId: string) {
    const invitation = await GiftRepository.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }
    if (invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke undangan ini");
    }
    return invitation;
  }

  // ── GiftAccount ────────────────────────────────────────────────────────
  static async listAccounts(invitationId: string, ownerId: string): Promise<ListGiftAccountRes> {
    await this.ensureInvitationOwnership(invitationId, ownerId);
    const accounts = await GiftRepository.findGiftAccountsByInvitationId(invitationId);
    return listGiftAccountResponse(accounts);
  }

  static async createAccount(
    invitationId: string,
    ownerId: string,
    req: CreateGiftAccountReq
  ): Promise<CreateGiftAccountRes> {
    await this.ensureInvitationOwnership(invitationId, ownerId);
    const account = await GiftRepository.createGiftAccount(invitationId, req);
    return createGiftAccountResponse(account);
  }

  static async updateAccount(
    id: string,
    ownerId: string,
    req: UpdateGiftAccountReq
  ): Promise<UpdateGiftAccountRes> {
    const existing = await GiftRepository.findGiftAccountById(id);
    if (!existing) {
      throw new NotFoundError("Rekening hadiah tidak ditemukan");
    }
    if (existing.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke rekening hadiah ini");
    }

    const updated = await GiftRepository.updateGiftAccount(id, req);
    return updateGiftAccountResponse(updated);
  }

  static async removeAccount(id: string, ownerId: string): Promise<DeleteGiftAccountRes> {
    const existing = await GiftRepository.findGiftAccountById(id);
    if (!existing) {
      throw new NotFoundError("Rekening hadiah tidak ditemukan");
    }
    if (existing.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke rekening hadiah ini");
    }

    await GiftRepository.deleteGiftAccount(id);
    return deleteGiftAccountResponse();
  }

  // ── Gift ───────────────────────────────────────────────────────────────
  static async listGifts(invitationId: string, ownerId: string): Promise<ListGiftRes> {
    await this.ensureInvitationOwnership(invitationId, ownerId);
    const gifts = await GiftRepository.findGiftsByInvitationId(invitationId);
    return listGiftResponse(gifts);
  }

  static async getGiftsSummary(invitationId: string, ownerId: string): Promise<GetGiftSummaryRes> {
    await this.ensureInvitationOwnership(invitationId, ownerId);
    const summary = await GiftRepository.getSummary(invitationId);
    return getGiftSummaryResponse(summary);
  }

  static async createGift(
    invitationId: string,
    ownerId: string,
    req: CreateGiftReq
  ): Promise<CreateGiftRes> {
    await this.ensureInvitationOwnership(invitationId, ownerId);
    const gift = await GiftRepository.createGift(invitationId, req);
    return createGiftResponse(gift);
  }

  static async updateGift(
    id: string,
    ownerId: string,
    req: UpdateGiftReq
  ): Promise<UpdateGiftRes> {
    const existing = await GiftRepository.findGiftById(id);
    if (!existing) {
      throw new NotFoundError("Catatan hadiah tidak ditemukan");
    }
    if (existing.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan hadiah ini");
    }

    const updated = await GiftRepository.updateGift(id, req);
    return updateGiftResponse(updated);
  }

  static async removeGift(id: string, ownerId: string): Promise<DeleteGiftRes> {
    const existing = await GiftRepository.findGiftById(id);
    if (!existing) {
      throw new NotFoundError("Catatan hadiah tidak ditemukan");
    }
    if (existing.invitation.ownerId !== ownerId) {
      throw new ForbiddenError("Anda tidak memiliki akses ke catatan hadiah ini");
    }

    await GiftRepository.deleteGift(id);
    return deleteGiftResponse();
  }
}

