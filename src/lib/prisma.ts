import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
// Load .env dari root project (2 level di atas src/lib/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

import { logger } from "../utils/log";

const connectionString = process.env.DATABASE_URL!;

const sql = neon(connectionString);
const adapter = new PrismaNeon(sql);
const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
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
