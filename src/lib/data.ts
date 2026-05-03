import { prisma } from "@/lib/prisma";
import { logPlatformEvent } from "@/lib/platform-events";
import type { Prisma } from "@prisma/client";
import { getPublicApiBase } from "@/lib/remote-api";

export async function ensureProfile(userId: string, fallbackName = "Your Name") {
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

export async function getPublicPortfolioByUsername(username: string) {
  const backendApi = getPublicApiBase();
  if (backendApi) {
    try {
      const response = await fetch(
        `${backendApi}/public/${encodeURIComponent(username.toLowerCase())}`,
        { cache: "no-store" },
      );
      if (response.ok) {
        const payload = (await response.json()) as { data?: unknown };
        return (payload.data ?? null) as {
          user: { id: string; username: string };
          profile: Awaited<ReturnType<typeof prisma.profile.findUnique>>;
          projects: Awaited<ReturnType<typeof prisma.project.findMany>>;
          skills: Awaited<ReturnType<typeof prisma.skill.findMany>>;
          awards: Awaited<ReturnType<typeof prisma.award.findMany>>;
          leadership: Awaited<ReturnType<typeof prisma.leadership.findMany>>;
          experience: Awaited<ReturnType<typeof prisma.experience.findMany>>;
          education: Awaited<ReturnType<typeof prisma.education.findMany>>;
        } | null;
      }
      if (response.status === 404) return null;
    } catch {
      // Fall back to local Prisma path during migration/cutover.
    }
  }
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true },
  });
  if (!user) return null;
  await ensureProfile(user.id, user.username);
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.onboardingCompleted) return null;
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
  await logPlatformEvent({
    type: "portfolio.public_view",
    userId: user.id,
    metadata: { username: user.username },
  });
  const [
    projects,
    skills,
    awards,
    leadership,
    experience,
    education,
  ] = await Promise.all([
    prisma.project.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.skill.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.award.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.leadership.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.experience.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.education.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
  ]);

  return {
    user,
    profile,
    projects,
    skills,
    awards,
    leadership,
    experience,
    education,
  };
}

/** Full portfolio data for the logged-in owner (e.g. onboarding preview). No view tracking, not gated on publish. */
export async function getPrivatePortfolioDataForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });
  if (!user) return null;
  await ensureProfile(user.id, user.username);
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return null;
  const [
    projects,
    skills,
    awards,
    leadership,
    experience,
    education,
  ] = await Promise.all([
    prisma.project.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.skill.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.award.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.leadership.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.experience.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.education.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
  ]);
  return {
    user,
    profile,
    projects,
    skills,
    awards,
    leadership,
    experience,
    education,
  };
}

export async function adoptLegacyPortfolioForUser(userId: string) {
  const [ownedProfile, ownedProjects] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
  ]);
  if (!ownedProfile || ownedProjects > 0) return;

  const legacyProfile = await prisma.profile.findFirst({
    where: { userId: null },
    orderBy: { updatedAt: "desc" },
  });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (legacyProfile) {
      await tx.profile.update({
        where: { id: ownedProfile.id },
        data: {
          displayName: legacyProfile.displayName,
          headline: legacyProfile.headline,
          bio: legacyProfile.bio,
          email: legacyProfile.email,
          phone: legacyProfile.phone,
          location: legacyProfile.location,
          website: legacyProfile.website,
          discordUrl: legacyProfile.discordUrl,
          xUrl: legacyProfile.xUrl,
          threadsUrl: legacyProfile.threadsUrl,
          instagramUrl: legacyProfile.instagramUrl,
          facebookUrl: legacyProfile.facebookUrl,
          whatsappUrl: legacyProfile.whatsappUrl,
          linkedinUrl: legacyProfile.linkedinUrl,
          githubUrl: legacyProfile.githubUrl,
          resumeUrl: legacyProfile.resumeUrl,
          profileImage: legacyProfile.profileImage,
        },
      });
      await tx.profile.delete({ where: { id: legacyProfile.id } });
    }

    await Promise.all([
      tx.project.updateMany({ where: { userId: null }, data: { userId } }),
      tx.skill.updateMany({ where: { userId: null }, data: { userId } }),
      tx.award.updateMany({ where: { userId: null }, data: { userId } }),
      tx.leadership.updateMany({ where: { userId: null }, data: { userId } }),
      tx.experience.updateMany({ where: { userId: null }, data: { userId } }),
      tx.education.updateMany({ where: { userId: null }, data: { userId } }),
    ]);
  });
}
