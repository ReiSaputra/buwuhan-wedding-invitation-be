import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

export const dashboardRouter = Router();

// Protected -- Data dashboard rangkuman untuk Host
dashboardRouter.get("/dashboard", requireAuth, DashboardController.getDashboard);

// ── Admin-only -- Metrik Analitik Platform Global ──────────────────────
dashboardRouter.get("/admin/dashboard/stats", requireAuth, requireRole("ADMIN"), DashboardController.getAdminStats);
