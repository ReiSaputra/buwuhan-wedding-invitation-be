import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/log";

/**
 * Middleware untuk memeriksa kedaluwarsa langganan user secara transparan (lazy check).
 * Jika ada subscription ACTIVE milik user yang expiresAt sudah lewat,
 * maka turunkan planTier user ke FREE dan tandai subscription sebagai EXPIRED.
 */
export async function checkSubscriptionExpiry(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.planTier === "FREE") {
      next();
      return;
    }

    const userId = req.user.id;
    const now = new Date();

    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeSub) {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: activeSub.id },
          data: { status: "EXPIRED" },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { planTier: "FREE" },
        }),
      ]);

      req.user.planTier = "FREE";
      logger.info(`Langganan user ${userId} telah kedaluwarsa. Diturunkan ke tier FREE.`);
    }

    next();
  } catch (err) {
    logger.error("Gagal melakukan pengecekan expiry subscription", { err });
    next(err);
  }
}
