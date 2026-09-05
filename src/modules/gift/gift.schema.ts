import * as z from "zod";

export const createGiftAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Nama bank/e-wallet wajib diisi").max(100, "Nama bank/e-wallet maksimal 100 karakter"),
  accountNumber: z.string().trim().min(1, "Nomor rekening wajib diisi").max(100, "Nomor rekening maksimal 100 karakter"),
  accountHolder: z.string().trim().min(1, "Nama pemilik rekening wajib diisi").max(255, "Nama pemilik rekening maksimal 255 karakter"),
  type: z.string().trim().max(50).optional().default("BANK"),
  order: z.number().int().nonnegative("Urutan tidak boleh negatif").optional().default(0),
});

export const updateGiftAccountSchema = z
  .object({
    bankName: z.string().trim().min(1, "Nama bank/e-wallet wajib diisi").max(100).optional(),
    accountNumber: z.string().trim().min(1, "Nomor rekening wajib diisi").max(100).optional(),
    accountHolder: z.string().trim().min(1, "Nama pemilik rekening wajib diisi").max(255).optional(),
    type: z.string().trim().max(50).optional(),
    order: z.number().int().nonnegative("Urutan tidak boleh negatif").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export const createGiftSchema = z.object({
  giverName: z.string().trim().min(1, "Nama pemberi wajib diisi").max(255, "Nama pemberi maksimal 255 karakter"),
  amount: z.number().positive("Nominal hadiah harus lebih dari 0"),
  method: z.enum(["CASH", "TRANSFER", "EWALLET"]).optional().default("TRANSFER"),
  note: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
  receivedAt: z.string().datetime({ message: "Format tanggal tidak valid (gunakan ISO 8601)" }).optional(),
});

export const updateGiftSchema = z
  .object({
    giverName: z.string().trim().min(1, "Nama pemberi wajib diisi").max(255).optional(),
    amount: z.number().positive("Nominal hadiah harus lebih dari 0").optional(),
    method: z.enum(["CASH", "TRANSFER", "EWALLET"]).optional(),
    note: z.string().trim().max(1000).optional().nullable(),
    receivedAt: z.string().datetime({ message: "Format tanggal tidak valid" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export type CreateGiftAccountInput = z.infer<typeof createGiftAccountSchema>;
export type UpdateGiftAccountInput = z.infer<typeof updateGiftAccountSchema>;
export type CreateGiftInput = z.infer<typeof createGiftSchema>;
export type UpdateGiftInput = z.infer<typeof updateGiftSchema>;

