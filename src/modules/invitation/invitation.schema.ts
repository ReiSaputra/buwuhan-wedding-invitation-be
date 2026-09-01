import * as z from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug minimal 3 karakter")
  .max(100, "Slug maksimal 100 karakter")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)");

const coupleSchema = z.object({
  type: z.enum(["BRIDE", "GROOM"]),
  name: z.string().trim().min(1, "Nama wajib diisi").max(255),
  fatherName: z.string().trim().min(1, "Nama ayah wajib diisi").max(255),
  motherName: z.string().trim().min(1, "Nama ibu wajib diisi").max(255),
});

function refineCouplesPair(couples: z.infer<typeof coupleSchema>[]) {
  return new Set(couples.map((c) => c.type)).size === 2;
}

export const createInvitationSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(255),
  slug: slugSchema,
  eventCategory: z.enum(["WEDDING", "KHITANAN", "RASULAN", "AQIQAH"]).optional().default("WEDDING"),
  couples: z
    .array(coupleSchema)
    .length(2, "Harus ada tepat 2 data mempelai (bride & groom)")
    .refine(refineCouplesPair, {
      message: "Tipe mempelai harus terdiri dari BRIDE dan GROOM, tidak boleh duplikat",
    })
    .optional(),
  eventDate: z.coerce.date().optional().nullable(),
  eventTime: z.string().trim().max(100).optional().nullable(),
  venue: z.string().trim().max(255).optional().nullable(),
  address: z.string().trim().max(1000).optional().nullable(),
  additionalInfo: z.record(z.string(), z.unknown()).optional(),
  templateId: z.string().trim().min(1).optional(),
});

export const updateInvitationSchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi").max(255).optional(),
    slug: slugSchema.optional(),
    eventCategory: z.enum(["WEDDING", "KHITANAN", "RASULAN", "AQIQAH"]).optional(),
    couples: z
      .array(coupleSchema)
      .length(2, "Harus ada tepat 2 data mempelai (bride & groom)")
      .refine(refineCouplesPair, {
        message: "Tipe mempelai harus terdiri dari BRIDE dan GROOM, tidak boleh duplikat",
      })
      .optional(),
    eventDate: z.coerce.date().optional().nullable(),
    eventTime: z.string().trim().max(100).optional().nullable(),
    venue: z.string().trim().max(255).optional().nullable(),
    address: z.string().trim().max(1000).optional().nullable(),
    additionalInfo: z.record(z.string(), z.unknown()).optional(),
    templateId: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export const updateInvitationStatusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]),
});

// ── Galeri Foto ──────────────────────────────────────────────────────

export const addGalleryPhotoSchema = z.object({
  imageUrl: z.string().trim().min(1, "URL foto wajib diisi"),
  caption: z.string().trim().max(500, "Caption maksimal 500 karakter").optional().nullable(),
  order: z.number().int().min(0).optional().default(0),
});

export const updateGalleryPhotoSchema = z
  .object({
    imageUrl: z.string().trim().min(1).optional(),
    caption: z.string().trim().max(500).optional().nullable(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update foto galeri",
  });

// ── Kisah Cinta (Love Story Timeline) ────────────────────────────────

export const addLoveStorySchema = z.object({
  yearOrDate: z.string().trim().min(1, "Tahun/Waktu momen wajib diisi").max(100),
  title: z.string().trim().min(1, "Judul momen wajib diisi").max(255),
  story: z.string().trim().min(1, "Cerita narasi wajib diisi").max(5000),
  imageUrl: z.string().trim().optional().nullable().or(z.literal("")),
  order: z.number().int().min(0).optional().default(0),
});

export const updateLoveStorySchema = z
  .object({
    yearOrDate: z.string().trim().min(1).max(100).optional(),
    title: z.string().trim().min(1).max(255).optional(),
    story: z.string().trim().min(1).max(5000).optional(),
    imageUrl: z.string().trim().optional().nullable().or(z.literal("")),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update kisah cinta",
  });

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type UpdateInvitationStatusInput = z.infer<typeof updateInvitationStatusSchema>;
export type AddGalleryPhotoInput = z.infer<typeof addGalleryPhotoSchema>;
export type UpdateGalleryPhotoInput = z.infer<typeof updateGalleryPhotoSchema>;
export type AddLoveStoryInput = z.infer<typeof addLoveStorySchema>;
export type UpdateLoveStoryInput = z.infer<typeof updateLoveStorySchema>;
