import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const dashboardRouter = Router();

// Protected -- Data dashboard rangkuman untuk Host
dashboardRouter.get("/dashboard", requireAuth, DashboardController.getDashboard);
