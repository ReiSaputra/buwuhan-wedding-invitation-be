import type { NextFunction, Request, Response } from "express";
import type { InvitationRole } from "../generated/prisma/client";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/app.error";
import { MemberRepository } from "../modules/member/member.repository";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      invitationRole?: InvitationRole;
    }
  }
}

export async function checkInvitationAccess(
  invitationId: string,
  userId: string,
  allowedRoles: InvitationRole[],
): Promise<InvitationRole> {
  const invitation = await MemberRepository.findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("Undangan tidak ditemukan");
  }

  const role = await MemberRepository.findMemberRole(invitationId, userId);
  if (!role || !allowedRoles.includes(role)) {
    throw new ForbiddenError("Kamu tidak punya akses untuk melakukan aksi ini");
  }

  return role;
}

export function requireInvitationRole(...allowedRoles: InvitationRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Token akses tidak ditemukan");
      }

      const invitationId = (req.params.invitationId || req.params.id) as string;
      if (!invitationId) {
        throw new NotFoundError("Undangan tidak ditemukan");
      }

      const role = await checkInvitationAccess(invitationId, req.user.id, allowedRoles);
      req.invitationRole = role;

      next();
    } catch (error) {
      next(error);
    }
  };
}

