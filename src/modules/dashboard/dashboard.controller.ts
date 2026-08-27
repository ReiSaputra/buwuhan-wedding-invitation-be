import type { NextFunction, Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import type { GetDashboardRes } from "./dashboard.types";

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetDashboardRes = await DashboardService.getDashboard(req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
