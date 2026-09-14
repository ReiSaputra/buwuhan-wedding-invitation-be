import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

import { logger } from "../utils/log";

// Gunakan WebSocket bawaan Node.js 22 agar Neon terhubung via port 443
// (bukan TCP port 5432 yang mungkin diblokir hosting)
// @ts-ignore WebSocket is globally available in Node.js 22
neonConfig.webSocketConstructor = WebSocket;

// DATABASE_URL sudah di-set oleh app.js sebelum module ini dimuat
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("query", (e) => {
  logger.debug(`Prisma Query: ${e.query}`, {
    duration: `${e.duration}ms`,
    params: e.params,
  });
});

prisma.$on("info", (e) => {
  logger.info(e.message);
});
prisma.$on("warn", (e) => {
  logger.warn(e.message);
});
prisma.$on("error", (e) => {
  logger.error(e.message);
});

export { prisma };
