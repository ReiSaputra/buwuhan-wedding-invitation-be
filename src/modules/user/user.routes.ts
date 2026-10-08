import { Router } from "express";
import { UserController } from "./user.controller";
import {
  changePasswordSchema,
  deleteSelfAccountSchema,
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserTierSchema,
} from "./user.schema";
import { denyInstantAccess, requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";

export const userRouter = Router();

// Protected -- Profile info & pengelolaan akun pengguna login
userRouter.get("/users/me", requireAuth, denyInstantAccess, UserController.getProfile);
userRouter.patch("/users/me", requireAuth, denyInstantAccess, validate(updateProfileSchema), UserController.updateProfile);
userRouter.patch("/users/me/password", requireAuth, denyInstantAccess, validate(changePasswordSchema), UserController.changePassword);
userRouter.delete("/users/me", requireAuth, denyInstantAccess, validate(deleteSelfAccountSchema), UserController.deleteSelfAccount);



// ── Admin-only -- Kelola Pengguna ─────────────────────────────────────
userRouter.get("/admin/users", requireAuth, requireRole("ADMIN"), UserController.listUsers);
userRouter.get("/admin/users/:id", requireAuth, requireRole("ADMIN"), UserController.getUserDetail);
userRouter.patch("/admin/users/:id/tier", requireAuth, requireRole("ADMIN"), validate(updateUserTierSchema), UserController.updateTier);
userRouter.patch("/admin/users/:id/role", requireAuth, requireRole("ADMIN"), validate(updateUserRoleSchema), UserController.updateRole);
userRouter.post("/admin/users/:id/revoke-sessions", requireAuth, requireRole("ADMIN"), UserController.revokeSessions);
userRouter.delete("/admin/users/:id", requireAuth, requireRole("ADMIN"), UserController.deleteUser);
