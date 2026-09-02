import { Router } from "express";

import { GuestController } from "./guest.controller";
import {
  bulkCreateGuestSchema,
  bulkSendGuestEmailSchema,
  checkInGuestSchema,
  checkOutGuestSchema,
  createGuestSchema,
  updateGuestSchema,
} from "./guest.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const guestRouter = Router();

// Publik -- verifikasi QR code tamu saat scan di gerbang / resepsionis
guestRouter.get("/public/invitations/:slug/guests/verify/:qrCode", GuestController.getPublicByQrCode);

// Protected -- Pengelolaan data tamu undangan (wajib pemilik undangan)
guestRouter.post("/invitations/:invitationId/guests", requireAuth, validate(createGuestSchema), GuestController.create);
guestRouter.post("/invitations/:invitationId/guests/bulk", requireAuth, validate(bulkCreateGuestSchema), GuestController.bulkCreate);
guestRouter.get("/invitations/:invitationId/guests", requireAuth, GuestController.list);
guestRouter.get("/invitations/:invitationId/guests/stats", requireAuth, GuestController.getStats);
guestRouter.get("/invitations/:invitationId/guests/:id", requireAuth, GuestController.getById);
guestRouter.patch("/invitations/:invitationId/guests/:id", requireAuth, validate(updateGuestSchema), GuestController.update);
guestRouter.delete("/invitations/:invitationId/guests/:id", requireAuth, GuestController.remove);

// Presensi (Check-In & Check-Out via QR / ID)
guestRouter.post("/invitations/:invitationId/guests/check-in", requireAuth, validate(checkInGuestSchema), GuestController.checkIn);
guestRouter.post("/invitations/:invitationId/guests/check-out", requireAuth, validate(checkOutGuestSchema), GuestController.checkOut);

// Email Provider & Share Link Undangan
guestRouter.post("/invitations/:invitationId/guests/send-email-bulk", requireAuth, validate(bulkSendGuestEmailSchema), GuestController.sendEmailBulk);
guestRouter.post("/invitations/:invitationId/guests/:id/send-email", requireAuth, GuestController.sendEmail);
guestRouter.get("/invitations/:invitationId/guests/:id/share", requireAuth, GuestController.getShareInfo);
