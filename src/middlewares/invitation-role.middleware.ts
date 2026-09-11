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

export interface InvitationRoleOptions {
  allowInstant?: boolean;
}

export async function checkInvitationAccess(
  invitationId: string,
  userId: string,
  allowedRoles: InvitationRole[],
  instantRole?: InvitationRole,
  instantInvitationId?: string,
  accessType?: "INSTANT",
  accessScope?: "BUWUHAN_ONLY",
  allowInstant: boolean = false,
): Promise<InvitationRole> {
  // Jalur untuk sesi petugas instan (magic link)
  if (accessType === "INSTANT" || (instantRole && instantInvitationId)) {
    if (!allowInstant) {
      throw new ForbiddenError("Petugas link hanya dapat mengakses fitur Catatan Buwuh");
    }
    if (instantInvitationId !== invitationId) {
      throw new ForbiddenError("Link petugas tidak berlaku untuk undangan ini");
    }
    if (accessScope && accessScope !== "BUWUHAN_ONLY") {
      throw new ForbiddenError("Scope akses petugas tidak valid");
    }
    if (!instantRole || !allowedRoles.includes(instantRole)) {
      throw new ForbiddenError("Kamu tidak punya akses untuk melakukan aksi ini");
    }
    return instantRole;
  }

  // Jalur normal: cek invitation dan role user di database
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

export function requireInvitationRole(...args: (InvitationRole | InvitationRoleOptions)[]) {
  const allowedRoles: InvitationRole[] = [];
  let allowInstant = false;

  for (const arg of args) {
    if (typeof arg === "string") {
      allowedRoles.push(arg);
    } else if (typeof arg === "object" && arg !== null) {
      if (arg.allowInstant) {
        allowInstant = true;
      }
    }
  }

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Token akses tidak ditemukan");
      }

      const invitationId = (req.params.invitationId || req.params.id) as string;
      if (!invitationId) {
        throw new NotFoundError("Undangan tidak ditemukan");
      }

      const role = await checkInvitationAccess(
        invitationId,
        req.user.id,
        allowedRoles,
        req.user.invitationRole,
        req.user.invitationId,
        req.user.accessType,
        req.user.accessScope,
        allowInstant,
      );
      req.invitationRole = role;

      next();
    } catch (error) {
      next(error);
    }
  };
}


