const DEV_FALLBACK = "dev-only-unsafe-secret-use-env-32chars-min!";

/**
 * JWT signing key for `portfolio_session`. In production, refuses weak/missing secrets
 * so deployments cannot accidentally ship with a guessable key.
 */
export function getJwtSecretBytes(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    if (s.length < 32) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be set to at least 32 characters in production.",
      );
    }
    return new TextEncoder().encode(s);
  }
  const key = s.length >= 32 ? s : DEV_FALLBACK;
  return new TextEncoder().encode(key);
}
