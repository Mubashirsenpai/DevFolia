import { cookies } from "next/headers";
import { getPublicApiBase } from "@/lib/remote-api";

function getBackendBase() {
  return getPublicApiBase();
}

export async function backendApiGet<T>(path: string): Promise<T | null> {
  const base = getBackendBase();
  if (!base) return null;

  const token = (await cookies()).get("portfolio_session")?.value;
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${base}${path}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
