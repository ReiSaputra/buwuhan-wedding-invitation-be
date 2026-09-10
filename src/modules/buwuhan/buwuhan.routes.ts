import { Router } from "express";

import { BuwuhanController } from "./buwuhan.controller";
import { createBuwuhanSchema, updateBuwuhanSchema } from "./buwuhan.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";

export const buwuhanRouter = Router();

// ── Rute Nested (terikat ke undangan) ────────────────────────────────────────
// USER (petugas) diizinkan create & list
buwuhanRouter.post("/invitations/:invitationId/buwuhans", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), validate(createBuwuhanSchema), BuwuhanController.create);
buwuhanRouter.get("/invitations/:invitationId/buwuhans", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), BuwuhanController.list);
// PENTING: /summary harus sebelum /:id agar tidak salah tangkap
buwuhanRouter.get("/invitations/:invitationId/buwuhans/summary", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), BuwuhanController.getSummary);

// ── Rute Flat (operasi per transaksi) ────────────────────────────────────────
// PENTING: rute tanpa parameter didaftarkan sebelum /buwuhans/:id
buwuhanRouter.get("/buwuhans", requireAuth, BuwuhanController.listByOwner);

// ── Rute Standalone (catatan buwuh mandiri tanpa undangan) ─────────────────────
buwuhanRouter.post("/buwuhans/standalone", requireAuth, validate(createBuwuhanSchema), BuwuhanController.createStandalone);
buwuhanRouter.get("/buwuhans/standalone", requireAuth, BuwuhanController.listStandalone);

buwuhanRouter.get("/buwuhans/:id", requireAuth, BuwuhanController.getById);

// PATCH: semua role boleh akses, tapi otorisasi per-entri dicek di service
buwuhanRouter.patch("/buwuhans/:id", requireAuth, validate(updateBuwuhanSchema), BuwuhanController.update);

// DELETE: otorisasi dicek di service (OWNER/ADMIN untuk undangan, user pemilik untuk standalone)
buwuhanRouter.delete("/buwuhans/:id", requireAuth, BuwuhanController.remove);
