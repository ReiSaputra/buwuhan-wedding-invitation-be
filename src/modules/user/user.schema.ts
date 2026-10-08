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

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter").optional(),
    avatarUrl: z.string().url("Format URL avatar tidak valid").nullable().optional(),
  })
  .refine((data) => data.fullName !== undefined || data.avatarUrl !== undefined, {
    message: "Minimal salah satu field (fullName atau avatarUrl) harus diisi",
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

export const deleteSelfAccountSchema = z
  .object({
    password: z.string().optional(),
  })
  .optional()
  .default({});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteSelfAccountInput = z.infer<typeof deleteSelfAccountSchema>;
export type UpdateUserTierInput = z.infer<typeof updateUserTierSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
