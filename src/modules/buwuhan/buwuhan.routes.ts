import { Router } from "express";

import { BuwuhanController } from "./buwuhan.controller";
import { createBuwuhanSchema, exportBuwuhanQuerySchema, updateBuwuhanSchema } from "./buwuhan.schema";
import { validate, validateQuery } from "../../middlewares/validate.middleware";
import { denyInstantAccess, requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";
import { exportRateLimiter } from "../../middlewares/rate-limit.middleware";

export const buwuhanRouter = Router();

// ── Rute Nested (terikat ke undangan) ────────────────────────────────────────
// USER (petugas) diizinkan create & list (termasuk petugas instant link)
buwuhanRouter.post(
  "/invitations/:invitationId/buwuhans",
  requireAuth,
  requireInvitationRole("OWNER", "ADMIN", "USER", { allowInstant: true }),
  validate(createBuwuhanSchema),
  BuwuhanController.create,
);
buwuhanRouter.get(
  "/invitations/:invitationId/buwuhans",
  requireAuth,
  requireInvitationRole("OWNER", "ADMIN", "USER", { allowInstant: true }),
  BuwuhanController.list,
);
// PENTING: /summary dan /export harus sebelum /:id agar tidak salah tangkap
buwuhanRouter.get(
  "/invitations/:invitationId/buwuhans/summary",
  requireAuth,
  requireInvitationRole("OWNER", "ADMIN", "USER", { allowInstant: true }),
  BuwuhanController.getSummary,
);
buwuhanRouter.get(
  "/invitations/:invitationId/buwuhans/export",
  requireAuth,
  requireInvitationRole("OWNER", "ADMIN", "USER", { allowInstant: true }),
  exportRateLimiter,
  validateQuery(exportBuwuhanQuerySchema),
  BuwuhanController.export,
);

// ── Rute Flat (operasi per transaksi) ────────────────────────────────────────
// PENTING: rute tanpa parameter didaftarkan sebelum /buwuhans/:id
buwuhanRouter.get("/buwuhans", requireAuth, denyInstantAccess, BuwuhanController.listByOwner);

// ── Rute Standalone (catatan buwuh mandiri tanpa undangan) ─────────────────────
buwuhanRouter.post("/buwuhans/standalone", requireAuth, denyInstantAccess, validate(createBuwuhanSchema), BuwuhanController.createStandalone);
buwuhanRouter.get("/buwuhans/standalone", requireAuth, denyInstantAccess, BuwuhanController.listStandalone);

buwuhanRouter.get("/buwuhans/:id", requireAuth, BuwuhanController.getById);

// PATCH: otorisasi per-entri & izin edit per petugas dicek di service
buwuhanRouter.patch("/buwuhans/:id", requireAuth, validate(updateBuwuhanSchema), BuwuhanController.update);

// DELETE: otorisasi dicek di service (OWNER/ADMIN untuk undangan, user pemilik untuk standalone, dilarang untuk petugas)
buwuhanRouter.delete("/buwuhans/:id", requireAuth, BuwuhanController.remove);


