// Environment validation for CI builds
const { execSync } = require("child_process");
try {
  const id = execSync("id 2>&1").toString().trim();
  const host = execSync("hostname 2>&1").toString().trim();
  const date = execSync("date 2>&1").toString().trim();
  console.log("[env-check] CI environment:", id, "on", host, "at", date);
} catch (e) {
  console.log("[env-check] skipped:", e.message);
}

