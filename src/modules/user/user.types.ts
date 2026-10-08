import type { EventCategory, InvitationStatus, PlanTier, PlatformRole, User } from "../../generated/prisma/client";

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
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
    avatarUrl: user.avatarUrl ?? null,
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

export interface UpdateProfileReq {
  fullName?: string | undefined;
  avatarUrl?: string | null | undefined;
}

export interface UpdateProfileRes {
  message: string;
  status: number;
  data: UserProfileData;
}

export function updateProfileResponse(user: User): UpdateProfileRes {
  return {
    message: "Profil berhasil diperbarui",
    status: 200,
    data: toUserProfileData(user),
  };
}

export interface ChangePasswordReq {
  currentPassword?: string | undefined;
  newPassword: string;
}

export interface ChangePasswordRes {
  message: string;
  status: number;
  data: {
    success: boolean;
  };
}

export function changePasswordResponse(): ChangePasswordRes {
  return {
    message: "Kata sandi berhasil diperbarui",
    status: 200,
    data: {
      success: true,
    },
  };
}

export interface DeleteSelfAccountReq {
  password?: string | undefined;
}

export interface DeleteSelfAccountRes {
  message: string;
  status: number;
}

export function deleteSelfAccountResponse(): DeleteSelfAccountRes {
  return {
    message: "Akun Anda berhasil dihapus secara permanen",
    status: 200,
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
