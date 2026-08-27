import { DashboardRepository } from "./dashboard.repository";
import { getDashboardResponse, type DashboardInvitationItem, type GetDashboardRes } from "./dashboard.types";
import { NotFoundError } from "../../errors/app.error";

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
}
