import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import ruleNoToIso from "./eslint-rules/no-toISOString-slice.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // custom rules (plugin registered below)
];

// Register custom rule implementation path
// Add local rule path and enable rule by name
eslintConfig.push({
  linterOptions: { rulePaths: ["./eslint-rules"] },
  rules: { "no-toISOString-slice": "error" },
});

export default eslintConfig;
