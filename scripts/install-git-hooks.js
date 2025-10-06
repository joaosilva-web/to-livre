const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, ".githooks", "pre-commit");
const destDir = path.join(root, ".git", "hooks");
const dest = path.join(destDir, "pre-commit");

try {
  if (!fs.existsSync(destDir)) {
    console.warn(".git/hooks directory not found. Skipping hook installation.");
    process.exit(0);
  }
  fs.copyFileSync(src, dest);
  try {
    fs.chmodSync(dest, 0o755);
  } catch (e) {}
  console.log("Installed pre-commit hook.");
} catch (e) {
  console.error("Failed to install git hook:", e);
  process.exit(1);
}
