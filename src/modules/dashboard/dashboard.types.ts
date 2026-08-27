import type { InvitationStatusType } from "../invitation/invitation.types";
import type { PlanTier } from "../../generated/prisma/client";

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
