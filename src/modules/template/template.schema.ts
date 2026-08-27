// Taruh file ini di: src/modules/template/template.schema.ts

import * as z from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug minimal 3 karakter")
  .max(100, "Slug maksimal 100 karakter")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)");

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Nama template wajib diisi").max(255),
  slug: slugSchema,
  tier: z.enum(["FREE", "PRO", "MAX"]),
  previewImageUrl: z.url("previewImageUrl harus berupa URL yang valid"),
  isActive: z.boolean().optional(),
});

export const updateTemplateSchema = z
  .object({
    name: z.string().trim().min(1, "Nama template wajib diisi").max(255).optional(),
    slug: slugSchema.optional(),
    tier: z.enum(["FREE", "PRO", "MAX"]).optional(),
    previewImageUrl: z.url("previewImageUrl harus berupa URL yang valid").optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
