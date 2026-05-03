import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

function getLastDays(days: number) {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/overview", async (req: AuthedRequest, res) => {
  const userId = req.session!.sub;
  const [user, projects, skills, awards, leadership, experience, education, views] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { publicViews: true } }),
      prisma.project.count({ where: { userId } }),
      prisma.skill.count({ where: { userId } }),
      prisma.award.count({ where: { userId } }),
      prisma.leadership.count({ where: { userId } }),
      prisma.experience.count({ where: { userId } }),
      prisma.education.count({ where: { userId } }),
      prisma.dailyProfileView.findMany({
        where: { userId },
        orderBy: { day: "asc" },
        take: 120,
        select: { day: true, count: true },
      }),
    ]);

  const last14 = getLastDays(14);
  const viewMap = new Map<string, number>(
    views.map((v: { day: string; count: number }) => [v.day, v.count]),
  );
  const series14 = last14.map((day) => ({ day, count: viewMap.get(day) ?? 0 }));
  const todayKey = new Date().toISOString().slice(0, 10);
  const viewsToday = viewMap.get(todayKey) ?? 0;
  const views7d = series14
    .slice(-7)
    .reduce((sum: number, p: { day: string; count: number }) => sum + p.count, 0);

  return res.json({
    ok: true,
    data: {
      publicViews: user?.publicViews ?? 0,
      viewsToday,
      views7d,
      series14,
      counts: { projects, skills, awards, leadership, experience, education },
    },
  });
});
