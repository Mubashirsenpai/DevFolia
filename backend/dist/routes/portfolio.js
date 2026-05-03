import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
export const portfolioRouter = Router();
const PROJECT_STATUSES = ["COMPLETED", "IN_PROGRESS", "JUST_STARTED"];
function parseProjectStatus(value) {
    if (value && PROJECT_STATUSES.includes(value)) {
        return value;
    }
    return "JUST_STARTED";
}
async function ensureProfile(userId, fallbackName = "Your Name") {
    return prisma.profile.upsert({
        where: { userId },
        create: {
            userId,
            displayName: fallbackName,
            headline: "Your professional headline",
            bio: "Tell visitors who you are and what you build.",
        },
        update: {},
    });
}
function owner(req) {
    return req.session.sub;
}
portfolioRouter.use(requireAuth);
portfolioRouter.get("/me", async (req, res) => {
    const me = req.session;
    await ensureProfile(me.sub, me.username);
    const [user, profile, projects, skills, awards, leadership, experience, education] = await Promise.all([
        prisma.user.findUnique({ where: { id: me.sub }, select: { id: true, username: true, plan: true, publicViews: true } }),
        prisma.profile.findUnique({ where: { userId: me.sub } }),
        prisma.project.findMany({ where: { userId: me.sub }, orderBy: { sortOrder: "asc" } }),
        prisma.skill.findMany({ where: { userId: me.sub }, orderBy: { sortOrder: "asc" } }),
        prisma.award.findMany({ where: { userId: me.sub }, orderBy: { sortOrder: "asc" } }),
        prisma.leadership.findMany({ where: { userId: me.sub }, orderBy: { sortOrder: "asc" } }),
        prisma.experience.findMany({ where: { userId: me.sub }, orderBy: { sortOrder: "asc" } }),
        prisma.education.findMany({ where: { userId: me.sub }, orderBy: { sortOrder: "asc" } }),
    ]);
    if (!user || !profile)
        return res.status(404).json({ error: "Portfolio not found" });
    return res.json({ ok: true, data: { user, profile, projects, skills, awards, leadership, experience, education } });
});
portfolioRouter.post("/onboarding/complete", async (req, res) => {
    const userId = owner(req);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
    });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    await prisma.profile.upsert({
        where: { userId },
        create: {
            userId,
            displayName: user.username,
            headline: "Your professional headline",
            bio: "Tell visitors who you are and what you build.",
            onboardingCompleted: true,
        },
        update: { onboardingCompleted: true },
    });
    return res.json({ ok: true });
});
const profileSchema = z.object({
    displayName: z.string().min(1).default("Your Name"),
    headline: z.string().default(""),
    bio: z.string().default(""),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    discordUrl: z.string().optional().nullable(),
    xUrl: z.string().optional().nullable(),
    threadsUrl: z.string().optional().nullable(),
    instagramUrl: z.string().optional().nullable(),
    facebookUrl: z.string().optional().nullable(),
    whatsappUrl: z.string().optional().nullable(),
    linkedinUrl: z.string().optional().nullable(),
    githubUrl: z.string().optional().nullable(),
    resumeUrl: z.string().optional().nullable(),
    profileImage: z.string().optional().nullable(),
    theme: z.string().optional(),
});
portfolioRouter.put("/profile", async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid profile payload" });
    const input = parsed.data;
    const updated = await prisma.profile.upsert({
        where: { userId: owner(req) },
        create: { userId: owner(req), ...input },
        update: { ...input },
    });
    return res.json({ ok: true, profile: updated });
});
const idParams = z.object({ id: z.string().min(1) });
const projectSchema = z.object({
    title: z.string().min(1).default("Untitled project"),
    description: z.string().default(""),
    status: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
    demoUrl: z.string().optional().nullable(),
    repoUrl: z.string().optional().nullable(),
    sortOrder: z.number().int().default(0),
});
portfolioRouter.get("/projects", async (req, res) => {
    const data = await prisma.project.findMany({ where: { userId: owner(req) }, orderBy: { sortOrder: "asc" } });
    res.json({ ok: true, items: data });
});
portfolioRouter.post("/projects", async (req, res) => {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid project payload" });
    const created = await prisma.project.create({
        data: { userId: owner(req), ...parsed.data, status: parseProjectStatus(parsed.data.status) },
    });
    res.status(201).json({ ok: true, item: created });
});
portfolioRouter.put("/projects/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    const parsed = projectSchema.safeParse(req.body);
    if (!params.success || !parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    await prisma.project.updateMany({
        where: { id: params.data.id, userId: owner(req) },
        data: { ...parsed.data, status: parseProjectStatus(parsed.data.status) },
    });
    res.json({ ok: true });
});
portfolioRouter.delete("/projects/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: "Invalid id" });
    await prisma.project.deleteMany({ where: { id: params.data.id, userId: owner(req) } });
    res.json({ ok: true });
});
const skillSchema = z.object({
    name: z.string().min(1).default("Skill"),
    category: z.string().default(""),
    level: z.number().int().min(0).max(100).default(50),
    exampleNote: z.string().default(""),
    sortOrder: z.number().int().default(0),
});
portfolioRouter.get("/skills", async (req, res) => {
    const data = await prisma.skill.findMany({ where: { userId: owner(req) }, orderBy: { sortOrder: "asc" } });
    res.json({ ok: true, items: data });
});
portfolioRouter.post("/skills", async (req, res) => {
    const parsed = skillSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid skill payload" });
    const created = await prisma.skill.create({ data: { userId: owner(req), ...parsed.data } });
    res.status(201).json({ ok: true, item: created });
});
portfolioRouter.put("/skills/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    const parsed = skillSchema.safeParse(req.body);
    if (!params.success || !parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    await prisma.skill.updateMany({ where: { id: params.data.id, userId: owner(req) }, data: parsed.data });
    res.json({ ok: true });
});
portfolioRouter.delete("/skills/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: "Invalid id" });
    await prisma.skill.deleteMany({ where: { id: params.data.id, userId: owner(req) } });
    res.json({ ok: true });
});
const awardSchema = z.object({
    title: z.string().min(1).default("Award"),
    issuer: z.string().default(""),
    year: z.string().default(""),
    description: z.string().default(""),
    imageUrl: z.string().optional().nullable(),
    sortOrder: z.number().int().default(0),
});
portfolioRouter.get("/awards", async (req, res) => {
    const data = await prisma.award.findMany({ where: { userId: owner(req) }, orderBy: { sortOrder: "asc" } });
    res.json({ ok: true, items: data });
});
portfolioRouter.post("/awards", async (req, res) => {
    const parsed = awardSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid award payload" });
    const created = await prisma.award.create({ data: { userId: owner(req), ...parsed.data } });
    res.status(201).json({ ok: true, item: created });
});
portfolioRouter.put("/awards/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    const parsed = awardSchema.safeParse(req.body);
    if (!params.success || !parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    await prisma.award.updateMany({ where: { id: params.data.id, userId: owner(req) }, data: parsed.data });
    res.json({ ok: true });
});
portfolioRouter.delete("/awards/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: "Invalid id" });
    await prisma.award.deleteMany({ where: { id: params.data.id, userId: owner(req) } });
    res.json({ ok: true });
});
const leadershipSchema = z.object({
    role: z.string().min(1).default("Role"),
    organization: z.string().min(1).default("Organization"),
    period: z.string().default(""),
    description: z.string().default(""),
    imageUrl: z.string().optional().nullable(),
    sortOrder: z.number().int().default(0),
});
portfolioRouter.get("/leadership", async (req, res) => {
    const data = await prisma.leadership.findMany({ where: { userId: owner(req) }, orderBy: { sortOrder: "asc" } });
    res.json({ ok: true, items: data });
});
portfolioRouter.post("/leadership", async (req, res) => {
    const parsed = leadershipSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid leadership payload" });
    const created = await prisma.leadership.create({ data: { userId: owner(req), ...parsed.data } });
    res.status(201).json({ ok: true, item: created });
});
portfolioRouter.put("/leadership/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    const parsed = leadershipSchema.safeParse(req.body);
    if (!params.success || !parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    await prisma.leadership.updateMany({ where: { id: params.data.id, userId: owner(req) }, data: parsed.data });
    res.json({ ok: true });
});
portfolioRouter.delete("/leadership/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: "Invalid id" });
    await prisma.leadership.deleteMany({ where: { id: params.data.id, userId: owner(req) } });
    res.json({ ok: true });
});
const experienceSchema = z.object({
    title: z.string().min(1).default("Title"),
    company: z.string().min(1).default("Company"),
    location: z.string().optional().nullable(),
    period: z.string().default("Period"),
    description: z.string().default(""),
    sortOrder: z.number().int().default(0),
});
portfolioRouter.get("/experience", async (req, res) => {
    const data = await prisma.experience.findMany({ where: { userId: owner(req) }, orderBy: { sortOrder: "asc" } });
    res.json({ ok: true, items: data });
});
portfolioRouter.post("/experience", async (req, res) => {
    const parsed = experienceSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid experience payload" });
    const created = await prisma.experience.create({ data: { userId: owner(req), ...parsed.data } });
    res.status(201).json({ ok: true, item: created });
});
portfolioRouter.put("/experience/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    const parsed = experienceSchema.safeParse(req.body);
    if (!params.success || !parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    await prisma.experience.updateMany({ where: { id: params.data.id, userId: owner(req) }, data: parsed.data });
    res.json({ ok: true });
});
portfolioRouter.delete("/experience/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: "Invalid id" });
    await prisma.experience.deleteMany({ where: { id: params.data.id, userId: owner(req) } });
    res.json({ ok: true });
});
const educationSchema = z.object({
    school: z.string().min(1).default("School"),
    degree: z.string().min(1).default("Degree"),
    period: z.string().default("Period"),
    details: z.string().default(""),
    sortOrder: z.number().int().default(0),
});
portfolioRouter.get("/education", async (req, res) => {
    const data = await prisma.education.findMany({ where: { userId: owner(req) }, orderBy: { sortOrder: "asc" } });
    res.json({ ok: true, items: data });
});
portfolioRouter.post("/education", async (req, res) => {
    const parsed = educationSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid education payload" });
    const created = await prisma.education.create({ data: { userId: owner(req), ...parsed.data } });
    res.status(201).json({ ok: true, item: created });
});
portfolioRouter.put("/education/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    const parsed = educationSchema.safeParse(req.body);
    if (!params.success || !parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    await prisma.education.updateMany({ where: { id: params.data.id, userId: owner(req) }, data: parsed.data });
    res.json({ ok: true });
});
portfolioRouter.delete("/education/:id", async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: "Invalid id" });
    await prisma.education.deleteMany({ where: { id: params.data.id, userId: owner(req) } });
    res.json({ ok: true });
});
