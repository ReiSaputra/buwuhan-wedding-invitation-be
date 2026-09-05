import { Router } from "express";
import { GiftController } from "./gift.controller";
import {
  createGiftAccountSchema,
  createGiftSchema,
  updateGiftAccountSchema,
  updateGiftSchema,
} from "./gift.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const giftRouter = Router();

// ── Gift Accounts (Rekening & E-wallet Pengantin) ─────────────────────────
giftRouter.get(
  "/invitations/:invitationId/gift-accounts",
  requireAuth,
  GiftController.listAccounts
);

giftRouter.post(
  "/invitations/:invitationId/gift-accounts",
  requireAuth,
  validate(createGiftAccountSchema),
  GiftController.createAccount
);

giftRouter.patch(
  "/gift-accounts/:id",
  requireAuth,
  validate(updateGiftAccountSchema),
  GiftController.updateAccount
);

giftRouter.delete(
  "/gift-accounts/:id",
  requireAuth,
  GiftController.removeAccount
);

// ── Gifts (Catatan Hadiah & Amplop Digital Masuk) ─────────────────────────
// PENTING: /summary didaftarkan sebelum rute dengan parameter dinamis
giftRouter.get(
  "/invitations/:invitationId/gifts/summary",
  requireAuth,
  GiftController.getGiftsSummary
);

giftRouter.get(
  "/invitations/:invitationId/gifts",
  requireAuth,
  GiftController.listGifts
);

giftRouter.post(
  "/invitations/:invitationId/gifts",
  requireAuth,
  validate(createGiftSchema),
  GiftController.createGift
);

giftRouter.patch(
  "/gifts/:id",
  requireAuth,
  validate(updateGiftSchema),
  GiftController.updateGift
);

giftRouter.delete(
  "/gifts/:id",
  requireAuth,
  GiftController.removeGift
);

