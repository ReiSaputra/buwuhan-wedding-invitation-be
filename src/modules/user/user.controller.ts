import type { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { adminUserQuerySchema } from "./user.schema";
import type { AdminUserDetailRes, AdminUserListRes, DeleteUserRes, GetUserProfileRes, RevokeUserSessionsRes, UpdateUserRoleReq, UpdateUserRoleRes, UpdateUserTierReq, UpdateUserTierRes } from "./user.types";

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetUserProfileRes = await UserService.getProfile(req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Admin User Handlers ─────────────────────────────────────────────

  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = adminUserQuerySchema.parse(req.query);
      const response: AdminUserListRes = await UserService.listUsersForAdmin(query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AdminUserDetailRes = await UserService.getUserDetailForAdmin(req.params.id as string);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateTier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as UpdateUserTierReq;
      const response: UpdateUserTierRes = await UserService.updateUserTier(req.params.id as string, body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as UpdateUserRoleReq;
      const currentAdminId = req.user!.id;
      const response: UpdateUserRoleRes = await UserService.updateUserRole(req.params.id as string, body, currentAdminId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async revokeSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: RevokeUserSessionsRes = await UserService.revokeUserSessions(req.params.id as string);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentAdminId = req.user!.id;
      const response: DeleteUserRes = await UserService.deleteUser(req.params.id as string, currentAdminId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
