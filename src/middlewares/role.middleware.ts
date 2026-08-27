// Taruh file ini di: src/middlewares/role.middleware.ts
//
// Dipakai SETELAH requireAuth (butuh req.user sudah ke-set). Contoh pakai:
//
//   templateRouter.post(
//     "/templates",
//     requireAuth,
//     requireRole("ADMIN"),
//     validate(createTemplateSchema),
//     TemplateController.create,
//   );

import type { NextFunction, Request, Response } from "express";

import { ForbiddenError } from "../errors/app.error";
import type { PlatformRole } from "../generated/prisma/client";

export function requireRole(...roles: PlatformRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // kalau req.user belum ke-set, berarti requireRole dipasang tanpa
    // requireAuth di depannya -- itu bug pemasangan middleware, bukan
    // masalah request user, tapi tetap ditolak sebagai 403 supaya tidak
    // ke-expose ke client
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ForbiddenError("Kamu tidak punya akses untuk melakukan aksi ini"));
      return;
    }

    next();
  };
}
