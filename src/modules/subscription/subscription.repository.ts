import { prisma } from "../../lib/prisma";
import type { Prisma, SubscriptionStatus } from "../../generated/prisma/client";

export interface AdminSubscriptionFilter {
  page: number;
  limit: number;
  status?: SubscriptionStatus | undefined;
  userId?: string | undefined;
}

export class SubscriptionRepository {
  // ── Plan ─────────────────────────────────────────────────────────────

  static async findAllActivePlans() {
    return await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
  }

  static async findPlanByCode(code: string) {
    return await prisma.plan.findUnique({ where: { code } });
  }

  // ── Subscription ──────────────────────────────────────────────────────

  static async findActiveSubscriptionByUserId(userId: string) {
    return await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findPendingSubscriptionByUserId(userId: string) {
    return await prisma.subscription.findFirst({
      where: { userId, status: "PENDING" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createSubscription(data: { userId: string; planCode: string; providerRef: string; provider: "MIDTRANS" }) {
    return await prisma.subscription.create({
      data: {
        userId: data.userId,
        planCode: data.planCode,
        status: "PENDING",
        provider: data.provider,
        providerRef: data.providerRef,
      },
      include: { plan: true },
    });
  }

  static async findSubscriptionById(id: string) {
    return await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  // ── Invoice ───────────────────────────────────────────────────────────

  static async createInvoice(data: { subscriptionId: string; userId: string; amount: number; idempotencyKey: string }) {
    return await prisma.invoice.create({
      data: {
        subscriptionId: data.subscriptionId,
        userId: data.userId,
        amount: data.amount,
        status: "PENDING",
        idempotencyKey: data.idempotencyKey,
      },
    });
  }

  static async findInvoiceByIdempotencyKey(key: string) {
    return await prisma.invoice.findUnique({
      where: { idempotencyKey: key },
      include: { subscription: { include: { plan: true } } },
    });
  }

  static async findInvoicesByUserId(userId: string) {
    return await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Memproses pembayaran sukses dalam satu transaksi database:
   * 1. Update Invoice → PAID + paidAt + rawPayload
   * 2. Update Subscription → ACTIVE + startedAt + expiresAt
   * 3. Update User.planTier → tier dari plan baru
   */
  static async activateSubscription(params: { invoiceId: string; subscriptionId: string; userId: string; planTier: "FREE" | "PRO" | "MAX"; rawPayload: Prisma.InputJsonValue; periodMonths: number }) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + params.periodMonths);

    return await prisma.$transaction([
      prisma.invoice.update({
        where: { id: params.invoiceId },
        data: { status: "PAID", paidAt: now, rawPayload: params.rawPayload },
      }),
      prisma.subscription.update({
        where: { id: params.subscriptionId },
        data: { status: "ACTIVE", startedAt: now, expiresAt },
      }),
      prisma.user.update({
        where: { id: params.userId },
        data: { planTier: params.planTier },
      }),
    ]);
  }

  /**
   * Tandai invoice sebagai FAILED (pembayaran gagal / ditolak).
   */
  static async failInvoice(invoiceId: string, rawPayload: Prisma.InputJsonValue) {
    return await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "FAILED", rawPayload },
    });
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  static async findSubscriptionsForAdmin(params: AdminSubscriptionFilter) {
    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
    };

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        include: { plan: true, user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
    ]);

    return { total, subscriptions };
  }

  static async updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
    return await prisma.subscription.update({
      where: { id },
      data: { status },
      include: { plan: true },
    });
  }

  // ── Lazy expiry check ─────────────────────────────────────────────────

  /**
   * Turunkan tier user ke FREE dan tandai subscription sebagai EXPIRED.
   * Dipanggil oleh subscription middleware saat expiresAt sudah lewat.
   */
  static async expireSubscription(subscriptionId: string, userId: string) {
    return await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: "EXPIRED" },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { planTier: "FREE" },
      }),
    ]);
  }
}
