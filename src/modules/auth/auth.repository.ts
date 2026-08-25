import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "../../lib/prisma";
import type { RequestMeta, SignUpReq } from "./auth.types";
import { Prisma } from "../../generated/prisma/client";

// Refresh token sudah random & high-entropy (crypto.randomBytes), jadi cukup
// di-hash pakai SHA-256 (cepat) -- tidak perlu bcrypt (yang sengaja lambat,
// dan lebih cocok untuk password yang low-entropy/manusiawi).
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  static async createUser(request: SignUpReq) {
    try {
      return await prisma.user.create({
        data: {
          fullName: request.fullName,
          email: request.email,
          passwordHash: await bcrypt.hash(request.password, 10),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Email sudah terdaftar");
      }
      throw error;
    }
  }

  // ── Session ────────────────────────────────────────────────────────

  static async createSession(params: { userId: string; refreshToken: string; expiresAt: Date; meta?: RequestMeta | undefined }) {
    return await prisma.session.create({
      data: {
        userId: params.userId,
        refreshTokenHash: hashToken(params.refreshToken),
        // Prisma expect `string | null` (kolom String? di schema), bukan
        // `string | undefined` -- jadi undefined dikonversi ke null di sini.
        userAgent: params.meta?.userAgent ?? null,
        ipAddress: params.meta?.ipAddress ?? null,
        expiresAt: params.expiresAt,
      },
    });
  }

  static async findSessionByRefreshToken(refreshToken: string) {
    return await prisma.session.findUnique({
      where: { refreshTokenHash: hashToken(refreshToken) },
    });
  }

  static async revokeSessionById(sessionId: string) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeSessionByRefreshToken(refreshToken: string) {
    // pakai updateMany supaya tidak error kalau token sudah tidak ada/invalid
    return await prisma.session.updateMany({
      where: { refreshTokenHash: hashToken(refreshToken) },
      data: { revokedAt: new Date() },
    });
  }
}
