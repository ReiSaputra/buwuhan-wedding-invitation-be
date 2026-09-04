import { Router } from "express";
import { UserController } from "./user.controller";
import { updateUserRoleSchema, updateUserTierSchema } from "./user.schema";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";

export const userRouter = Router();

// Protected -- Profile info pengguna login
userRouter.get("/users/me", requireAuth, UserController.getProfile);

// ── Admin-only -- Kelola Pengguna ─────────────────────────────────────
userRouter.get("/admin/users", requireAuth, requireRole("ADMIN"), UserController.listUsers);
userRouter.get("/admin/users/:id", requireAuth, requireRole("ADMIN"), UserController.getUserDetail);
userRouter.patch("/admin/users/:id/tier", requireAuth, requireRole("ADMIN"), validate(updateUserTierSchema), UserController.updateTier);
userRouter.patch("/admin/users/:id/role", requireAuth, requireRole("ADMIN"), validate(updateUserRoleSchema), UserController.updateRole);
userRouter.post("/admin/users/:id/revoke-sessions", requireAuth, requireRole("ADMIN"), UserController.revokeSessions);
userRouter.delete("/admin/users/:id", requireAuth, requireRole("ADMIN"), UserController.deleteUser);
