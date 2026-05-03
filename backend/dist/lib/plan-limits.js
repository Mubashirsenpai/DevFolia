import { prisma } from "../lib/prisma.js";
const PORTFOLIO_THEME_ORDER = [
    "midnight",
    "emerald",
    "sunset",
    "neon",
    "royal",
    "rose",
];
export function normalizePlan(raw) {
    const v = (raw ?? "FREE").toUpperCase();
    if (v === "PRO" || v === "BUSINESS")
        return v;
    return "FREE";
}
function getBusinessMaxItems() {
    const n = Number(process.env.BUSINESS_MAX_ITEMS_PER_SECTION ?? "100");
    return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : 100;
}
export function allowedThemesForPlan(plan) {
    if (plan === "FREE")
        return ["midnight", "emerald"];
    if (plan === "PRO")
        return ["midnight", "emerald", "sunset", "neon"];
    return [...PORTFOLIO_THEME_ORDER];
}
export async function getUserPlan(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
    });
    return normalizePlan(user?.plan);
}
