import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { ValidationError } from "../errors/app.error";

export const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request first
    req.body = schema.parse(req.body);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateQuery = (schema: z.ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Parameter query tidak valid";
    return next(new ValidationError(message, result.error.issues));
  }
// Overwrite read‑only query using Object.defineProperty
Object.defineProperty(req, 'query', {
  value: result.data,
  configurable: true,
  writable: true,
});
  next();
};
