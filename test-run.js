import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { readFileSync } from "fs";

console.log("=== DIAGNOSTIC STARTUP TEST ===");

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  console.log("1. Reading .env file...");
  const envPath = path.join(__dirname, ".env");
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
  console.log("DATABASE_URL found?", !!process.env.DATABASE_URL);
  console.log("DATABASE_URL prefix:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "none");

  console.log("2. Registering tsx...");
  const require = createRequire(import.meta.url);
  require("tsx/esm/api").register();

  console.log("3. Testing Prisma connection...");
  const { prisma } = await import("./src/lib/prisma.ts");
  console.log("Prisma instance created. Testing DB query...");
  const count = await prisma.user.count();
  console.log("DB Query SUCCESS! User count:", count);

  console.log("=== ALL CHECKS PASSED! ===");
} catch (err) {
  console.error("DIAGNOSTIC FAILED:", err);
  process.exit(1);
}
