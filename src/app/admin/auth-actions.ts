"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { adoptLegacyPortfolioForUser } from "@/lib/data";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid credentials." };
  }
  await adoptLegacyPortfolioForUser(user.id);
  const token = await createSessionToken({
    sub: user.id,
    username: user.username,
  });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export async function signupAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) return { error: "Enter a valid email." };
  if (username.length < 3) {
    return { error: "Username must be at least 3 characters." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });
  if (existing) return { error: "Email or username already exists." };

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: hashPassword(password),
      profile: {
        create: {
          displayName: username,
          headline: "Your professional headline",
          bio: "Tell visitors who you are and what you build.",
        },
      },
    },
  });
  await adoptLegacyPortfolioForUser(user.id);

  const token = await createSessionToken({ sub: user.id, username: user.username });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin/onboarding");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/admin/login");
}
