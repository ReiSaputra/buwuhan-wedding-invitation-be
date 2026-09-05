import * as z from "zod";

export const checkoutSchema = z.object({
  planCode: z.enum(["PRO", "MAX"], {
    error: "planCode harus salah satu dari: PRO, MAX",
  }),
});

export const webhookPayloadSchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
  transaction_time: z.string().optional(),
});

export const adminOverrideStatusSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]),
});

export const adminListSubscriptionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]).optional(),
  userId: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AdminListSubscriptionsQuery = z.infer<typeof adminListSubscriptionsSchema>;
