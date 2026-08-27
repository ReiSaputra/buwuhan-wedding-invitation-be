import type { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import type { GetUserProfileRes } from "./user.types";

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetUserProfileRes = await UserService.getProfile(req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
