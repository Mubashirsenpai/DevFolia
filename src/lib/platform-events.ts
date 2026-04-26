import { prisma } from "@/lib/prisma";

export async function logPlatformEvent(params: {
  type: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.platformEvent.create({
      data: {
        type: params.type,
        userId: params.userId ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch {
    // Do not block user flows when analytics logging fails.
  }
}
