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
}
