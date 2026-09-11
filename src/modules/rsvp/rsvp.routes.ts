import { Router } from "express";

import { RSVPController } from "./rsvp.controller";
import { exportRSVPQuerySchema, submitRSVPSchema } from "./rsvp.schema";
import { validate, validateQuery } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";
import { exportRateLimiter } from "../../middlewares/rate-limit.middleware";

export const rsvpRouter = Router();

// Publik -- Konfirmasi kehadiran & ucapan dari web undangan
rsvpRouter.post("/public/invitations/:slug/rsvp", validate(submitRSVPSchema), RSVPController.submit);
rsvpRouter.get("/public/invitations/:slug/wishes", RSVPController.listWishes);

// Protected -- Rekap RSVP & statistik pada dashboard calon pengantin
rsvpRouter.get("/invitations/:invitationId/rsvps", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), RSVPController.listByInvitation);
rsvpRouter.get("/invitations/:invitationId/rsvps/stats", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), RSVPController.getStats);
rsvpRouter.get("/invitations/:invitationId/rsvps/export", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), exportRateLimiter, validateQuery(exportRSVPQuerySchema), RSVPController.export);
rsvpRouter.delete("/invitations/:invitationId/rsvps/:id", requireAuth, requireInvitationRole("OWNER", "ADMIN"), RSVPController.delete);
