/** Single-segment paths that collide with marketing, billing, auth, or admin routes. */
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
