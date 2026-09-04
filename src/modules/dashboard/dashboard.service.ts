import { DashboardRepository } from "./dashboard.repository";
import {
  getAdminDashboardStatsResponse,
  getDashboardResponse,
  type DashboardInvitationItem,
  type GetAdminDashboardStatsRes,
  type GetDashboardRes,
  type TopTemplateItem,
} from "./dashboard.types";
import { NotFoundError } from "../../errors/app.error";
import type { EventCategory, InvitationStatus, PlanTier, PlatformRole, RSVPStatus } from "../../generated/prisma/client";

export class DashboardService {
  static async getDashboard(userId: string): Promise<GetDashboardRes> {
    const user = await DashboardRepository.findUserWithDetails(userId);

    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    const invitations = await DashboardRepository.findInvitationsWithStats(userId);

    let totalGuests = 0;
    let totalCheckedIn = 0;

    const formattedInvitations: DashboardInvitationItem[] = invitations.map((inv) => {
      const invTotalGuests = inv.guests.length;
      const invTotalCheckedIn = inv.guests.filter((g) => g.isAttended).length;
      const checkInPercentage = invTotalGuests > 0 ? Math.round((invTotalCheckedIn / invTotalGuests) * 100) : 0;

      totalGuests += invTotalGuests;
      totalCheckedIn += invTotalCheckedIn;

      return {
        id: inv.id,
        title: inv.title,
        slug: inv.slug,
        status: inv.status,
        eventDate: inv.eventDate,
        eventTime: inv.eventTime,
        venue: inv.venue,
        address: inv.address,
        templateThumbnail: inv.template?.previewImageUrl ?? null,
        totalGuests: invTotalGuests,
        totalCheckedIn: invTotalCheckedIn,
        checkInPercentage,
      };
    });

    return getDashboardResponse({
      user: {
        fullName: user.fullName,
        planTier: user.planTier,
      },
      stats: {
        totalInvitations: invitations.length,
        totalGuests,
        totalCheckedIn,
      },
      invitations: formattedInvitations,
    });
  }

  // ── Admin Platform Global Analytics ──────────────────────────────────

  static async getAdminStats(): Promise<GetAdminDashboardStatsRes> {
    const raw = await DashboardRepository.getPlatformStats();

    // Users
    const byTier: Record<PlanTier, number> = { FREE: 0, PRO: 0, MAX: 0 };
    let totalUsers = 0;
    for (const item of raw.usersByTier) {
      byTier[item.planTier] = item._count._all;
      totalUsers += item._count._all;
    }

    const byRole: Record<PlatformRole, number> = { USER: 0, ADMIN: 0 };
    for (const item of raw.usersByRole) {
      byRole[item.role] = item._count._all;
    }

    // Invitations
    const byStatus: Record<InvitationStatus, number> = { DRAFT: 0, ACTIVE: 0, COMPLETED: 0 };
    let totalInvitations = 0;
    for (const item of raw.invitationsByStatus) {
      byStatus[item.status] = item._count._all;
      totalInvitations += item._count._all;
    }

    const byCategory: Record<EventCategory, number> = {
      WEDDING: 0,
      KHITANAN: 0,
      RASULAN: 0,
      AQIQAH: 0,
    };
    for (const item of raw.invitationsByCategory) {
      byCategory[item.eventCategory] = item._count._all;
    }

    // Guests & RSVP
    const byRsvpStatus: Record<RSVPStatus, number> = { CONFIRMED: 0, DECLINED: 0 };
    let totalRsvps = 0;
    for (const item of raw.rsvpsByStatus) {
      byRsvpStatus[item.status] = item._count._all;
      totalRsvps += item._count._all;
    }

    // Top Templates
    const topTemplates: TopTemplateItem[] = raw.topTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tier: t.tier,
      previewImageUrl: t.previewImageUrl,
      usageCount: t._count.invitations,
    }));

    return getAdminDashboardStatsResponse({
      users: {
        total: totalUsers,
        byTier,
        byRole,
      },
      invitations: {
        total: totalInvitations,
        byStatus,
        byCategory,
      },
      guests: {
        totalGuests: raw.totalGuests,
        totalCheckedIn: raw.totalCheckedIn,
        totalRsvps,
        byRsvpStatus,
      },
      topTemplates,
    });
  }
}
