import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signSession } from "../lib/session.js";
import { requireAuth } from "../middleware/auth.js";
export const authRouter = Router();
const loginThrottle = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
});
const signupThrottle = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many signups from this address" },
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const signupSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
});
function normalizeUsername(raw) {
    return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}
authRouter.post("/login", loginThrottle, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = await signSession({ sub: user.id, username: user.username });
    res.cookie("portfolio_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.json({
        ok: true,
        token,
        user: { id: user.id, email: user.email, username: user.username, plan: user.plan },
    });
});
authRouter.post("/signup", signupThrottle, async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const email = parsed.data.email.trim().toLowerCase();
    const username = normalizeUsername(parsed.data.username);
    if (username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters." });
    }
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true },
    });
    if (existing) {
        return res.status(409).json({ error: "Email or username already exists." });
    }
    const user = await prisma.user.create({
        data: {
            email,
            username,
            passwordHash: hashPassword(parsed.data.password),
            profile: {
                create: {
                    displayName: username,
                    headline: "Your professional headline",
                    bio: "Tell visitors who you are and what you build.",
                },
            },
        },
        select: { id: true, email: true, username: true, plan: true },
    });
    const token = await signSession({ sub: user.id, username: user.username });
    res.cookie("portfolio_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.status(201).json({ ok: true, token, user });
});
authRouter.get("/me", requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.session.sub },
        select: {
            id: true,
            email: true,
            username: true,
            plan: true,
            publicViews: true,
        },
    });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ ok: true, user });
});
authRouter.post("/logout", (_req, res) => {
    res.clearCookie("portfolio_session", { path: "/" });
    return res.json({ ok: true });
});
