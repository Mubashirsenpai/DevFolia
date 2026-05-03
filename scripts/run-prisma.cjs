"use strict";

/**
 * Prisma resolves `directUrl = env("DIRECT_URL")` at config load time.
 * CI hosts (e.g. Render) often only set DATABASE_URL — we mirror it so the CLI can start.
 * For Neon: if DATABASE_URL uses the pooler host, set DIRECT_URL to the non-pooler
 * "direct" connection in production to avoid migration advisory-lock timeouts (P1002).
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const cwd = process.cwd();
const prismaCli = path.join(cwd, "node_modules", "prisma", "build", "index.js");
if (!fs.existsSync(prismaCli)) {
  console.error(`Prisma CLI not found at ${prismaCli} (cwd: ${cwd})`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (
  args[0] === "generate" &&
  ["1", "true", "yes"].includes(String(process.env.SKIP_PRISMA_GENERATE || "").trim().toLowerCase())
) {
  console.warn(
    "Skipping Prisma generate (SKIP_PRISMA_GENERATE is set). Run `npm run db:generate` when no process locks the query engine.",
  );
  process.exit(0);
}
if (args.length === 0) {
  console.error("Usage: node scripts/run-prisma.cjs <prisma subcommand> [args...]");
  process.exit(1);
}

const proc = spawnSync(process.execPath, [prismaCli, ...args], {
  cwd,
  stdio: "inherit",
  env: process.env,
});

if (proc.error) {
  console.error(proc.error);
  process.exit(1);
}
process.exit(proc.status ?? 1);
