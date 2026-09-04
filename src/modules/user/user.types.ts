import type { EventCategory, InvitationStatus, PlanTier, PlatformRole, User } from "../../generated/prisma/client";

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  planTier: PlanTier;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetUserProfileRes {
  message: string;
  status: number;
  data: UserProfileData;
}

export function toUserProfileData(user: User): UserProfileData {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    planTier: user.planTier,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function getUserProfileResponse(user: User): GetUserProfileRes {
  return {
    message: "Profil pengguna berhasil diambil",
    status: 200,
    data: toUserProfileData(user),
  };
}

// ── Admin User Management Types ────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  planTier: PlanTier;
  createdAt: Date;
  updatedAt: Date;
  totalInvitations: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserListRes {
  message: string;
  status: number;
  data: {
    users: AdminUserListItem[];
    pagination: PaginationMeta;
  };
}

export interface AdminUserInvitationSummary {
  id: string;
  title: string;
  slug: string;
  status: InvitationStatus;
  eventCategory: EventCategory;
  eventDate: Date | null;
  eventTime: string | null;
  venue: string | null;
  totalGuests: number;
  createdAt: Date;
}

export interface AdminUserDetailData {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  planTier: PlanTier;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalInvitations: number;
    totalGuests: number;
  };
  invitations: AdminUserInvitationSummary[];
}

export interface AdminUserDetailRes {
  message: string;
  status: number;
  data: AdminUserDetailData;
}

export interface UpdateUserTierReq {
  planTier: PlanTier;
}

export interface UpdateUserTierRes {
  message: string;
  status: number;
  data: UserProfileData;
}

export interface UpdateUserRoleReq {
  role: PlatformRole;
}

export interface UpdateUserRoleRes {
  message: string;
  status: number;
  data: UserProfileData;
}

export function adminUserListResponse(users: AdminUserListItem[], pagination: PaginationMeta): AdminUserListRes {
  return {
    message: "Daftar pengguna berhasil diambil",
    status: 200,
    data: {
      users,
      pagination,
    },
  };
}

export function adminUserDetailResponse(data: AdminUserDetailData): AdminUserDetailRes {
  return {
    message: "Detail pengguna berhasil diambil",
    status: 200,
    data,
  };
}

export function updateUserTierResponse(user: User): UpdateUserTierRes {
  return {
    message: "Paket tier pengguna berhasil diperbarui",
    status: 200,
    data: toUserProfileData(user),
  };
}

export function updateUserRoleResponse(user: User): UpdateUserRoleRes {
  return {
    message: "Role pengguna berhasil diperbarui",
    status: 200,
    data: toUserProfileData(user),
  };
}

export interface RevokeUserSessionsRes {
  message: string;
  status: number;
  data: {
    userId: string;
    revokedCount: number;
  };
}

export interface DeleteUserRes {
  message: string;
  status: number;
}

export function revokeUserSessionsResponse(userId: string, revokedCount: number): RevokeUserSessionsRes {
  return {
    message: "Semua sesi pengguna berhasil dicabut",
    status: 200,
    data: {
      userId,
      revokedCount,
    },
  };
}

export function deleteUserResponse(): DeleteUserRes {
  return {
    message: "Pengguna berhasil dihapus secara permanen",
    status: 200,
  };
}
