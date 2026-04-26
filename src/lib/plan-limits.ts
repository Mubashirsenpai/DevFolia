import { prisma } from "@/lib/prisma";
import { PORTFOLIO_THEME_ORDER } from "@/lib/portfolio-themes";

export type UserPlan = "FREE" | "PRO" | "BUSINESS";

export function normalizePlan(raw: string | null | undefined): UserPlan {
  const v = (raw ?? "FREE").toUpperCase();
  if (v === "PRO" || v === "BUSINESS") return v;
  return "FREE";
}

export function getBusinessMaxItems() {
  const n = Number(process.env.BUSINESS_MAX_ITEMS_PER_SECTION ?? "100");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : 100;
}

export function getBusinessMaxFiles() {
  const n = Number(process.env.BUSINESS_MAX_FILE_UPLOADS ?? "5000");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 200000) : 5000;
}

export function getBusinessMaxResumes() {
  const n = Number(process.env.BUSINESS_MAX_RESUME_UPLOADS ?? "50");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 50;
}

export function maxItemsForPlan(plan: UserPlan): number {
  if (plan === "FREE") return 4;
  if (plan === "PRO") return 8;
  return getBusinessMaxItems();
}

export function maxImageFileUploadsForPlan(plan: UserPlan): number {
  if (plan === "FREE") return 4;
  if (plan === "PRO") return 8;
  return getBusinessMaxFiles();
}

export function maxResumeUploadsForPlan(plan: UserPlan): number {
  if (plan === "FREE") return 1;
  if (plan === "PRO") return 2;
  return getBusinessMaxResumes();
}

export function allowedThemesForPlan(plan: UserPlan): string[] {
  if (plan === "FREE") return ["midnight", "emerald"];
  if (plan === "PRO") return ["midnight", "emerald", "sunset", "neon"];
  return [...PORTFOLIO_THEME_ORDER];
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return normalizePlan(user?.plan);
}

export async function countFileUploads(userId: string, type: "image" | "resume") {
  const eventType =
    type === "image" ? "content.image_uploaded" : "content.resume_uploaded";
  return prisma.platformEvent.count({
    where: { userId, type: eventType },
  });
}
