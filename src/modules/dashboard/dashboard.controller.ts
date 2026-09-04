import type { NextFunction, Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import type { GetAdminDashboardStatsRes, GetDashboardRes } from "./dashboard.types";

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetDashboardRes = await DashboardService.getDashboard(req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Admin Platform Global Analytics Handler ─────────────────────────

  static async getAdminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetAdminDashboardStatsRes = await DashboardService.getAdminStats();
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
