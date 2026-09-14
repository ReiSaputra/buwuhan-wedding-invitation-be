import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import { logger } from "../utils/log";

const connectionString = process.env.DATABASE_URL || "";

// Cek apakah koneksi mengarah ke Neon (production) atau PostgreSQL lokal
const isNeon = connectionString.includes("neon.tech");

let adapter: any;

if (isNeon) {
  // Mode Production / Neon: gunakan WebSocket (Port 443 HTTPS)
  // @ts-ignore WebSocket is globally available in Node.js 22
  neonConfig.webSocketConstructor = WebSocket;
  adapter = new PrismaNeon({ connectionString });
} else {
  // Mode Local Development: gunakan TCP PostgreSQL standar
  adapter = new PrismaPg({ connectionString });
}

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
