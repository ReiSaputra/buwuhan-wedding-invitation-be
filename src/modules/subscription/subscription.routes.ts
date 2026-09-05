import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  adminOverrideStatusSchema,
  checkoutSchema,
  webhookPayloadSchema,
} from "./subscription.schema";

export const subscriptionRouter = Router();

// ── Plans (publik) ────────────────────────────────────────────────────────────
subscriptionRouter.get("/plans", SubscriptionController.listPlans);

// ── My Subscription ────────────────────────────────────────────────────────────
subscriptionRouter.get(
  "/subscriptions/me",
  requireAuth,
  SubscriptionController.getMySubscription
);

subscriptionRouter.post(
  "/subscriptions/checkout",
  requireAuth,
  validate(checkoutSchema),
  SubscriptionController.checkout
);

// ── My Invoices ────────────────────────────────────────────────────────────────
subscriptionRouter.get(
  "/invoices/me",
  requireAuth,
  SubscriptionController.listMyInvoices
);

// ── Webhook (tanpa auth, verifikasi via signature) ─────────────────────────────
subscriptionRouter.post(
  "/webhooks/payment",
  validate(webhookPayloadSchema),
  SubscriptionController.handleWebhook
);

// ── Admin ──────────────────────────────────────────────────────────────────────
subscriptionRouter.get(
  "/admin/subscriptions",
  requireAuth,
  requireRole("ADMIN"),
  SubscriptionController.listSubscriptionsForAdmin
);

subscriptionRouter.patch(
  "/admin/subscriptions/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  validate(adminOverrideStatusSchema),
  SubscriptionController.overrideSubscriptionStatus
);
