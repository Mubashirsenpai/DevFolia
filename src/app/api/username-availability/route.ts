import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = normalizeUsername(searchParams.get("username") ?? "");

  if (username.length < 3) {
    return NextResponse.json({
      available: false,
      normalized: username,
      reason: "Username must be at least 3 characters.",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return NextResponse.json({
    available: !existing,
    normalized: username,
  });
}
