import { PrismaClient } from "@prisma/client";
export const prisma = globalThis.__backendPrisma ??
    new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    });
if (process.env.NODE_ENV !== "production") {
    globalThis.__backendPrisma = prisma;
}
