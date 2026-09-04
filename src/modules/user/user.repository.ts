import { prisma } from "../../lib/prisma";
import type { PlanTier, PlatformRole, Prisma } from "../../generated/prisma/client";

export interface UserFilterParams {
  page: number;
  limit: number;
  search?: string | undefined;
  role?: PlatformRole | undefined;
  planTier?: PlanTier | undefined;
}

export class UserRepository {
  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async findManyWithFilter(params: UserFilterParams) {
    const where: Prisma.UserWhereInput = {};

    if (params.role) {
      where.role = params.role;
    }

    if (params.planTier) {
      where.planTier = params.planTier;
    }

    if (params.search && params.search.trim()) {
      const searchTerm = params.search.trim();
      where.OR = [{ fullName: { contains: searchTerm, mode: "insensitive" } }, { email: { contains: searchTerm, mode: "insensitive" } }];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { invitations: true },
          },
        },
      }),
    ]);

    return { total, users };
  }

  static async findDetailWithInvitations(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        invitations: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { guests: true },
            },
          },
        },
      },
    });
  }

  static async updateTier(id: string, planTier: PlanTier) {
    return await prisma.user.update({
      where: { id },
      data: { planTier },
    });
  }

  static async updateRole(id: string, role: PlatformRole) {
    return await prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  static async revokeAllUserSessions(userId: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    return result.count;
  }

  static async deleteById(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
