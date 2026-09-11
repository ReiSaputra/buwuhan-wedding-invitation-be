import { Router } from "express";

import { GuestController } from "./guest.controller";
import { bulkCreateGuestSchema, bulkSendGuestEmailSchema, checkInGuestSchema, checkOutGuestSchema, createGuestSchema, exportGuestQuerySchema, updateGuestSchema } from "./guest.schema";
import { validate, validateQuery } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";
import { exportRateLimiter } from "../../middlewares/rate-limit.middleware";

export const guestRouter = Router();

// Publik -- verifikasi QR code tamu saat scan di gerbang / resepsionis
guestRouter.get("/public/invitations/:slug/guests/verify/:qrCode", GuestController.getPublicByQrCode);

// Protected -- Pengelolaan data tamu undangan
guestRouter.post("/invitations/:invitationId/guests", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(createGuestSchema), GuestController.create);
guestRouter.post("/invitations/:invitationId/guests/bulk", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(bulkCreateGuestSchema), GuestController.bulkCreate);
guestRouter.get("/invitations/:invitationId/guests", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), GuestController.list);
guestRouter.get("/invitations/:invitationId/guests/stats", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), GuestController.getStats);
guestRouter.get("/invitations/:invitationId/guests/export", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), exportRateLimiter, validateQuery(exportGuestQuerySchema), GuestController.export);
guestRouter.get("/invitations/:invitationId/guests/:id", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), GuestController.getById);

guestRouter.patch("/invitations/:invitationId/guests/:id", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(updateGuestSchema), GuestController.update);
guestRouter.delete("/invitations/:invitationId/guests/:id", requireAuth, requireInvitationRole("OWNER", "ADMIN"), GuestController.remove);

// Presensi (Check-In & Check-Out via QR / ID)
guestRouter.post("/invitations/:invitationId/guests/check-in", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), validate(checkInGuestSchema), GuestController.checkIn);
guestRouter.post("/invitations/:invitationId/guests/check-out", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), validate(checkOutGuestSchema), GuestController.checkOut);

// Email Provider & Share Link Undangan
guestRouter.post("/invitations/:invitationId/guests/send-email-bulk", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(bulkSendGuestEmailSchema), GuestController.sendEmailBulk);
guestRouter.post("/invitations/:invitationId/guests/:id/send-email", requireAuth, requireInvitationRole("OWNER", "ADMIN"), GuestController.sendEmail);
guestRouter.get("/invitations/:invitationId/guests/:id/share", requireAuth, requireInvitationRole("OWNER", "ADMIN", "USER"), GuestController.getShareInfo);
