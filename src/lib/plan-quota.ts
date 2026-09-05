import type { PlanTier } from "../generated/prisma/client";
import { QuotaExceededError } from "../errors/app.error";

export interface PlanQuota {
  /** Jumlah undangan berstatus ACTIVE yang diizinkan. -1 = unlimited */
  maxActiveInvitations: number;
  /** Jumlah tamu per undangan. -1 = unlimited */
  maxGuestsPerInvitation: number;
  /** Jumlah foto galeri per undangan. -1 = unlimited */
  maxGalleryPhotos: number;
}

/**
 * Definisi kuota per tier. Satu-satunya source of truth untuk kuota fitur.
 * Nilai -1 berarti unlimited.
 */
export const PLAN_QUOTA = {
  FREE: {
    maxActiveInvitations: 1,
    maxGuestsPerInvitation: 50,
    maxGalleryPhotos: 10,
  },
  PRO: {
    maxActiveInvitations: 5,
    maxGuestsPerInvitation: 500,
    maxGalleryPhotos: 50,
  },
  MAX: {
    maxActiveInvitations: -1,
    maxGuestsPerInvitation: -1,
    maxGalleryPhotos: -1,
  },
} satisfies Record<PlanTier, PlanQuota>;

/**
 * Periksa apakah kuota belum terlampaui.
 *
 * @param current - Jumlah resource saat ini
 * @param max - Batas maksimum dari PLAN_QUOTA (-1 = unlimited)
 * @param label - Teks yang muncul di pesan error (contoh: "1 undangan aktif")
 * @throws QuotaExceededError jika kuota sudah habis
 */
export function checkQuota(current: number, max: number, label: string): void {
  if (max !== -1 && current >= max) {
    throw new QuotaExceededError(`Paket kamu hanya mengizinkan ${max} ${label}`);
  }
}
