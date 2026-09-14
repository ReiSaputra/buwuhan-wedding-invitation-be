import { execSync } from "child_process";

console.log("=== KILLING HANGING NODE PROCESSES ===");

try {
  // Matikan proses test-dist atau proses node lain milik user
  execSync("pkill -f test-dist || killall -9 node || true", { stdio: "inherit" });
  console.log("=== All background test scripts killed! ===");
} catch (err) {
  console.log("Cleaned up.");
}
