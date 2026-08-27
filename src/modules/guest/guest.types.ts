import type { Guest } from "../../generated/prisma/client";

export interface CreateGuestReq {
  name: string;
  category?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  notes?: string | null | undefined;
  paxCount?: number | undefined;
}

export interface BulkCreateGuestReq {
  guests: CreateGuestReq[];
}

export interface UpdateGuestReq {
  name?: string | undefined;
  category?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  notes?: string | null | undefined;
  paxCount?: number | undefined;
}

export interface CheckInGuestReq {
  qrCode?: string | undefined;
  guestId?: string | undefined;
  paxActual?: number | undefined;
}

export interface CheckOutGuestReq {
  qrCode?: string | undefined;
  guestId?: string | undefined;
}

export interface GuestFilterQuery {
  category?: string | undefined;
  isAttended?: boolean | undefined;
  search?: string | undefined;
}

export interface GuestItemData {
  id: string;
  name: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  qrCode: string;
  paxCount: number;
  paxActual: number | null;
  isAttended: boolean;
  checkedInAt: Date | null;
  checkedOutAt: Date | null;
  invitationId: string;
  invitationUrl: string;
  whatsappShareUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestStatsData {
  totalGuests: number;
  totalAttended: number;
  totalPending: number;
  totalPaxExpected: number;
  totalPaxActual: number;
  byCategory: Record<string, { total: number; attended: number }>;
}

export interface CreateGuestRes {
  message: string;
  status: number;
  data: GuestItemData;
}

export interface BulkCreateGuestRes {
  message: string;
  status: number;
  data: {
    count: number;
    guests: GuestItemData[];
  };
}

export interface GetGuestRes {
  message: string;
  status: number;
  data: GuestItemData;
}

export interface ListGuestRes {
  message: string;
  status: number;
  data: GuestItemData[];
}

export interface UpdateGuestRes {
  message: string;
  status: number;
  data: GuestItemData;
}

export interface DeleteGuestRes {
  message: string;
  status: number;
}

export interface CheckInGuestRes {
  message: string;
  status: number;
  data: GuestItemData;
}

export interface CheckOutGuestRes {
  message: string;
  status: number;
  data: GuestItemData;
}

export interface GetGuestStatsRes {
  message: string;
  status: number;
  data: GuestStatsData;
}

// ── Helper formatters ────────────────────────────────────────────────

export function buildInvitationUrl(invitationSlug: string, qrCode: string): string {
  const baseUrl = process.env.FRONTEND_URL || "https://buwuhan.com";
  return `${baseUrl}/invitation/${invitationSlug}?to=${encodeURIComponent(qrCode)}`;
}

export function buildWhatsappShareUrl(guestName: string, phone: string | null, invitationSlug: string, qrCode: string, coupleNames?: string): string | null {
  if (!phone) return null;

  // Normalisasi nomor telepon: ubah 08xxx menjadi 628xxx
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }

  const link = buildInvitationUrl(invitationSlug, qrCode);
  const coupleText = coupleNames ? ` dari ${coupleNames}` : "";
  const message = `Halo ${guestName},\n\nKami mengundang Anda untuk menghadiri pernikahan kami${coupleText}.\n\nBuka link undangan digital Anda berikut:\n${link}\n\nTerima kasih!`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

export function formatGuestItem(guest: Guest, invitationSlug: string, coupleNames?: string): GuestItemData {
  return {
    id: guest.id,
    name: guest.name,
    category: guest.category,
    phone: guest.phone,
    email: guest.email,
    notes: guest.notes,
    qrCode: guest.qrCode,
    paxCount: guest.paxCount,
    paxActual: guest.paxActual,
    isAttended: guest.isAttended,
    checkedInAt: guest.checkedInAt,
    checkedOutAt: guest.checkedOutAt,
    invitationId: guest.invitationId,
    invitationUrl: buildInvitationUrl(invitationSlug, guest.qrCode),
    whatsappShareUrl: buildWhatsappShareUrl(guest.name, guest.phone, invitationSlug, guest.qrCode, coupleNames),
    createdAt: guest.createdAt,
    updatedAt: guest.updatedAt,
  };
}

export function createGuestResponse(guest: Guest, invitationSlug: string, coupleNames?: string): CreateGuestRes {
  return {
    message: "Guest created successfully",
    status: 201,
    data: formatGuestItem(guest, invitationSlug, coupleNames),
  };
}

export function bulkCreateGuestResponse(guests: Guest[], invitationSlug: string, coupleNames?: string): BulkCreateGuestRes {
  return {
    message: "Guests created successfully",
    status: 201,
    data: {
      count: guests.length,
      guests: guests.map((g) => formatGuestItem(g, invitationSlug, coupleNames)),
    },
  };
}

export function getGuestResponse(guest: Guest, invitationSlug: string, coupleNames?: string): GetGuestRes {
  return {
    message: "Guest retrieved successfully",
    status: 200,
    data: formatGuestItem(guest, invitationSlug, coupleNames),
  };
}

export function listGuestResponse(guests: Guest[], invitationSlug: string, coupleNames?: string): ListGuestRes {
  return {
    message: "Guests retrieved successfully",
    status: 200,
    data: guests.map((g) => formatGuestItem(g, invitationSlug, coupleNames)),
  };
}

export function updateGuestResponse(guest: Guest, invitationSlug: string, coupleNames?: string): UpdateGuestRes {
  return {
    message: "Guest updated successfully",
    status: 200,
    data: formatGuestItem(guest, invitationSlug, coupleNames),
  };
}

export function deleteGuestResponse(): DeleteGuestRes {
  return {
    message: "Guest deleted successfully",
    status: 200,
  };
}

export function checkInGuestResponse(guest: Guest, invitationSlug: string, coupleNames?: string): CheckInGuestRes {
  return {
    message: "Guest checked in successfully",
    status: 200,
    data: formatGuestItem(guest, invitationSlug, coupleNames),
  };
}

export function checkOutGuestResponse(guest: Guest, invitationSlug: string, coupleNames?: string): CheckOutGuestRes {
  return {
    message: "Guest checked out successfully",
    status: 200,
    data: formatGuestItem(guest, invitationSlug, coupleNames),
  };
}

export function getGuestStatsResponse(stats: GuestStatsData): GetGuestStatsRes {
  return {
    message: "Guest statistics retrieved successfully",
    status: 200,
    data: stats,
  };
}
