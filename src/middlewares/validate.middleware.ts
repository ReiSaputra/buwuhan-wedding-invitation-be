import type { Request, Response, NextFunction } from "express";
import * as z from "zod";

export const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request first
    req.body = schema.parse(req.body);

    next();
  } catch (error) {
    next(error);
  }
};
