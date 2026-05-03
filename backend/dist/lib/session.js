import { SignJWT, jwtVerify } from "jose";
function getSecret() {
    const raw = process.env.ADMIN_SESSION_SECRET ?? "";
    if (process.env.NODE_ENV === "production") {
        if (raw.length < 32) {
            throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters in production.");
        }
        return new TextEncoder().encode(raw);
    }
    const secret = raw.length >= 32 ? raw : "dev-only-unsafe-secret-use-env-32chars-min!";
    return new TextEncoder().encode(secret);
}
export async function signSession(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecret());
}
export async function verifySession(token) {
    try {
        const verified = await jwtVerify(token, getSecret());
        const sub = verified.payload.sub;
        const username = verified.payload.username;
        if (typeof sub !== "string" || typeof username !== "string") {
            return null;
        }
        return { sub, username };
    }
    catch {
        return null;
    }
}
