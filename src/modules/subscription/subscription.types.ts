import type { BillingPeriod, InvoiceStatus, PaymentProvider, PlanTier, SubscriptionStatus } from "../../generated/prisma/client";

// ── Plan ─────────────────────────────────────────────────────────────────────

export interface PlanData {
  code: string;
  name: string;
  price: number;
  currency: string;
  period: BillingPeriod;
  features: string[];
  isActive: boolean;
  tier: PlanTier;
}

export interface ListPlansRes {
  message: string;
  status: number;
  data: PlanData[];
}

// ── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionData {
  id: string;
  planCode: string;
  plan: PlanData;
  status: SubscriptionStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  provider: PaymentProvider | null;
  providerRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetMySubscriptionRes {
  message: string;
  status: number;
  data: SubscriptionData | null;
}

export interface CheckoutReq {
  planCode: string;
}

export interface CheckoutRes {
  message: string;
  status: number;
  data: {
    subscriptionId: string;
    invoiceId: string;
    snapToken: string;
    redirectUrl: string;
  };
}

// ── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceData {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt: Date | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListMyInvoicesRes {
  message: string;
  status: number;
  data: InvoiceData[];
}

// ── Webhook ──────────────────────────────────────────────────────────────────

export interface MidtransWebhookPayload {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  payment_type?: string;
  transaction_time?: string;
  [key: string]: unknown;
}

export interface WebhookRes {
  message: string;
  status: number;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface AdminSubscriptionData extends SubscriptionData {
  userId: string;
  user: { id: string; fullName: string; email: string };
}

export interface AdminListSubscriptionsRes {
  message: string;
  status: number;
  data: AdminSubscriptionData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminOverrideStatusReq {
  status: SubscriptionStatus;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toNumeric(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

type RawPlan = {
  code: string;
  name: string;
  price: unknown;
  currency: string;
  period: BillingPeriod;
  features: unknown;
  isActive: boolean;
  tier: PlanTier;
};

export function toPlanData(plan: RawPlan): PlanData {
  return {
    code: plan.code,
    name: plan.name,
    price: toNumeric(plan.price),
    currency: plan.currency,
    period: plan.period,
    features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
    isActive: plan.isActive,
    tier: plan.tier,
  };
}

type RawSubscription = {
  id: string;
  planCode: string;
  plan: RawPlan;
  status: SubscriptionStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  provider: PaymentProvider | null;
  providerRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toSubscriptionData(sub: RawSubscription): SubscriptionData {
  return {
    id: sub.id,
    planCode: sub.planCode,
    plan: toPlanData(sub.plan),
    status: sub.status,
    startedAt: sub.startedAt,
    expiresAt: sub.expiresAt,
    provider: sub.provider,
    providerRef: sub.providerRef,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
}

type RawInvoice = {
  id: string;
  subscriptionId: string;
  amount: unknown;
  currency: string;
  status: InvoiceStatus;
  paidAt: Date | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toInvoiceData(inv: RawInvoice): InvoiceData {
  return {
    id: inv.id,
    subscriptionId: inv.subscriptionId,
    amount: toNumeric(inv.amount),
    currency: inv.currency,
    status: inv.status,
    paidAt: inv.paidAt,
    idempotencyKey: inv.idempotencyKey,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  };
}

export function listPlansResponse(plans: RawPlan[]): ListPlansRes {
  return { message: "Daftar paket berhasil diambil", status: 200, data: plans.map(toPlanData) };
}

export function getMySubscriptionResponse(sub: RawSubscription | null): GetMySubscriptionRes {
  return {
    message: sub ? "Langganan aktif ditemukan" : "Tidak ada langganan aktif",
    status: 200,
    data: sub ? toSubscriptionData(sub) : null,
  };
}

export function checkoutResponse(data: CheckoutRes["data"]): CheckoutRes {
  return { message: "Checkout berhasil dibuat, selesaikan pembayaran", status: 201, data };
}

export function listMyInvoicesResponse(invoices: RawInvoice[]): ListMyInvoicesRes {
  return { message: "Riwayat invoice berhasil diambil", status: 200, data: invoices.map(toInvoiceData) };
}

export function webhookResponse(): WebhookRes {
  return { message: "OK", status: 200 };
}
