import { prisma } from "../../lib/prisma";

export class DashboardRepository {
  static async findUserWithDetails(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        planTier: true,
      },
    });
  }

  static async findInvitationsWithStats(userId: string) {
    return await prisma.invitation.findMany({
      where: { ownerId: userId },
      include: {
        template: {
          select: {
            previewImageUrl: true,
          },
        },
        guests: {
          select: {
            id: true,
            isAttended: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Admin Platform Global Analytics ──────────────────────────────────

  static async getPlatformStats() {
    const [
      usersByTier,
      usersByRole,
      invitationsByStatus,
      invitationsByCategory,
      totalGuests,
      totalCheckedIn,
      rsvpsByStatus,
      topTemplates,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ["planTier"],
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      prisma.invitation.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.invitation.groupBy({
        by: ["eventCategory"],
        _count: { _all: true },
      }),
      prisma.guest.count(),
      prisma.guest.count({ where: { isAttended: true } }),
      prisma.rSVP.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.template.findMany({
        take: 5,
        orderBy: {
          invitations: { _count: "desc" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          previewImageUrl: true,
          _count: {
            select: { invitations: true },
          },
        },
      }),
    ]);

    return {
      usersByTier,
      usersByRole,
      invitationsByStatus,
      invitationsByCategory,
      totalGuests,
      totalCheckedIn,
      rsvpsByStatus,
      topTemplates,
    };
  }
}
