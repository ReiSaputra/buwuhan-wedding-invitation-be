import type { NextFunction, Request, Response } from "express";

import type { LogoutRes, RefreshTokenRes, SignInReq, SignInRes, SignUpReq, SignUpRes } from "./auth.types";
import { AuthService } from "./auth.service";
import { clearRefreshTokenCookie, getRefreshTokenFromCookie, setRefreshTokenCookie } from "./auth.cookie";
import { UnauthorizedError } from "../../errors/app.error";

export class AuthController {
  static async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // get request body
      const request: SignUpReq = req.body as SignUpReq;

      // call service
      const response: SignUpRes = await AuthService.signUp(request);

      // send status
      res.status(201).json(response);
    } catch (error) {
      // send error
      next(error);
    }
  }

  static async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // get request body
      const request: SignInReq = req.body as SignInReq;

      // call service
      const response: SignInRes = await AuthService.signIn(request, {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      // refresh token disimpan sebagai httpOnly cookie, JANGAN dikirim di body
      const { refreshToken, ...data } = response.data;
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({ ...response, data });
    } catch (error) {
      // send error
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = getRefreshTokenFromCookie(req);

      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token tidak ditemukan");
      }

      const response: RefreshTokenRes = await AuthService.refreshToken({ refreshToken }, { userAgent: req.headers["user-agent"], ipAddress: req.ip });

      // token baru hasil rotation juga disimpan ulang sebagai cookie
      const { refreshToken: newRefreshToken, ...data } = response.data;
      setRefreshTokenCookie(res, newRefreshToken);

      res.status(200).json({ ...response, data });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = getRefreshTokenFromCookie(req);

      const response: LogoutRes = await AuthService.logout({ refreshToken: refreshToken ?? "" });

      clearRefreshTokenCookie(res);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
