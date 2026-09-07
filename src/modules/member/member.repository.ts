import { prisma } from "../../lib/prisma";
import type { InvitationRole, Prisma } from "../../generated/prisma/client";

export class MemberRepository {
  static async findInvitationById(invitationId: string) {
    return await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  static async findMemberRole(invitationId: string, userId: string): Promise<InvitationRole | null> {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { ownerId: true },
    });

    if (!invitation) return null;

    if (invitation.ownerId === userId) {
      return "OWNER";
    }

    const member = await prisma.invitationMember.findFirst({
      where: {
        invitationId,
        userId,
        acceptedAt: { not: null },
        revokedAt: null,
      },
      select: { role: true },
    });

    return member?.role ?? null;
  }

  static async findByInvitationAndEmail(invitationId: string, email: string) {
    return await prisma.invitationMember.findFirst({
      where: {
        invitationId,
        email,
      },
    });
  }

  static async findById(id: string) {
    return await prisma.invitationMember.findUnique({
      where: { id },
      include: {
        invitation: {
          select: {
            id: true,
            slug: true,
            title: true,
            ownerId: true,
          },
        },
      },
    });
  }

  static async findByTokenHash(tokenHash: string) {
    return await prisma.invitationMember.findFirst({
      where: {
        inviteTokenHash: tokenHash,
      },
      include: {
        invitation: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });
  }

  static async findManyByInvitationId(invitationId: string) {
    return await prisma.invitationMember.findMany({
      where: { invitationId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(data: {
    invitationId: string;
    email: string;
    name: string;
    role: InvitationRole;
    inviteTokenHash?: string | null;
    inviteTokenExpiresAt?: Date | null;
    userId?: string | null;
    acceptedAt?: Date | null;
  }) {
    return await prisma.invitationMember.create({
      data: {
        invitationId: data.invitationId,
        email: data.email,
        name: data.name,
        role: data.role,
        inviteTokenHash: data.inviteTokenHash ?? null,
        inviteTokenExpiresAt: data.inviteTokenExpiresAt ?? null,
        userId: data.userId ?? null,
        acceptedAt: data.acceptedAt ?? null,
      },
    });
  }

  static async update(id: string, data: Prisma.InvitationMemberUpdateInput) {
    return await prisma.invitationMember.update({
      where: { id },
      data,
    });
  }

  static async updateToken(id: string, tokenHash: string, expiresAt: Date) {
    return await prisma.invitationMember.update({
      where: { id },
      data: {
        inviteTokenHash: tokenHash,
        inviteTokenExpiresAt: expiresAt,
        revokedAt: null,
      },
    });
  }

  static async acceptInvite(id: string, userId: string) {
    return await prisma.invitationMember.update({
      where: { id },
      data: {
        userId,
        acceptedAt: new Date(),
        inviteTokenHash: null,
        inviteTokenExpiresAt: null,
        revokedAt: null,
      },
      include: {
        invitation: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });
  }

  static async delete(id: string) {
    return await prisma.invitationMember.delete({
      where: { id },
    });
  }

  static async countByInvitationId(invitationId: string): Promise<number> {
    return await prisma.invitationMember.count({
      where: { invitationId },
    });
  }
}

