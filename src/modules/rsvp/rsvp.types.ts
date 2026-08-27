import type { Guest, RSVP, RSVPStatus } from "../../generated/prisma/client";

export interface SubmitRSVPReq {
  qrCode?: string | undefined;
  name?: string | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  status: RSVPStatus;
  reservation?: number | undefined;
  message?: string | null | undefined;
}

export interface RSVPFilterQuery {
  status?: RSVPStatus | undefined;
  search?: string | undefined;
}

export interface WishesQuery {
  limit?: number | undefined;
  page?: number | undefined;
}

export interface RSVPItemData {
  id: string;
  status: RSVPStatus;
  reservation: number;
  message: string | null;
  guestId: string;
  guestName: string;
  guestCategory: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  invitationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishItemData {
  id: string;
  guestName: string;
  status: RSVPStatus;
  message: string;
  createdAt: Date;
}

export interface RSVPStatsData {
  totalGuests: number;
  totalResponded: number;
  totalPending: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPaxConfirmed: number;
}

export interface SubmitRSVPRes {
  message: string;
  status: number;
  data: RSVPItemData;
}

export interface ListRSVPRes {
  message: string;
  status: number;
  data: RSVPItemData[];
}

export interface ListWishesRes {
  message: string;
  status: number;
  data: WishItemData[];
}

export interface GetRSVPStatsRes {
  message: string;
  status: number;
  data: RSVPStatsData;
}

export interface DeleteRSVPRes {
  message: string;
  status: number;
}

// ── Response Formatters ──────────────────────────────────────────────

export function formatRSVPItem(rsvp: RSVP & { guest: Guest }): RSVPItemData {
  return {
    id: rsvp.id,
    status: rsvp.status,
    reservation: rsvp.reservation,
    message: rsvp.message,
    guestId: rsvp.guestId,
    guestName: rsvp.guest.name,
    guestCategory: rsvp.guest.category,
    guestPhone: rsvp.guest.phone,
    guestEmail: rsvp.guest.email,
    invitationId: rsvp.invitationId,
    createdAt: rsvp.createdAt,
    updatedAt: rsvp.updatedAt,
  };
}

export function formatWishItem(rsvp: RSVP & { guest: Guest }): WishItemData {
  return {
    id: rsvp.id,
    guestName: rsvp.guest.name,
    status: rsvp.status,
    message: rsvp.message ?? "",
    createdAt: rsvp.createdAt,
  };
}

export function submitRSVPResponse(rsvp: RSVP & { guest: Guest }): SubmitRSVPRes {
  return {
    message: "RSVP submitted successfully",
    status: 200,
    data: formatRSVPItem(rsvp),
  };
}

export function listRSVPResponse(rsvps: (RSVP & { guest: Guest })[]): ListRSVPRes {
  return {
    message: "RSVP list retrieved successfully",
    status: 200,
    data: rsvps.map(formatRSVPItem),
  };
}

export function listWishesResponse(rsvps: (RSVP & { guest: Guest })[]): ListWishesRes {
  return {
    message: "Wishes retrieved successfully",
    status: 200,
    data: rsvps.map(formatWishItem),
  };
}

export function getRSVPStatsResponse(stats: RSVPStatsData): GetRSVPStatsRes {
  return {
    message: "RSVP statistics retrieved successfully",
    status: 200,
    data: stats,
  };
}

export function deleteRSVPResponse(): DeleteRSVPRes {
  return {
    message: "RSVP deleted successfully",
    status: 200,
  };
}
