"use strict";

/**
 * Prisma resolves `directUrl = env("DIRECT_URL")` at config load time.
 * CI hosts (e.g. Render) often only set DATABASE_URL — we mirror it so the CLI can start.
 * For Neon: if DATABASE_URL uses the pooler host, set DIRECT_URL to the non-pooler
 * "direct" connection in production to avoid migration advisory-lock timeouts (P1002).
 *
 * Some hosts run root `postinstall` before `prisma` appears in node_modules (or use a
 * layout where the CLI is not resolvable yet). We fall back to `npx prisma@<version>`.
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");

if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

/** Repo root (parent of /scripts), not process.cwd() — CI cwd can differ from install root. */
const repoRoot = path.resolve(__dirname, "..");
const pkgJson = path.join(repoRoot, "package.json");

function readPinnedPrismaVersion() {
  const fromEnv = String(process.env.PRISMA_NPX_VERSION || "").trim();
  if (fromEnv) return fromEnv;
  try {
    const json = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
    const spec =
      (json.dependencies && json.dependencies.prisma) ||
      (json.devDependencies && json.devDependencies.prisma);
    if (!spec || typeof spec !== "string") return "5.22.0";
    const m = spec.match(/(\d+\.\d+\.\d+)/);
    return m ? m[1] : "5.22.0";
  } catch {
    return "5.22.0";
  }
}

/**
 * @returns {{ kind: "node"; cli: string } | { kind: "npx"; version: string }}
 */
function resolvePrismaInvoker() {
  const noNpx = ["1", "true", "yes"].includes(String(process.env.PRISMA_NO_NPX || "").trim().toLowerCase());

  const legacy = path.join(repoRoot, "node_modules", "prisma", "build", "index.js");
  if (fs.existsSync(legacy)) {
    return { kind: "node", cli: legacy };
  }
  try {
    const req = createRequire(pkgJson);
    const resolved = req.resolve("prisma");
    if (fs.existsSync(resolved)) {
      return { kind: "node", cli: resolved };
    }
  } catch {
    // continue
  }
  if (noNpx) {
    console.error(
      `Prisma CLI not found under ${repoRoot}/node_modules/prisma and PRISMA_NO_NPX is set.\n` +
        `Run "npm install" from the repo root (same folder as package.json) so "prisma" is installed.`,
    );
    process.exit(1);
  }
  const version = readPinnedPrismaVersion();
  console.warn(
    `[run-prisma] Local prisma CLI not found; using npx prisma@${version} (install from repo root to avoid this).`,
  );
  return { kind: "npx", version };
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

const invoker = resolvePrismaInvoker();
let proc;
if (invoker.kind === "node") {
  proc = spawnSync(process.execPath, [invoker.cli, ...args], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
} else {
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  proc = spawnSync(npxCmd, ["--yes", `prisma@${invoker.version}`, ...args], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
}

if (proc.error) {
  console.error(proc.error);
  process.exit(1);
}
process.exit(proc.status ?? 1);
