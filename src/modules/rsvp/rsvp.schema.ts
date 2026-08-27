import * as z from "zod";

export const submitRSVPSchema = z
  .object({
    qrCode: z.string().trim().optional(),
    name: z.string().trim().min(1, "Nama wajib diisi jika tidak memiliki kode QR").max(255).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+ -]{6,20}$/, "Format nomor telepon tidak valid")
      .optional()
      .nullable()
      .or(z.literal("")),
    email: z.string().trim().email("Format email tidak valid").optional().nullable().or(z.literal("")),
    status: z.enum(["CONFIRMED", "DECLINED"], {
      error: "Status kehadiran harus CONFIRMED (Hadir) atau DECLINED (Tidak Hadir)",
    }),
    reservation: z.number().int().min(0, "Jumlah reservasi minimal 0").max(50, "Jumlah reservasi maksimal 50").optional(),
    message: z.string().trim().max(1000, "Ucapan maksimal 1000 karakter").optional().nullable(),
  })
  .refine((data) => Boolean(data.qrCode || data.name), {
    message: "Harus menyertakan qrCode atau name tamu",
  });

export const wishesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type SubmitRSVPInput = z.infer<typeof submitRSVPSchema>;
export type WishesQueryInput = z.infer<typeof wishesQuerySchema>;
