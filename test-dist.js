import { fileURLToPath } from "url";
import path from "path";
import { readFileSync } from "fs";

console.log("=== TESTING DIST/SERVER.JS STARTUP ===");

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  console.log("1. Loading .env...");
  const envContent = readFileSync(path.join(__dirname, ".env"), "utf8");
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

  console.log("2. Importing dist/server.js...");
  await import("./dist/server.js");
  console.log("=== IMPORT dist/server.js SUCCESSFUL! ===");
} catch (err) {
  console.error("DIST STARTUP FAILED:", err);
  process.exit(1);
}
