import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import { logger } from "../utils/log";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
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
