import rateLimit from "express-rate-limit";

// Nonaktifkan rate limiter saat test (Vitest otomatis set NODE_ENV=test).
// Tanpa ini, rate limiter akan nyala beneran saat integration test jalan
// beruntun ke endpoint yang sama dalam satu file, dan bisa memicu 429 yang
// tidak ada hubungannya dengan logic yang sedang diuji.
const skipInTest = () => process.env.NODE_ENV === "test";

// Login: batasi percobaan per IP supaya tidak bisa di-brute-force credential.
// 10 percobaan / 15 menit -- cukup longgar untuk user asli yang salah ketik
// beberapa kali, tapi menghambat automated brute-force.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { success: false, message: "Terlalu banyak percobaan login, coba lagi nanti" },
});

// Register: batasi lebih ketat untuk cegah spam pembuatan akun massal.
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { success: false, message: "Terlalu banyak percobaan registrasi, coba lagi nanti" },
});

// Refresh-token: dipanggil otomatis oleh client (bukan diketik user), jadi
// limit-nya lebih longgar, hanya untuk cegah penyalahgunaan.
export const refreshTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { success: false, message: "Terlalu banyak percobaan, coba lagi nanti" },
});
