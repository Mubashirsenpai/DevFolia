import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";
import { isReservedUsername } from "@/lib/reserved-usernames";

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export async function GET(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const rl = checkRateLimit(`useravail:${ip}`, 60, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        available: false,
        reason: "Too many requests. Try again later.",
        retryAfter: rl.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const username = normalizeUsername(searchParams.get("username") ?? "");

  if (username.length < 3) {
    return NextResponse.json({
      available: false,
      normalized: username,
      reason: "Username must be at least 3 characters.",
    });
  }

  if (isReservedUsername(username)) {
    return NextResponse.json({
      available: false,
      normalized: username,
      reason: "That username is reserved. Try another.",
    });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existing,
      normalized: username,
    });
  } catch {
    return NextResponse.json(
      {
        available: false,
        normalized: username,
        reason: "Database unavailable. Check DATABASE_URL matches prisma/schema (postgresql).",
      },
      { status: 503 },
    );
  }
}
