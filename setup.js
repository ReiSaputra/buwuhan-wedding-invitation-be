import { execSync } from "child_process";

console.log("=== Running Setup Script ===");

try {
  console.log("1. Installing required adapter packages directly...");
  execSync("npm install @neondatabase/serverless @prisma/adapter-neon --no-save", { stdio: "inherit" });

  console.log("2. Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("=== Setup Complete! ===");
} catch (err) {
  console.log("Retrying prisma generate directly...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("=== Setup Complete (Prisma Generated)! ===");
  } catch (e2) {
    console.error("Setup failed completely:", e2);
    process.exit(1);
  }
}
