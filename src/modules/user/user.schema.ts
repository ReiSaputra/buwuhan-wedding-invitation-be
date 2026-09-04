import * as z from "zod";

export const updateUserTierSchema = z.object({
  planTier: z.enum(["FREE", "PRO", "MAX"]),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export const adminUserQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  planTier: z.enum(["FREE", "PRO", "MAX"]).optional(),
});

export type UpdateUserTierInput = z.infer<typeof updateUserTierSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
