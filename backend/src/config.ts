import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" });

function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/** CORS allowlist; must match the browser origin (scheme + host, no path). */
function getFrontendOrigin(): string {
  const v = process.env.FRONTEND_ORIGIN?.trim();
  if (v) return v.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  throw new Error(
    "FRONTEND_ORIGIN is required in production. In Render → Environment, set FRONTEND_ORIGIN to your Vercel URL (example: https://your-app.vercel.app). No trailing slash.",
  );
}

const frontendOrigin = getFrontendOrigin();

export const config = {
  port: Number(process.env.PORT ?? "8080"),
  frontendOrigin,
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("ADMIN_SESSION_SECRET"),
};
