import * as z from "zod";

export const createGuestSchema = z.object({
  name: z.string().trim().min(1, "Nama tamu wajib diisi").max(255, "Nama tamu maksimal 255 karakter"),
  category: z.string().trim().max(100, "Kategori maksimal 100 karakter").optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ -]{6,20}$/, "Format nomor telepon tidak valid")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z.string().trim().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(1000, "Keterangan maksimal 1000 karakter").optional().nullable(),
  paxCount: z.number().int().min(1, "Estimasi jumlah tamu minimal 1").max(100, "Estimasi jumlah tamu maksimal 100").optional().default(1),
});

export const bulkCreateGuestSchema = z.object({
  guests: z
    .array(createGuestSchema)
    .min(1, "Daftar tamu minimal 1 orang")
    .max(500, "Maksimal import 500 tamu sekaligus"),
});

export const updateGuestSchema = z
  .object({
    name: z.string().trim().min(1, "Nama tamu wajib diisi").max(255).optional(),
    category: z.string().trim().max(100).optional().nullable(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+ -]{6,20}$/, "Format nomor telepon tidak valid")
      .optional()
      .nullable()
      .or(z.literal("")),
    email: z.string().trim().email("Format email tidak valid").optional().nullable().or(z.literal("")),
    notes: z.string().trim().max(1000).optional().nullable(),
    paxCount: z.number().int().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export const checkInGuestSchema = z
  .object({
    qrCode: z.string().trim().min(1, "QR Code tidak boleh kosong").optional(),
    guestId: z.string().trim().min(1, "Guest ID tidak boleh kosong").optional(),
    paxActual: z.number().int().min(1, "Jumlah riil hadir minimal 1 orang").max(100).optional(),
  })
  .refine((data) => Boolean(data.qrCode || data.guestId), {
    message: "Harus menyertakan qrCode atau guestId untuk check-in",
  });

export const checkOutGuestSchema = z
  .object({
    qrCode: z.string().trim().min(1, "QR Code tidak boleh kosong").optional(),
    guestId: z.string().trim().min(1, "Guest ID tidak boleh kosong").optional(),
  })
  .refine((data) => Boolean(data.qrCode || data.guestId), {
    message: "Harus menyertakan qrCode atau guestId untuk check-out",
  });

export const bulkSendGuestEmailSchema = z.object({
  guestIds: z.array(z.string().min(1, "Guest ID tidak valid")).optional(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type BulkCreateGuestInput = z.infer<typeof bulkCreateGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type CheckInGuestInput = z.infer<typeof checkInGuestSchema>;
export type CheckOutGuestInput = z.infer<typeof checkOutGuestSchema>;
export type BulkSendGuestEmailInput = z.infer<typeof bulkSendGuestEmailSchema>;
