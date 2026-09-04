import type { InvitationStatusType } from "../invitation/invitation.types";
import type { EventCategory, InvitationStatus, PlanTier, PlatformRole, RSVPStatus } from "../../generated/prisma/client";

export interface DashboardInvitationItem {
  id: string;
  title: string;
  slug: string;
  status: InvitationStatusType;
  eventDate: Date | null;
  eventTime: string | null;
  venue: string | null;
  address: string | null;
  templateThumbnail: string | null;
  totalGuests: number;
  totalCheckedIn: number;
  checkInPercentage: number;
}

export interface DashboardStats {
  totalInvitations: number;
  totalGuests: number;
  totalCheckedIn: number;
}

export interface DashboardUserData {
  fullName: string;
  planTier: PlanTier;
}

export interface DashboardData {
  user: DashboardUserData;
  stats: DashboardStats;
  invitations: DashboardInvitationItem[];
}

export interface GetDashboardRes {
  message: string;
  status: number;
  data: DashboardData;
}

export function getDashboardResponse(data: DashboardData): GetDashboardRes {
  return {
    message: "Data dashboard berhasil diambil",
    status: 200,
    data,
  };
}

// ── Admin Platform Analytics Types ─────────────────────────────────────

export interface AdminDashboardUsersStats {
  total: number;
  byTier: Record<PlanTier, number>;
  byRole: Record<PlatformRole, number>;
}

export interface AdminDashboardInvitationsStats {
  total: number;
  byStatus: Record<InvitationStatus, number>;
  byCategory: Record<EventCategory, number>;
}

export interface AdminDashboardGuestsStats {
  totalGuests: number;
  totalCheckedIn: number;
  totalRsvps: number;
  byRsvpStatus: Record<RSVPStatus, number>;
}

export interface TopTemplateItem {
  id: string;
  name: string;
  slug: string;
  tier: PlanTier;
  previewImageUrl: string;
  usageCount: number;
}

export interface AdminDashboardStatsData {
  users: AdminDashboardUsersStats;
  invitations: AdminDashboardInvitationsStats;
  guests: AdminDashboardGuestsStats;
  topTemplates: TopTemplateItem[];
}

export interface GetAdminDashboardStatsRes {
  message: string;
  status: number;
  data: AdminDashboardStatsData;
}

export function getAdminDashboardStatsResponse(data: AdminDashboardStatsData): GetAdminDashboardStatsRes {
  return {
    message: "Statistik platform berhasil diambil",
    status: 200,
    data,
  };
}
