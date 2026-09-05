import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionRepository } from "./subscription.repository";
import * as midtransLib from "../../lib/midtrans";

describe("Subscription Webhook & Midtrans Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject webhook when signature is invalid", async () => {
    vi.spyOn(midtransLib, "verifyMidtransSignature").mockResolvedValue(false);

    const payload = {
      order_id: "SUB-12345-001",
      status_code: "200",
      gross_amount: "49000.00",
      signature_key: "invalid-signature",
      transaction_status: "settlement",
    };

    await expect(SubscriptionService.handleWebhook(payload)).rejects.toThrow("Signature tidak valid");
  });

  it("should handle duplicate webhook idempotently when invoice is already PAID", async () => {
    vi.spyOn(midtransLib, "verifyMidtransSignature").mockResolvedValue(true);
    vi.spyOn(SubscriptionRepository, "findInvoiceByIdempotencyKey").mockResolvedValue({
      id: "inv-001",
      status: "PAID",
      subscription: {} as any,
    } as any);

    const activateSpy = vi.spyOn(SubscriptionRepository, "activateSubscription");

    const payload = {
      order_id: "SUB-12345-001",
      status_code: "200",
      gross_amount: "49000.00",
      signature_key: "valid-signature",
      transaction_status: "settlement",
    };

    const result = await SubscriptionService.handleWebhook(payload);

    expect(result).toEqual({ message: "OK", status: 200 });
    // Pastikan tidak menaikkan tier / mengaktifkan langganan lagi
    expect(activateSpy).not.toHaveBeenCalled();
  });

  it("should activate subscription and upgrade user tier on settlement", async () => {
    vi.spyOn(midtransLib, "verifyMidtransSignature").mockResolvedValue(true);
    vi.spyOn(SubscriptionRepository, "findInvoiceByIdempotencyKey").mockResolvedValue({
      id: "inv-001",
      status: "PENDING",
      subscription: {
        id: "sub-001",
        userId: "user-123",
        plan: {
          code: "PRO",
          tier: "PRO",
          period: "MONTHLY",
        },
      },
    } as any);

    const activateSpy = vi.spyOn(SubscriptionRepository, "activateSubscription").mockResolvedValue([] as any);

    const payload = {
      order_id: "SUB-12345-001",
      status_code: "200",
      gross_amount: "49000.00",
      signature_key: "valid-signature",
      transaction_status: "settlement",
    };

    const result = await SubscriptionService.handleWebhook(payload);

    expect(result).toEqual({ message: "OK", status: 200 });
    expect(activateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: "inv-001",
        subscriptionId: "sub-001",
        userId: "user-123",
        planTier: "PRO",
        periodMonths: 1,
      })
    );
  });
});
