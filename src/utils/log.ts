import winston from "winston";
import "winston-daily-rotate-file";

const dailyRotateFile = new winston.transports.DailyRotateFile({
  filename: "log/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

export const logger = winston.createLogger({
  // "debug" supaya Prisma query log (yang di-map ke logger.debug di lib/prisma.ts)
  // ikut tercatat -- level "info" sebelumnya membuang semua query log secara diam-diam,
  // karena event Prisma "query" jauh lebih sering muncul daripada "info"/"warn"/"error".
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    // errors({ stack: true }) supaya kalau logger.error dikasih Error object,
    // stack trace-nya ikut tercatat, bukan cuma "Error: <message>"
    winston.format.errors({ stack: true }),
    // printf sekarang ikut mencetak metadata (duration, params, dst) yang
    // dikirim sebagai argumen kedua ke logger.debug/info/warn/error --
    // sebelumnya bagian ini dibuang begitu saja.
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `[${timestamp}] ${level}: ${stack ?? message}${metaString}`;
    }),
  ),
  transports: [
    dailyRotateFile,
    // Console transport terpisah, level "debug" juga di development --
    // supaya pas dev kamu bisa lihat langsung di terminal tanpa buka file log.
    // Di production biasanya tidak perlu (log agregator biasanya baca dari file/stdout saja).
    ...(process.env.NODE_ENV !== "production" ? [new winston.transports.Console({ level: "debug" })] : []),
  ],
});
