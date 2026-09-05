import type { NextFunction, Request, Response } from "express";
import { SubscriptionService } from "./subscription.service";
import type { CheckoutReq, MidtransWebhookPayload, AdminOverrideStatusReq } from "./subscription.types";
import type { AdminListSubscriptionsQuery } from "./subscription.schema";
import { ForbiddenError } from "../../errors/app.error";
import { logger } from "../../utils/log";

export class SubscriptionController {
  // ── Plans ─────────────────────────────────────────────────────────────

  static async listPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SubscriptionService.listPlans();
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ── My Subscription ───────────────────────────────────────────────────

  static async getMySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await SubscriptionService.getMySubscription(userId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ── Checkout ──────────────────────────────────────────────────────────

  static async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      // fullName dan email diambil dari DB saat checkout (via repository user)
      // Untuk sementara, kita perlu fetch user dari req.user — tambah data ke JWT
      // atau fetch dari DB. Kita fetch dari DB di service.
      const result = await SubscriptionService.checkoutWithUser(userId, req.body as CheckoutReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ── My Invoices ───────────────────────────────────────────────────────

  static async listMyInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await SubscriptionService.listMyInvoices(userId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ── Webhook ───────────────────────────────────────────────────────────

  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as MidtransWebhookPayload;
      const result = await SubscriptionService.handleWebhook(payload);
      res.status(result.status).json(result);
    } catch (err) {
      // Webhook error — log tapi selalu return 200 ke Midtrans agar tidak retry terus
      logger.error("Webhook error", { err });
      if (err instanceof ForbiddenError || (err instanceof Error && err.message === "Signature tidak valid")) {
        res.status(400).json({ message: "Signature tidak valid" });
        return;
      }
      next(err);
    }
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  static async listSubscriptionsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as AdminListSubscriptionsQuery;
      const result = await SubscriptionService.listSubscriptionsForAdmin({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        status: query.status,
        userId: query.userId,
      });
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async overrideSubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await SubscriptionService.overrideSubscriptionStatus(id, req.body as AdminOverrideStatusReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }
}
