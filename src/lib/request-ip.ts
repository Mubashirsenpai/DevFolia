import { headers } from "next/headers";

/** IP for rate limiting in Server Actions / RSC (uses x-forwarded-for on Vercel). */
export async function getRequestIpForRateLimit(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "unknown";
}
