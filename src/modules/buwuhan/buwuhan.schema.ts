import * as z from "zod";

export const ALLOWED_UNITS = [
  "transaksi",
  "kg",
  "gram",
  "liter",
  "karung",
  "ekor",
  "unit",
  "pack",
  "box",
  "orang",
  "jasa",
] as const;

export const buwuhanItemSchema = z.object({
  itemName: z.string().trim().min(1, "Nama bantuan wajib diisi").max(255, "Nama bantuan maksimal 255 karakter"),
  quantity: z.number().positive("Jumlah harus lebih dari 0"),
  unit: z.enum(ALLOWED_UNITS, { message: "Satuan tidak valid" }),
  category: z.string().trim().max(100, "Kategori maksimal 100 karakter").optional().nullable(),
  estimatedValue: z.number().nonnegative("Estimasi nilai tidak boleh negatif").optional().nullable(),
});

export const createBuwuhanSchema = z.object({
  giverName: z.string().trim().min(1, "Nama pemberi wajib diisi").max(255, "Nama pemberi maksimal 255 karakter"),
  note: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
  receivedAt: z.string().datetime({ message: "Format tanggal tidak valid (gunakan ISO 8601)" }).optional(),
  items: z.array(buwuhanItemSchema).min(1, "Minimal 1 item bantuan"),
});

export const updateBuwuhanSchema = z
  .object({
    giverName: z.string().trim().min(1, "Nama pemberi wajib diisi").max(255).optional(),
    note: z.string().trim().max(1000).optional().nullable(),
    receivedAt: z.string().datetime({ message: "Format tanggal tidak valid" }).optional(),
    items: z.array(buwuhanItemSchema).min(1, "Minimal 1 item bantuan").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export type CreateBuwuhanInput = z.infer<typeof createBuwuhanSchema>;
export type UpdateBuwuhanInput = z.infer<typeof updateBuwuhanSchema>;
