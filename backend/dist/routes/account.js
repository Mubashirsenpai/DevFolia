import { randomBytes } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { allowedThemesForPlan, getUserPlan } from "../lib/plan-limits.js";
export const accountRouter = Router();
accountRouter.use(requireAuth);
const settingsSchema = z.object({
    billingEmail: z.string().nullable().optional(),
    theme: z.string(),
    customDomain: z.string().nullable().optional(),
});
accountRouter.put("/settings", async (req, res) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid settings payload" });
    }
    const userId = req.session.sub;
    const plan = await getUserPlan(userId);
    let billingEmail = typeof parsed.data.billingEmail === "string"
        ? parsed.data.billingEmail.trim().toLowerCase() || null
        : parsed.data.billingEmail ?? null;
    const rawDomain = typeof parsed.data.customDomain === "string"
        ? parsed.data.customDomain.trim().toLowerCase() || null
        : null;
    const customDomain = plan === "BUSINESS" ? rawDomain : null;
    const allowed = allowedThemesForPlan(plan);
    const theme = parsed.data.theme.trim() || "midnight";
    const resolvedTheme = allowed.includes(theme) ? theme : (allowed[0] ?? "midnight");
    await prisma.user.update({
        where: { id: userId },
        data: { billingEmail },
    });
    await prisma.profile.updateMany({
        where: { userId },
        data: {
            theme: resolvedTheme,
            customDomain,
        },
    });
    if (plan === "BUSINESS" && customDomain) {
        await prisma.domainVerification.upsert({
            where: { userId },
            create: {
                userId,
                domain: customDomain,
                token: randomBytes(16).toString("hex"),
                status: "pending",
            },
            update: {
                domain: customDomain,
                token: randomBytes(16).toString("hex"),
                status: "pending",
                checkedAt: null,
                verifiedAt: null,
            },
        });
    }
    else {
        await prisma.domainVerification.deleteMany({ where: { userId } });
    }
    return res.json({ ok: true });
});
