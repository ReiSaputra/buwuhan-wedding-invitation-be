import { UserRepository, type UserFilterParams } from "./user.repository";
import {
  adminUserDetailResponse,
  adminUserListResponse,
  deleteUserResponse,
  getUserProfileResponse,
  revokeUserSessionsResponse,
  updateUserRoleResponse,
  updateUserTierResponse,
  type AdminUserDetailRes,
  type AdminUserInvitationSummary,
  type AdminUserListItem,
  type AdminUserListRes,
  type DeleteUserRes,
  type GetUserProfileRes,
  type RevokeUserSessionsRes,
  type UpdateUserRoleReq,
  type UpdateUserRoleRes,
  type UpdateUserTierReq,
  type UpdateUserTierRes,
} from "./user.types";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";

export class UserService {
  static async getProfile(userId: string): Promise<GetUserProfileRes> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    return getUserProfileResponse(user);
  }

  // ── Admin User Management ───────────────────────────────────────────

  static async listUsersForAdmin(params: UserFilterParams): Promise<AdminUserListRes> {
    const { total, users } = await UserRepository.findManyWithFilter(params);

    const userList: AdminUserListItem[] = users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      planTier: u.planTier,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      totalInvitations: u._count.invitations,
    }));

    const totalPages = Math.ceil(total / params.limit) || 1;

    return adminUserListResponse(userList, {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    });
  }

  static async getUserDetailForAdmin(userId: string): Promise<AdminUserDetailRes> {
    const user = await UserRepository.findDetailWithInvitations(userId);

    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    let totalGuests = 0;
    const invitations: AdminUserInvitationSummary[] = user.invitations.map((inv) => {
      const guestCount = inv._count.guests;
      totalGuests += guestCount;

      return {
        id: inv.id,
        title: inv.title,
        slug: inv.slug,
        status: inv.status,
        eventCategory: inv.eventCategory,
        eventDate: inv.eventDate,
        eventTime: inv.eventTime,
        venue: inv.venue,
        totalGuests: guestCount,
        createdAt: inv.createdAt,
      };
    });

    return adminUserDetailResponse({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      planTier: user.planTier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalInvitations: user.invitations.length,
        totalGuests,
      },
      invitations,
    });
  }

  static async updateUserTier(userId: string, request: UpdateUserTierReq): Promise<UpdateUserTierRes> {
    const existing = await UserRepository.findById(userId);

    if (!existing) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    const updated = await UserRepository.updateTier(userId, request.planTier);

    return updateUserTierResponse(updated);
  }

  static async updateUserRole(userId: string, request: UpdateUserRoleReq, currentAdminId: string): Promise<UpdateUserRoleRes> {
    const existing = await UserRepository.findById(userId);

    if (!existing) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    if (userId === currentAdminId && request.role !== "ADMIN") {
      throw new ForbiddenError("Kamu tidak dapat mencabut hak akses ADMIN dari akunmu sendiri");
    }

    const updated = await UserRepository.updateRole(userId, request.role);

    return updateUserRoleResponse(updated);
  }

  static async revokeUserSessions(userId: string): Promise<RevokeUserSessionsRes> {
    const existing = await UserRepository.findById(userId);

    if (!existing) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    const revokedCount = await UserRepository.revokeAllUserSessions(userId);

    return revokeUserSessionsResponse(userId, revokedCount);
  }

  static async deleteUser(userId: string, currentAdminId: string): Promise<DeleteUserRes> {
    const existing = await UserRepository.findById(userId);

    if (!existing) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    if (userId === currentAdminId) {
      throw new ForbiddenError("Kamu tidak dapat menghapus akunmu sendiri");
    }

    await UserRepository.deleteById(userId);

    return deleteUserResponse();
  }
}
