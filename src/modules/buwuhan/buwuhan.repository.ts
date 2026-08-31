import { prisma } from "../../lib/prisma";
import type { CreateBuwuhanReq, UpdateBuwuhanReq } from "./buwuhan.types";

export class BuwuhanRepository {
  static async findInvitationByIdAndOwner(invitationId: string, ownerId: string) {
    return await prisma.invitation.findFirst({
      where: { id: invitationId, ownerId },
    });
  }

  static async create(invitationId: string, req: CreateBuwuhanReq) {
    return await prisma.buwuhan.create({
      data: {
        invitationId,
        giverName: req.giverName,
        note: req.note ?? null,
        receivedAt: req.receivedAt ? new Date(req.receivedAt) : new Date(),
        items: {
          create: req.items.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category ?? null,
            estimatedValue: item.estimatedValue ?? null,
          })),
        },
      },
      include: { items: true },
    });
  }

  static async findManyByInvitationId(invitationId: string) {
    return await prisma.buwuhan.findMany({
      where: { invitationId },
      include: { items: true },
      orderBy: { receivedAt: "desc" },
    });
  }

  static async findById(id: string) {
    return await prisma.buwuhan.findUnique({
      where: { id },
      include: {
        items: true,
        invitation: { select: { ownerId: true } },
      },
    });
  }

  static async update(id: string, req: UpdateBuwuhanReq) {
    return await prisma.$transaction(async (tx) => {
      // Hapus semua items lama jika ada items baru yang dikirim (replace-all)
      if (req.items !== undefined) {
        await tx.buwuhanItem.deleteMany({ where: { buwuhanId: id } });
      }

      return await tx.buwuhan.update({
        where: { id },
        data: {
          ...(req.giverName !== undefined ? { giverName: req.giverName } : {}),
          ...(req.note !== undefined ? { note: req.note } : {}),
          ...(req.receivedAt !== undefined ? { receivedAt: new Date(req.receivedAt) } : {}),
          ...(req.items !== undefined
            ? {
                items: {
                  create: req.items.map((item) => ({
                    itemName: item.itemName,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category ?? null,
                    estimatedValue: item.estimatedValue ?? null,
                  })),
                },
              }
            : {}),
        },
        include: { items: true },
      });
    });
  }

  static async delete(id: string) {
    return await prisma.buwuhan.delete({ where: { id } });
  }

  static async getSummary(invitationId: string) {
    const buwuhans = await prisma.buwuhan.findMany({
      where: { invitationId },
      include: { items: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalItems = 0;
    let totalEstimatedValue = 0;
    let totalItemsThisMonth = 0;

    // Map: itemName+unit -> totalQuantity
    const itemAggr: Record<string, { itemName: string; unit: string; totalQuantity: number }> = {};

    for (const buwuhan of buwuhans) {
      for (const item of buwuhan.items) {
        totalItems += 1;
        totalEstimatedValue += item.estimatedValue ? Number(item.estimatedValue) : 0;

        if (buwuhan.receivedAt >= startOfMonth) {
          totalItemsThisMonth += 1;
        }

        // Agregasi per itemName+unit untuk topItem
        const key = `${item.itemName.toLowerCase()}|${item.unit}`;
        if (!itemAggr[key]) {
          itemAggr[key] = { itemName: item.itemName, unit: item.unit, totalQuantity: 0 };
        }
        itemAggr[key].totalQuantity += Number(item.quantity);
      }
    }

    // Temukan top item berdasarkan totalQuantity tertinggi
    const topItem = Object.values(itemAggr).reduce<{ itemName: string; unit: string; totalQuantity: number } | null>(
      (max, curr) => (max === null || curr.totalQuantity > max.totalQuantity ? curr : max),
      null
    );

    return {
      totalItems,
      totalTransactions: buwuhans.length,
      totalEstimatedValue,
      totalItemsThisMonth,
      topItem,
    };
  }
}
