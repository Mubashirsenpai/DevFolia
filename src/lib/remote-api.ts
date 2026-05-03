/** Backend base URL when split-deploying API to Render.Same-origin when unset → use Next server actions. */
export function getPublicApiBase(): string | null {
  const raw =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  const v = raw.trim();
  return v ? v.replace(/\/+$/, "") : null;
}
