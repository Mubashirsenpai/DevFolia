import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Neon / pooler often closes idle TCP sockets; Prisma replaces them. That still emits a driver "Closed" log line. */
function isBenignPoolerDisconnect(message: string): boolean {
  return /PostgreSQL connection: Error \{ kind: Closed/i.test(message);
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", { level: "error", emit: "event" }]
        : ["error"],
  });

if (process.env.NODE_ENV === "development" && !globalForPrisma.prisma) {
  type LogEvent = { message: string };
  const client = prisma as PrismaClient & { $on(event: "error", cb: (e: LogEvent) => void): void };
  client.$on("error", (e: LogEvent) => {
    if (isBenignPoolerDisconnect(e.message)) return;
    console.error("prisma:error", e.message);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
