/** Mirrors `src/lib/reserved-usernames.ts` (duplicate to avoid cross-package imports). */
const RESERVED = new Set(
  [
    "about",
    "admin",
    "api",
    "billing",
    "contact",
    "features",
    "login",
    "onboarding",
    "pricing",
    "signup",
  ].map((s) => s.toLowerCase()),
);

export function isReservedUsername(normalizedUsername: string): boolean {
  return RESERVED.has(normalizedUsername.toLowerCase());
}
