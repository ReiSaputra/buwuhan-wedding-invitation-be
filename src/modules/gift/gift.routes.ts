import { Router } from "express";
import { GiftController } from "./gift.controller";
import { createGiftAccountSchema, createGiftSchema, updateGiftAccountSchema, updateGiftSchema } from "./gift.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";

export const giftRouter = Router();

// ── Publik -- Rekening/E-Wallet untuk Tamu ────────────────────────────────
giftRouter.get("/public/invitations/:slug/gift-accounts", GiftController.listPublicAccounts);

// ── Gift Accounts (Rekening & E-wallet Pengantin) ─────────────────────────
giftRouter.get("/invitations/:invitationId/gift-accounts", requireAuth, requireInvitationRole("OWNER", "ADMIN"), GiftController.listAccounts);

giftRouter.post("/invitations/:invitationId/gift-accounts", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(createGiftAccountSchema), GiftController.createAccount);

giftRouter.patch("/gift-accounts/:id", requireAuth, validate(updateGiftAccountSchema), GiftController.updateAccount);

giftRouter.delete("/gift-accounts/:id", requireAuth, GiftController.removeAccount);

// ── Gifts (Catatan Hadiah & Amplop Digital Masuk) ─────────────────────────
// PENTING: /summary didaftarkan sebelum rute dengan parameter dinamis
giftRouter.get("/invitations/:invitationId/gifts/summary", requireAuth, requireInvitationRole("OWNER", "ADMIN"), GiftController.getGiftsSummary);

giftRouter.get("/invitations/:invitationId/gifts", requireAuth, requireInvitationRole("OWNER", "ADMIN"), GiftController.listGifts);

giftRouter.post("/invitations/:invitationId/gifts", requireAuth, requireInvitationRole("OWNER", "ADMIN"), validate(createGiftSchema), GiftController.createGift);

giftRouter.patch("/gifts/:id", requireAuth, validate(updateGiftSchema), GiftController.updateGift);

giftRouter.delete("/gifts/:id", requireAuth, GiftController.removeGift);
