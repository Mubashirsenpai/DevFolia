import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { __backendPrisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.__backendPrisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__backendPrisma = prisma;
}
