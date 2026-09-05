import { prisma } from "../../lib/prisma";
import type {
  CreateGiftAccountReq,
  CreateGiftReq,
  GiftSummaryData,
  UpdateGiftAccountReq,
  UpdateGiftReq,
} from "./gift.types";

export class GiftRepository {
  static async findInvitationById(id: string) {
    return await prisma.invitation.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
  }

  // ── GiftAccount ────────────────────────────────────────────────────────
  static async findGiftAccountsByInvitationId(invitationId: string) {
    return await prisma.giftAccount.findMany({
      where: { invitationId },
      orderBy: { order: "asc" },
    });
  }

  static async findGiftAccountById(id: string) {
    return await prisma.giftAccount.findUnique({
      where: { id },
      include: { invitation: { select: { id: true, ownerId: true } } },
    });
  }

  static async createGiftAccount(invitationId: string, data: CreateGiftAccountReq) {
    return await prisma.giftAccount.create({
      data: {
        invitationId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder,
        type: data.type ?? "BANK",
        order: data.order ?? 0,
      },
    });
  }

  static async updateGiftAccount(id: string, data: UpdateGiftAccountReq) {
    return await prisma.giftAccount.update({
      where: { id },
      data,
    });
  }

  static async deleteGiftAccount(id: string) {
    return await prisma.giftAccount.delete({
      where: { id },
    });
  }

  // ── Gift ───────────────────────────────────────────────────────────────
  static async findGiftsByInvitationId(invitationId: string) {
    return await prisma.gift.findMany({
      where: { invitationId },
      orderBy: { receivedAt: "desc" },
    });
  }

  static async findGiftById(id: string) {
    return await prisma.gift.findUnique({
      where: { id },
      include: { invitation: { select: { id: true, ownerId: true } } },
    });
  }

  static async createGift(invitationId: string, data: CreateGiftReq) {
    return await prisma.gift.create({
      data: {
        invitationId,
        giverName: data.giverName,
        amount: data.amount,
        method: data.method ?? "TRANSFER",
        note: data.note ?? null,
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : undefined,
      },
    });
  }

  static async updateGift(id: string, data: UpdateGiftReq) {
    return await prisma.gift.update({
      where: { id },
      data: {
        ...(data.giverName !== undefined && { giverName: data.giverName }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.method !== undefined && { method: data.method }),
        ...(data.note !== undefined && { note: data.note }),
        ...(data.receivedAt !== undefined && { receivedAt: new Date(data.receivedAt) }),
      },
    });
  }

  static async deleteGift(id: string) {
    return await prisma.gift.delete({
      where: { id },
    });
  }

  static async getSummary(invitationId: string): Promise<GiftSummaryData> {
    const gifts = await prisma.gift.findMany({
      where: { invitationId },
    });

    let totalAmount = 0;
    const byMethod = {
      CASH: { count: 0, totalAmount: 0 },
      TRANSFER: { count: 0, totalAmount: 0 },
      EWALLET: { count: 0, totalAmount: 0 },
    };

    for (const gift of gifts) {
      const amount = Number(gift.amount);
      totalAmount += amount;
      const method = gift.method as "CASH" | "TRANSFER" | "EWALLET";
      if (byMethod[method]) {
        byMethod[method].count += 1;
        byMethod[method].totalAmount += amount;
      }
    }

    return {
      totalGifts: gifts.length,
      totalAmount,
      byMethod,
    };
  }
}

