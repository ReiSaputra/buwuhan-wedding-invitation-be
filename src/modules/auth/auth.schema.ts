import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
  .regex(/[0-9]/, "Password harus mengandung angka");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Nama lengkap wajib diisi").max(255),
  email: z.email("Format email tidak valid").trim().toLowerCase(),
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: z.email("Format email tidak valid").trim().toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
