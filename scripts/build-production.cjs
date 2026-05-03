"use strict";

/**
 * Vercel / CI-friendly build:
 * 1. Prisma migrate (optional — skip if DB unreachable or avoid pooler timeouts)
 * 2. Prisma generate
 * 3. next build
 *
 * Env:
 * - SKIP_PRISMA_MIGRATE=true — skip migrate (apply migrations locally: npx prisma migrate deploy)
 * - VERCEL=1 — on Vercel, migrate is skipped by default unless RUN_PRISMA_MIGRATE=true
 *   (avoids repeated P1002/timeouts unless you intentionally enable migrate on Vercel)
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = process.cwd();
const runPrisma = path.join(__dirname, "run-prisma.cjs");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

function runPrismaArgs(args) {
  return spawnSync(process.execPath, [runPrisma, ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}

function runNextBuild() {
  if (!fs.existsSync(nextBin)) {
    console.error(`Next CLI missing at ${nextBin}. Run npm install.`);
    process.exit(1);
  }
  return spawnSync(process.execPath, [nextBin, "build"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}

const onVercel = process.env.VERCEL === "1";
let shouldMigrate = true;

if (process.env.SKIP_PRISMA_MIGRATE === "true" || process.env.SKIP_PRISMA_MIGRATE === "1") {
  shouldMigrate = false;
} else if (process.env.RUN_PRISMA_MIGRATE === "true" || process.env.RUN_PRISMA_MIGRATE === "1") {
  shouldMigrate = true;
} else if (onVercel) {
  shouldMigrate = false;
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "[build] DATABASE_URL is not set. Add it under Vercel → Settings → Environment Variables (Production).",
  );
  process.exit(1);
}

if (shouldMigrate) {
  console.log("[build] prisma migrate deploy");
  const migrate = runPrismaArgs(["migrate", "deploy", "--schema", "prisma/schema.prisma"]);
  if (migrate.status !== 0) {
    console.error(
      "\n[build] migrate deploy failed. Options:\n" +
        "  • Neon: use pooled DATABASE_URL + direct DIRECT_URL (pooling OFF) as in .env.example\n" +
        "  • Vercel: set RUN_PRISMA_MIGRATE=true only after both URLs work, or skip migrate:\n" +
        "      SKIP_PRISMA_MIGRATE=true (already default on Vercel without RUN_PRISMA_MIGRATE)\n" +
        "      then run locally: npx prisma migrate deploy\n",
    );
    process.exit(migrate.status ?? 1);
  }
} else {
  console.log(
    onVercel
      ? "[build] skipping prisma migrate on Vercel (set RUN_PRISMA_MIGRATE=true after DIRECT_URL works)"
      : "[build] skipping prisma migrate (SKIP_PRISMA_MIGRATE set)",
  );
}

console.log("[build] prisma generate");
const gen = runPrismaArgs(["generate", "--schema", "prisma/schema.prisma"]);
if (gen.status !== 0) {
  console.error("[build] prisma generate failed");
  process.exit(gen.status ?? 1);
}

console.log("[build] next build");
const nb = runNextBuild();
process.exit(nb.status ?? 1);
