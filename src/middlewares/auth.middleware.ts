// Taruh file ini di: src/middlewares/auth.middleware.ts
// PERUBAHAN dari versi sebelumnya: AuthUser sekarang punya `role`, di-decode
// dari payload JWT (lihat signAccessToken() di auth.service.ts).

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../errors/app.error";
import type { PlanTier, PlatformRole } from "../generated/prisma/client";

export interface AuthUser {
  id: string;
  role: PlatformRole;
  planTier: PlanTier;
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
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: PlatformRole; planTier: PlanTier };

    req.user = { id: payload.id, role: payload.role, planTier: payload.planTier };

    next();
  } catch {
    next(new UnauthorizedError("Token akses tidak valid atau sudah kedaluwarsa"));
  }
}
