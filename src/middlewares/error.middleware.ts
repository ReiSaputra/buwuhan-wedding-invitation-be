import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { logger } from "../utils/log";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Prisma error [${err.code}]: ${err.message}`, {
      code: err.code,
      meta: err.meta,
    });

    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Data dengan nilai tersebut sudah ada",
      });
    }

    if (err.code === "P2003" || err.code === "P2014") {
      return res.status(409).json({
        success: false,
        message: "Data ini masih terhubung dengan data lain sehingga tidak bisa dihapus",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }
  }

  logger.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
