import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "portfolio_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  username: string;
};

/** Must match middleware secret resolution */
function getSecret(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  const key =
    s.length >= 32
      ? s
      : "dev-only-unsafe-secret-use-env-32chars-min!";
  return new TextEncoder().encode(key);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [salt, storedHash] = encoded.split(":");
  if (!salt || !storedHash) return false;
  const hash = scryptSync(password, salt, 64);
  return timingSafeEqual(hash, Buffer.from(storedHash, "hex"));
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, getSecret());
    const sub = verified.payload.sub;
    const username = verified.payload.username;
    if (typeof sub !== "string" || typeof username !== "string") {
      return null;
    }
    return { sub, username };
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/admin/login");
  return session;
}

export { COOKIE_NAME, SESSION_MAX_AGE };
