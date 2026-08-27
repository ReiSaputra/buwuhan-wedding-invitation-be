import { Router } from "express";

import { RSVPController } from "./rsvp.controller";
import { submitRSVPSchema } from "./rsvp.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const rsvpRouter = Router();

// Publik -- Konfirmasi kehadiran & ucapan dari web undangan
rsvpRouter.post("/public/invitations/:slug/rsvp", validate(submitRSVPSchema), RSVPController.submit);
rsvpRouter.get("/public/invitations/:slug/wishes", RSVPController.listWishes);

// Protected -- Rekap RSVP & statistik pada dashboard calon pengantin
rsvpRouter.get("/invitations/:invitationId/rsvps", requireAuth, RSVPController.listByInvitation);
rsvpRouter.get("/invitations/:invitationId/rsvps/stats", requireAuth, RSVPController.getStats);
rsvpRouter.delete("/invitations/:invitationId/rsvps/:id", requireAuth, RSVPController.delete);
