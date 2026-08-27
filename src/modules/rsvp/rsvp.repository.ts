import { prisma } from "../../lib/prisma";
import type { RSVPFilterQuery, RSVPStatsData } from "./rsvp.types";
import type { RSVPStatus } from "../../generated/prisma/client";

export class RSVPRepository {
  static async findPublishedInvitationBySlug(slug: string) {
    return await prisma.invitation.findFirst({
      where: {
        slug,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
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

  static async findGuestByQrCode(qrCode: string, invitationId: string) {
    return await prisma.guest.findFirst({
      where: {
        qrCode,
        invitationId,
      },
    });
  }

  static async createGuestForPublic(invitationId: string, data: { name: string; phone?: string | null | undefined; email?: string | null | undefined; qrCode: string }) {
    return await prisma.guest.create({
      data: {
        invitationId,
        name: data.name,
        category: "Publik",
        phone: data.phone ?? null,
        email: data.email ?? null,
        qrCode: data.qrCode,
        paxCount: 1,
      },
    });
  }

  static async upsertRSVP(params: { invitationId: string; guestId: string; status: RSVPStatus; reservation: number; message?: string | null | undefined }) {
    return await prisma.rSVP.upsert({
      where: {
        invitationId_guestId: {
          invitationId: params.invitationId,
          guestId: params.guestId,
        },
      },
      create: {
        invitationId: params.invitationId,
        guestId: params.guestId,
        status: params.status,
        reservation: params.reservation,
        message: params.message ?? null,
      },
      update: {
        status: params.status,
        reservation: params.reservation,
        ...(params.message !== undefined ? { message: params.message } : {}),
      },
      include: {
        guest: true,
      },
    });
  }

  static async findManyByInvitationId(invitationId: string, filter?: RSVPFilterQuery) {
    return await prisma.rSVP.findMany({
      where: {
        invitationId,
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.search
          ? {
              OR: [{ message: { contains: filter.search, mode: "insensitive" } }, { guest: { name: { contains: filter.search, mode: "insensitive" } } }, { guest: { phone: { contains: filter.search, mode: "insensitive" } } }],
            }
          : {}),
      },
      include: {
        guest: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findWishesByInvitationId(invitationId: string, limit: number, page: number) {
    const skip = (page - 1) * limit;

    return await prisma.rSVP.findMany({
      where: {
        invitationId,
        message: {
          not: null,
        },
      },
      include: {
        guest: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });
  }

  static async findByIdAndInvitationId(id: string, invitationId: string) {
    return await prisma.rSVP.findFirst({
      where: {
        id,
        invitationId,
      },
      include: {
        guest: true,
      },
    });
  }

  static async delete(id: string) {
    return await prisma.rSVP.delete({
      where: { id },
    });
  }

  static async getStats(invitationId: string): Promise<RSVPStatsData> {
    const totalGuests = await prisma.guest.count({
      where: { invitationId },
    });

    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId },
      select: {
        status: true,
        reservation: true,
      },
    });

    let totalConfirmed = 0;
    let totalDeclined = 0;
    let totalPaxConfirmed = 0;

    for (const r of rsvps) {
      if (r.status === "CONFIRMED") {
        totalConfirmed += 1;
        totalPaxConfirmed += r.reservation;
      } else if (r.status === "DECLINED") {
        totalDeclined += 1;
      }
    }

    const totalResponded = rsvps.length;
    const totalPending = Math.max(0, totalGuests - totalResponded);

    return {
      totalGuests,
      totalResponded,
      totalPending,
      totalConfirmed,
      totalDeclined,
      totalPaxConfirmed,
    };
  }
}
