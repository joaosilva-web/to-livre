#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const exts = [".js", ".ts", ".tsx", ".jsx"];

const patterns = [
  /toISOString\(\)\.split\(\s*['\"]T['\"]\)\[0\]/,
  /toISOString\(\)\.slice\(\s*0\s*,\s*10\s*\)/,
  /toISOString\(\)\.slice\(\s*0\s*,\s*16\s*\)/,
  /toISOString\(\)\.slice\(\s*0\s*\)/,
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (
        file === "node_modules" ||
        file === ".git" ||
        file === ".githooks" ||
        file === "eslint-rules" ||
        file === "scripts"
      )
        return;
      results = results.concat(walk(full));
    } else {
      if (exts.includes(path.extname(full))) results.push(full);
    }
  });
  return results;
}

const files = walk(root);
let found = false;
files.forEach((f) => {
  const content = fs.readFileSync(f, "utf8");
  patterns.forEach((p) => {
    if (p.test(content)) {
      console.error(`[check-dates] Forbidden pattern ${p} found in ${f}`);
      found = true;
    }
  });
});

if (found) {
  console.error(
    "\nPlease use the date utils (formatDateLocal/parseDateTimeLocal) instead of extracting date from toISOString()."
  );
  process.exit(1);
} else {
  console.log("[check-dates] No forbidden date patterns found.");
  process.exit(0);
}
