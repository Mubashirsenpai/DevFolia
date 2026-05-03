import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
export function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}
export function verifyPassword(password, encoded) {
    const [salt, storedHash] = encoded.split(":");
    if (!salt || !storedHash)
        return false;
    try {
        const hash = scryptSync(password, salt, 64);
        const stored = Buffer.from(storedHash, "hex");
        if (hash.length !== stored.length)
            return false;
        return timingSafeEqual(hash, stored);
    }
    catch {
        return false;
    }
}
