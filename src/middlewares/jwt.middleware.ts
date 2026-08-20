import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

class JwtMiddleware {
  static async use(error: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }
}
