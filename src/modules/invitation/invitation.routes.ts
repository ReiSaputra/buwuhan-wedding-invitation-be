import { Router } from "express";

import { InvitationController } from "./invitation.controller";
import { addGalleryPhotoSchema, addLoveStorySchema, createInvitationSchema, updateGalleryPhotoSchema, updateInvitationSchema, updateInvitationStatusSchema, updateLoveStorySchema } from "./invitation.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const invitationRouter = Router();

// Publik -- dibuka tamu lewat link undangan
invitationRouter.get("/public/invitations/:slug", InvitationController.getPublicBySlug);

// Protected -- Pengelolaan undangan oleh pemilik
invitationRouter.post("/invitations", requireAuth, validate(createInvitationSchema), InvitationController.create);
invitationRouter.get("/invitations", requireAuth, InvitationController.listMine);
invitationRouter.get("/invitations/:id", requireAuth, InvitationController.getOwned);
invitationRouter.patch("/invitations/:id", requireAuth, validate(updateInvitationSchema), InvitationController.update);
invitationRouter.patch("/invitations/:id/status", requireAuth, validate(updateInvitationStatusSchema), InvitationController.updateStatus);
invitationRouter.delete("/invitations/:id", requireAuth, InvitationController.remove);

// Galeri Foto
invitationRouter.post("/invitations/:invitationId/gallery", requireAuth, validate(addGalleryPhotoSchema), InvitationController.addGalleryPhoto);
invitationRouter.patch("/invitations/:invitationId/gallery/:id", requireAuth, validate(updateGalleryPhotoSchema), InvitationController.updateGalleryPhoto);
invitationRouter.delete("/invitations/:invitationId/gallery/:id", requireAuth, InvitationController.removeGalleryPhoto);

// Kisah Cinta (Love Story)
invitationRouter.post("/invitations/:invitationId/stories", requireAuth, validate(addLoveStorySchema), InvitationController.addLoveStory);
invitationRouter.patch("/invitations/:invitationId/stories/:id", requireAuth, validate(updateLoveStorySchema), InvitationController.updateLoveStory);
invitationRouter.delete("/invitations/:invitationId/stories/:id", requireAuth, InvitationController.removeLoveStory);
