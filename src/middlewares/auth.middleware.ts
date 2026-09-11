import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ForbiddenError, UnauthorizedError } from "../errors/app.error";
import type { InvitationRole, PlanTier, PlatformRole } from "../generated/prisma/client";


export interface AuthUser {
  id: string;
  role: PlatformRole;
  planTier: PlanTier;
  // Diisi hanya untuk sesi petugas instan (magic link)
  memberId?: string | undefined;
  invitationId?: string | undefined;
  invitationRole?: InvitationRole | undefined;
  accessType?: "INSTANT" | undefined;
  accessScope?: "BUWUHAN_ONLY" | undefined;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Token akses tidak ditemukan"));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: PlatformRole;
      planTier: PlanTier;
      memberId?: string | undefined;
      invitationId?: string | undefined;
      invitationRole?: InvitationRole | undefined;
      accessType?: "INSTANT" | undefined;
      accessScope?: "BUWUHAN_ONLY" | undefined;
    };

    req.user = {
      id: payload.id,
      role: payload.role,
      planTier: payload.planTier,
      memberId: payload.memberId,
      invitationId: payload.invitationId,
      invitationRole: payload.invitationRole,
      accessType: payload.accessType,
      accessScope: payload.accessScope,
    };

    next();
  } catch {
    next(new UnauthorizedError("Token akses tidak valid atau sudah kedaluwarsa"));
  }
}

export function denyInstantAccess(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.accessType === "INSTANT") {
    next(new ForbiddenError("Petugas link hanya dapat mengakses fitur Catatan Buwuh"));
    return;
  }
  next();
}

