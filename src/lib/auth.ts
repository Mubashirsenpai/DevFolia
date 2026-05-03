import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretBytes } from "@/lib/session-secret";

const COOKIE_NAME = "portfolio_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  username: string;
};

function getSecret(): Uint8Array {
  return getJwtSecretBytes();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [salt, storedHash] = encoded.split(":");
  if (!salt || !storedHash) return false;
  try {
    const hash = scryptSync(password, salt, 64);
    const stored = Buffer.from(storedHash, "hex");
    if (hash.length !== stored.length) return false;
    return timingSafeEqual(hash, stored);
  } catch {
    return false;
  }
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
