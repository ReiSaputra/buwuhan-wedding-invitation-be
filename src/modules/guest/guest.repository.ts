import { prisma } from "../../lib/prisma";
import type { CreateGuestReq, GuestFilterQuery, GuestStatsData, UpdateGuestReq } from "./guest.types";

export class GuestRepository {
  static async findInvitationWithCouples(invitationId: string) {
    return await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        couples: true,
      },
    });
  }

  static async findInvitationByIdAndOwner(invitationId: string, ownerId: string) {
    return await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        ownerId,
      },
      include: {
        couples: true,
      },
    });
  }

  static async create(invitationId: string, request: CreateGuestReq, qrCode: string) {
    return await prisma.guest.create({
      data: {
        invitationId,
        name: request.name,
        category: request.category ?? null,
        phone: request.phone ?? null,
        email: request.email ?? null,
        notes: request.notes ?? null,
        paxCount: request.paxCount ?? 1,
        qrCode,
      },
    });
  }

  static async createMany(invitationId: string, guestsData: (CreateGuestReq & { qrCode: string })[]) {
    // Gunakan transaction untuk insert dan fetch hasil
    return await prisma.$transaction(
      guestsData.map((g) =>
        prisma.guest.create({
          data: {
            invitationId,
            name: g.name,
            category: g.category ?? null,
            phone: g.phone ?? null,
            email: g.email ?? null,
            notes: g.notes ?? null,
            paxCount: g.paxCount ?? 1,
            qrCode: g.qrCode,
          },
        })
      )
    );
  }

  static async findById(id: string) {
    return await prisma.guest.findUnique({
      where: { id },
      include: {
        invitation: {
          include: {
            couples: true,
          },
        },
      },
    });
  }

  static async findByIdAndInvitationId(id: string, invitationId: string) {
    return await prisma.guest.findFirst({
      where: {
        id,
        invitationId,
      },
      include: {
        invitation: {
          include: {
            couples: true,
          },
        },
      },
    });
  }

  static async findByQrCodeAndInvitationId(qrCode: string, invitationId: string) {
    return await prisma.guest.findFirst({
      where: {
        qrCode,
        invitationId,
      },
      include: {
        invitation: {
          include: {
            couples: true,
          },
        },
      },
    });
  }

  static async findByQrCode(qrCode: string) {
    return await prisma.guest.findUnique({
      where: { qrCode },
      include: {
        invitation: {
          include: {
            couples: true,
          },
        },
      },
    });
  }

  static async findManyByInvitationId(invitationId: string, filter?: GuestFilterQuery) {
    return await prisma.guest.findMany({
      where: {
        invitationId,
        ...(filter?.category ? { category: { equals: filter.category, mode: "insensitive" } } : {}),
        ...(filter?.isAttended !== undefined ? { isAttended: filter.isAttended } : {}),
        ...(filter?.search
          ? {
              OR: [
                { name: { contains: filter.search, mode: "insensitive" } },
                { phone: { contains: filter.search, mode: "insensitive" } },
                { email: { contains: filter.search, mode: "insensitive" } },
                { notes: { contains: filter.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async update(id: string, request: UpdateGuestReq) {
    return await prisma.guest.update({
      where: { id },
      data: {
        ...(request.name !== undefined ? { name: request.name } : {}),
        ...(request.category !== undefined ? { category: request.category } : {}),
        ...(request.phone !== undefined ? { phone: request.phone } : {}),
        ...(request.email !== undefined ? { email: request.email } : {}),
        ...(request.notes !== undefined ? { notes: request.notes } : {}),
        ...(request.paxCount !== undefined ? { paxCount: request.paxCount } : {}),
      },
    });
  }

  static async delete(id: string) {
    return await prisma.guest.delete({
      where: { id },
    });
  }

  static async checkIn(id: string, paxActual?: number) {
    return await prisma.guest.update({
      where: { id },
      data: {
        isAttended: true,
        checkedInAt: new Date(),
        ...(paxActual !== undefined ? { paxActual } : {}),
      },
    });
  }

  static async checkOut(id: string) {
    return await prisma.guest.update({
      where: { id },
      data: {
        checkedOutAt: new Date(),
      },
    });
  }

  static async getStats(invitationId: string): Promise<GuestStatsData> {
    const guests = await prisma.guest.findMany({
      where: { invitationId },
      select: {
        category: true,
        isAttended: true,
        paxCount: true,
        paxActual: true,
      },
    });

    const totalGuests = guests.length;
    let totalAttended = 0;
    let totalPaxExpected = 0;
    let totalPaxActual = 0;
    const byCategory: Record<string, { total: number; attended: number }> = {};

    for (const g of guests) {
      const categoryKey = g.category?.trim() || "Lainnya";

      if (!byCategory[categoryKey]) {
        byCategory[categoryKey] = { total: 0, attended: 0 };
      }

      byCategory[categoryKey].total += 1;
      totalPaxExpected += g.paxCount || 1;

      if (g.isAttended) {
        totalAttended += 1;
        byCategory[categoryKey].attended += 1;
        totalPaxActual += g.paxActual ?? g.paxCount ?? 1;
      }
    }

    return {
      totalGuests,
      totalAttended,
      totalPending: totalGuests - totalAttended,
      totalPaxExpected,
      totalPaxActual,
      byCategory,
    };
  }
}
