import { SubscriptionRepository } from "./subscription.repository";
import { UserRepository } from "../user/user.repository";
import { createSnapToken, verifyMidtransSignature } from "../../lib/midtrans";
import { logger } from "../../utils/log";
import {
  checkoutResponse,
  getMySubscriptionResponse,
  listMyInvoicesResponse,
  listPlansResponse,
  webhookResponse,
  toSubscriptionData,
  type CheckoutReq,
  type CheckoutRes,
  type GetMySubscriptionRes,
  type ListMyInvoicesRes,
  type ListPlansRes,
  type MidtransWebhookPayload,
  type WebhookRes,
  type AdminListSubscriptionsRes,
  type AdminOverrideStatusReq,
} from "./subscription.types";
import { ConflictError, NotFoundError } from "../../errors/app.error";
import type { AdminSubscriptionFilter } from "./subscription.repository";
import type { Prisma, SubscriptionStatus } from "../../generated/prisma/client";

export class SubscriptionService {
  // ── Plans ─────────────────────────────────────────────────────────────

  static async listPlans(): Promise<ListPlansRes> {
    const plans = await SubscriptionRepository.findAllActivePlans();
    return listPlansResponse(plans);
  }

  // ── My Subscription ───────────────────────────────────────────────────

  static async getMySubscription(userId: string): Promise<GetMySubscriptionRes> {
    const sub = await SubscriptionRepository.findActiveSubscriptionByUserId(userId);
    return getMySubscriptionResponse(sub);
  }

  // ── Checkout ──────────────────────────────────────────────────────────

  /**
   * Buat checkout untuk user yang sudah login.
   * Fetch data user dari DB untuk mendapatkan fullName + email.
   */
  static async checkoutWithUser(userId: string, request: CheckoutReq): Promise<CheckoutRes> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError("User tidak ditemukan");

    return SubscriptionService.checkout(userId, user.fullName, user.email, request);
  }

  static async checkout(userId: string, userFullName: string, userEmail: string, request: CheckoutReq): Promise<CheckoutRes> {
    const plan = await SubscriptionRepository.findPlanByCode(request.planCode);
    if (!plan) throw new NotFoundError("Paket tidak ditemukan");

    // Cegah checkout jika sudah ada subscription aktif
    const existing = await SubscriptionRepository.findActiveSubscriptionByUserId(userId);
    if (existing) throw new ConflictError("Kamu sudah memiliki langganan aktif");

    // Buat order ID unik untuk Midtrans
    const orderId = `SUB-${userId.slice(0, 8)}-${Date.now()}`;
    const grossAmount = Number(plan.price);

    // Buat Subscription (PENDING) di DB
    const subscription = await SubscriptionRepository.createSubscription({
      userId,
      planCode: plan.code,
      providerRef: orderId,
      provider: "MIDTRANS",
    });

    // Buat Invoice (PENDING) di DB
    const invoice = await SubscriptionRepository.createInvoice({
      subscriptionId: subscription.id,
      userId,
      amount: grossAmount,
      idempotencyKey: orderId,
    });

    // Minta Snap token dari Midtrans
    const snap = await createSnapToken({
      orderId,
      grossAmount,
      customerDetails: { firstName: userFullName, email: userEmail },
      itemDetails: [{ id: plan.code, price: grossAmount, quantity: 1, name: plan.name }],
    });

    return checkoutResponse({
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      snapToken: snap.token,
      redirectUrl: snap.redirectUrl,
    });
  }

  // ── My Invoices ───────────────────────────────────────────────────────

  static async listMyInvoices(userId: string): Promise<ListMyInvoicesRes> {
    const invoices = await SubscriptionRepository.findInvoicesByUserId(userId);
    return listMyInvoicesResponse(invoices);
  }

  // ── Webhook ───────────────────────────────────────────────────────────

  static async handleWebhook(payload: MidtransWebhookPayload): Promise<WebhookRes> {
    // 1. Verifikasi signature Midtrans
    const isValid = await verifyMidtransSignature({
      orderId: payload.order_id,
      statusCode: payload.status_code,
      grossAmount: payload.gross_amount,
      signatureKey: payload.signature_key,
    });

    if (!isValid) {
      logger.warn("Midtrans webhook signature invalid", { orderId: payload.order_id });
      throw new Error("Signature tidak valid");
    }

    // 2. Idempotency: cari invoice yang sudah ada
    const invoice = await SubscriptionRepository.findInvoiceByIdempotencyKey(payload.order_id);
    if (!invoice) {
      logger.warn("Invoice tidak ditemukan untuk order_id", { orderId: payload.order_id });
      return webhookResponse();
    }

    // 3. Sudah PAID → skip (idempotent)
    if (invoice.status === "PAID") {
      logger.info("Webhook duplikat diterima, diabaikan", { orderId: payload.order_id });
      return webhookResponse();
    }

    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    // 4. Tentukan apakah pembayaran sukses
    const isSuccess = (transactionStatus === "capture" && fraudStatus === "accept") || transactionStatus === "settlement";

    const isFailed = transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire" || transactionStatus === "failure";

    if (isSuccess) {
      const sub = invoice.subscription;
      const plan = sub.plan;

      // Hitung durasi berdasarkan billing period
      const periodMonths = plan.period === "YEARLY" ? 12 : 1;

      await SubscriptionRepository.activateSubscription({
        invoiceId: invoice.id,
        subscriptionId: sub.id,
        userId: sub.userId,
        planTier: plan.tier,
        rawPayload: payload as unknown as Prisma.InputJsonValue,
        periodMonths,
      });

      logger.info("Subscription diaktifkan", {
        userId: sub.userId,
        planCode: plan.code,
        orderId: payload.order_id,
      });
    } else if (isFailed) {
      await SubscriptionRepository.failInvoice(invoice.id, payload as unknown as Prisma.InputJsonValue);
      logger.info("Invoice ditandai gagal", { orderId: payload.order_id, status: transactionStatus });
    }

    return webhookResponse();
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  static async listSubscriptionsForAdmin(params: AdminSubscriptionFilter): Promise<AdminListSubscriptionsRes> {
    const { total, subscriptions } = await SubscriptionRepository.findSubscriptionsForAdmin(params);

    const totalPages = Math.ceil(total / params.limit) || 1;

    return {
      message: "Daftar subscription berhasil diambil",
      status: 200,
      data: subscriptions.map((sub) => ({
        ...toSubscriptionData(sub),
        userId: sub.userId,
        user: sub.user,
      })),
      pagination: { total, page: params.page, limit: params.limit, totalPages },
    };
  }

  static async overrideSubscriptionStatus(id: string, request: AdminOverrideStatusReq): Promise<{ message: string; status: number }> {
    const existing = await SubscriptionRepository.findSubscriptionById(id);
    if (!existing) throw new NotFoundError("Subscription tidak ditemukan");

    await SubscriptionRepository.updateSubscriptionStatus(id, request.status as SubscriptionStatus);

    return { message: `Status subscription berhasil diubah ke ${request.status}`, status: 200 };
  }
}
