import { Router } from "express";
import { prisma } from "../lib/prisma.js";
export const publicRouter = Router();
publicRouter.get("/:username", async (req, res) => {
    const username = String(req.params.username ?? "").toLowerCase().trim();
    if (!username)
        return res.status(400).json({ error: "Username is required" });
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true, username: true },
    });
    if (!user)
        return res.status(404).json({ error: "Portfolio not found" });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile?.onboardingCompleted) {
        return res.status(404).json({ error: "Portfolio not published" });
    }
    await prisma.user.update({
        where: { id: user.id },
        data: { publicViews: { increment: 1 } },
    });
    const day = new Date().toISOString().slice(0, 10);
    await prisma.dailyProfileView.upsert({
        where: { userId_day: { userId: user.id, day } },
        create: { userId: user.id, day, count: 1 },
        update: { count: { increment: 1 } },
    });
    const [projects, skills, awards, leadership, experience, education] = await Promise.all([
        prisma.project.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
        prisma.skill.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
        prisma.award.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
        prisma.leadership.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
        prisma.experience.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
        prisma.education.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    ]);
    return res.json({
        ok: true,
        data: {
            user,
            profile,
            projects,
            skills,
            awards,
            leadership,
            experience,
            education,
        },
    });
});
