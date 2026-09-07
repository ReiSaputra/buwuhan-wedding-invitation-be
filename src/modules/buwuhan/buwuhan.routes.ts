import { Router } from "express";

import { BuwuhanController } from "./buwuhan.controller";
import { createBuwuhanSchema, updateBuwuhanSchema } from "./buwuhan.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";

export const buwuhanRouter = Router();

// Nested routes (terikat ke undangan)
buwuhanRouter.post("/invitations/:invitationId/buwuhans", requireAuth, validate(createBuwuhanSchema), BuwuhanController.create);
buwuhanRouter.get("/invitations/:invitationId/buwuhans", requireAuth, BuwuhanController.list);
buwuhanRouter.post("/invitations/:invitationId/buwuhans", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(createBuwuhanSchema), BuwuhanController.create);
buwuhanRouter.get("/invitations/:invitationId/buwuhans", requireAuth, requireInvitationRole("OWNER", "ADMIN"), BuwuhanController.list);
// PENTING: /summary harus sebelum /:id agar tidak salah tangkap
buwuhanRouter.get("/invitations/:invitationId/buwuhans/summary", requireAuth, BuwuhanController.getSummary);
buwuhanRouter.get("/invitations/:invitationId/buwuhans/summary", requireAuth, requireInvitationRole("OWNER", "ADMIN"), BuwuhanController.getSummary);

// Flat routes (operasi per transaksi)
// PENTING: rute tanpa parameter didaftarkan sebelum /buwuhans/:id
buwuhanRouter.get("/buwuhans", requireAuth, BuwuhanController.listByOwner);
buwuhanRouter.get("/buwuhans/:id", requireAuth, BuwuhanController.getById);
buwuhanRouter.patch("/buwuhans/:id", requireAuth, validate(updateBuwuhanSchema), BuwuhanController.update);
buwuhanRouter.delete("/buwuhans/:id", requireAuth, BuwuhanController.remove);
