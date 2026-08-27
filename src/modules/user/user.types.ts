import type { PlanTier, PlatformRole, User } from "../../generated/prisma/client";

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  planTier: PlanTier;
  createdAt: Date;
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
  };
}

export function getUserProfileResponse(user: User): GetUserProfileRes {
  return {
    message: "Profil pengguna berhasil diambil",
    status: 200,
    data: toUserProfileData(user),
  };
}
