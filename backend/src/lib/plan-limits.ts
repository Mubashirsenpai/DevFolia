import { prisma } from "../lib/prisma.js";

const PORTFOLIO_THEME_ORDER = [
  "midnight",
  "emerald",
  "sunset",
  "neon",
  "royal",
  "rose",
] as const;

export type UserPlan = "FREE" | "PRO" | "BUSINESS";

export function normalizePlan(raw: string | null | undefined): UserPlan {
  const v = (raw ?? "FREE").toUpperCase();
  if (v === "PRO" || v === "BUSINESS") return v;
  return "FREE";
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
