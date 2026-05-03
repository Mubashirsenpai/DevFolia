"use server";

import { randomUUID } from "crypto";
import { randomBytes } from "crypto";
import { resolveTxt } from "dns/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, requireSession } from "@/lib/auth";
import { getPublicApiBase } from "@/lib/remote-api";
import { getPriceIdForPlan, getStripe } from "@/lib/stripe";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { logPlatformEvent } from "@/lib/platform-events";
import {
  allowedThemesForPlan,
  countFileUploads,
  getUserPlan,
  maxImageFileUploadsForPlan,
  maxItemsForPlan,
  maxResumeUploadsForPlan,
} from "@/lib/plan-limits";
import { parseProjectStatus } from "@/lib/types";

function txt(formData: FormData, key: string, fallback = ""): string {
  const v = formData.get(key);
  return v == null ? fallback : String(v);
}

function num(formData: FormData, key: string, fallback: number): number {
  const v = formData.get(key);
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw)) return raw;
  return `https://${raw}`;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_RESUME_TYPES = ["application/pdf"];

export async function uploadPortfolioImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  const used = await countFileUploads(session.sub, "image");
  const max = maxImageFileUploadsForPlan(plan);
  if (used >= max) {
    return {
      ok: false,
      error: `Image upload limit reached for your plan (${used}/${max}).`,
    };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Use JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Max file size is 5MB." };
  }
  const ext =
    path.extname(file.name) ||
    (file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
        ? ".webp"
        : file.type === "image/gif"
          ? ".gif"
          : ".jpg");
  const name = `${randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const result = await uploadToCloudinary(buf, {
      folder: "devfolia/profile-images",
      publicId: name,
      resourceType: "image",
    });
    const url = result.secureUrl;
    await logPlatformEvent({
      type: "content.image_uploaded",
      userId: session.sub,
      metadata: { url },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, url };
  } catch {
    return { ok: false, error: "Image upload failed. Check Cloudinary setup." };
  }
}

export async function uploadResumePdf(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  const used = await countFileUploads(session.sub, "resume");
  const max = maxResumeUploadsForPlan(plan);
  if (used >= max) {
    return {
      ok: false,
      error: `Resume upload limit reached for your plan (${used}/${max}).`,
    };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a PDF file." };
  }
  const lowerName = file.name.toLowerCase();
  const hasPdfExtension = lowerName.endsWith(".pdf");
  const hasPdfMime =
    ALLOWED_RESUME_TYPES.includes(file.type) ||
    file.type === "application/x-pdf" ||
    file.type === "";
  if (!hasPdfMime && !hasPdfExtension) {
    return { ok: false, error: "Only PDF files are allowed." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Max file size is 10MB." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let url = "";
  try {
    const result = await uploadToCloudinary(buf, {
      folder: "devfolia/resumes",
      /** `.pdf` in public_id preserves correct raw delivery path / Content-Type hints. */
      publicId: `${randomUUID()}.pdf`,
      resourceType: "raw",
    });
    url = result.secureUrl;
    await logPlatformEvent({
      type: "content.resume_uploaded",
      userId: session.sub,
      metadata: { url },
    });
  } catch {
    return { ok: false, error: "Resume upload failed. Check Cloudinary setup." };
  }

  await prisma.profile.upsert({
    where: { userId: session.sub },
    create: {
      userId: session.sub,
      displayName: session.username,
      headline: "Your professional headline",
      bio: "Tell visitors who you are and what you build.",
      discordUrl: null,
      xUrl: null,
      threadsUrl: null,
      instagramUrl: null,
      facebookUrl: null,
      whatsappUrl: null,
      resumeUrl: url,
    },
    update: {
      resumeUrl: url,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { ok: true, url };
}

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  const existing = await prisma.profile.findUnique({ where: { userId: session.sub } });
  const nextProfileImage = txt(formData, "profileImage") || null;
  const nextResume = normalizeUrl(txt(formData, "resumeUrl"));
  if (plan !== "BUSINESS" && nextResume && nextResume !== existing?.resumeUrl) {
    const used = await countFileUploads(session.sub, "resume");
    if (used >= maxResumeUploadsForPlan(plan)) {
      redirect(
        "/admin/profile?error=" +
          encodeURIComponent(
            "Resume change limit reached for your plan. Upgrade to add more documents.",
          ),
      );
    }
  }
  if (nextProfileImage && nextProfileImage !== existing?.profileImage) {
    const used = await countFileUploads(session.sub, "image");
    if (used >= maxImageFileUploadsForPlan(plan)) {
      redirect(
        "/admin/profile?error=" +
          encodeURIComponent("Profile photo upload limit reached for your plan."),
      );
    }
  }

  const backendBase = getPublicApiBase();
  if (backendBase) {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) redirect("/admin/login");
    const body = {
      displayName: txt(formData, "displayName", "Your Name"),
      headline: txt(formData, "headline"),
      bio: txt(formData, "bio"),
      email: txt(formData, "email") || null,
      phone: txt(formData, "phone") || null,
      location: txt(formData, "location") || null,
      website: normalizeUrl(txt(formData, "website")),
      discordUrl: normalizeUrl(txt(formData, "discordUrl")),
      xUrl: normalizeUrl(txt(formData, "xUrl")),
      threadsUrl: normalizeUrl(txt(formData, "threadsUrl")),
      instagramUrl: normalizeUrl(txt(formData, "instagramUrl")),
      facebookUrl: normalizeUrl(txt(formData, "facebookUrl")),
      whatsappUrl: normalizeUrl(txt(formData, "whatsappUrl")),
      linkedinUrl: normalizeUrl(txt(formData, "linkedinUrl")),
      githubUrl: normalizeUrl(txt(formData, "githubUrl")),
      resumeUrl: nextResume,
      profileImage: nextProfileImage,
    };
    const res = await fetch(`${backendBase}/portfolio/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let msg = "Could not save profile.";
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) msg = j.error;
      } catch {
        /* ignore */
      }
      redirect("/admin/profile?error=" + encodeURIComponent(msg));
    }
    revalidatePath("/");
    revalidatePath("/admin/profile");
    revalidatePath(`/${session.username}`);
    redirect("/admin/profile?saved=1");
  }

  await prisma.profile.update({
    where: { userId: session.sub },
    data: {
      displayName: txt(formData, "displayName", "Your Name"),
      headline: txt(formData, "headline"),
      bio: txt(formData, "bio"),
      email: txt(formData, "email") || null,
      phone: txt(formData, "phone") || null,
      location: txt(formData, "location") || null,
      website: normalizeUrl(txt(formData, "website")),
      discordUrl: normalizeUrl(txt(formData, "discordUrl")),
      xUrl: normalizeUrl(txt(formData, "xUrl")),
      threadsUrl: normalizeUrl(txt(formData, "threadsUrl")),
      instagramUrl: normalizeUrl(txt(formData, "instagramUrl")),
      facebookUrl: normalizeUrl(txt(formData, "facebookUrl")),
      whatsappUrl: normalizeUrl(txt(formData, "whatsappUrl")),
      linkedinUrl: normalizeUrl(txt(formData, "linkedinUrl")),
      githubUrl: normalizeUrl(txt(formData, "githubUrl")),
      resumeUrl: nextResume,
      profileImage: nextProfileImage,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/profile");
  revalidatePath(`/${session.username}`);
  redirect("/admin/profile?saved=1");
}

export async function completeOnboarding() {
  const session = await requireSession();
  const backendBase = getPublicApiBase();
  if (backendBase) {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) redirect("/admin/login");
    const res = await fetch(`${backendBase}/portfolio/onboarding/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      redirect(
        "/admin/onboarding?error=" +
          encodeURIComponent("Could not publish. Try again."),
      );
    }
    revalidatePath("/admin");
    revalidatePath("/admin/onboarding");
    revalidatePath(`/${session.username}`);
    await logPlatformEvent({
      type: "portfolio.published",
      userId: session.sub,
      metadata: { username: session.username },
    });
    redirect("/admin");
  }
  await prisma.profile.upsert({
    where: { userId: session.sub },
    create: {
      userId: session.sub,
      displayName: session.username,
      headline: "Your professional headline",
      bio: "Tell visitors who you are and what you build.",
      onboardingCompleted: true,
    },
    update: {
      onboardingCompleted: true,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/onboarding");
  revalidatePath(`/${session.username}`);
  await logPlatformEvent({
    type: "portfolio.published",
    userId: session.sub,
    metadata: { username: session.username },
  });
  redirect("/admin");
}

export async function updateAccountSettings(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  const billingEmail = txt(formData, "billingEmail").trim().toLowerCase() || null;
  const theme = txt(formData, "theme", "midnight");
  const customDomainRaw = txt(formData, "customDomain").trim().toLowerCase() || null;
  const customDomain = plan === "BUSINESS" ? customDomainRaw : null;

  const allowed = allowedThemesForPlan(plan);
  const resolvedTheme = allowed.includes(theme) ? theme : allowed[0] ?? "midnight";

  const backendBase = getPublicApiBase();
  if (backendBase) {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) redirect("/admin/login");
    const res = await fetch(`${backendBase}/account/settings`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billingEmail,
        theme: resolvedTheme,
        customDomain,
      }),
    });
    if (!res.ok) {
      let msg = "Could not save settings.";
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) msg = j.error;
      } catch {
        /* ignore */
      }
      redirect("/admin/settings?error=" + encodeURIComponent(msg));
    }
    revalidatePath("/admin/settings");
    revalidatePath(`/${session.username}`);
    redirect("/admin/settings?saved=1");
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: {
      billingEmail,
    },
  });

  await prisma.profile.updateMany({
    where: { userId: session.sub },
    data: {
      theme: resolvedTheme,
      customDomain,
    },
  });
  if (plan === "BUSINESS" && customDomain) {
    await prisma.domainVerification.upsert({
      where: { userId: session.sub },
      create: {
        userId: session.sub,
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
  } else {
    await prisma.domainVerification.deleteMany({ where: { userId: session.sub } });
  }

  revalidatePath("/admin/settings");
  revalidatePath(`/${session.username}`);
  redirect("/admin/settings?saved=1");
}

export async function startCheckout(plan: "PRO" | "BUSINESS") {
  const session = await requireSession();
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured.");
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) throw new Error("User not found.");
  const price = getPriceIdForPlan(plan);
  if (!price) throw new Error("Price ID not configured.");

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.billingEmail ?? user.email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/settings?billing=cancelled`,
    metadata: { userId: user.id, plan },
  });

  if (!checkout.url) throw new Error("No checkout URL returned.");
  return checkout.url;
}

export async function createBillingPortal() {
  const session = await requireSession();
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured.");
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user?.stripeCustomerId) throw new Error("No Stripe customer linked yet.");

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/settings`,
  });
  return portal.url;
}

export async function verifyCustomDomain() {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  if (plan !== "BUSINESS") return;
  const record = await prisma.domainVerification.findUnique({
    where: { userId: session.sub },
  });
  if (!record) return;

  try {
    const txtRecords = await resolveTxt(record.domain);
    const flat = txtRecords.flat().join(" ");
    const expected = `devfolia-verify=${record.token}`;
    const verified = flat.includes(expected);

    await prisma.domainVerification.update({
      where: { id: record.id },
      data: {
        status: verified ? "verified" : "pending",
        checkedAt: new Date(),
        verifiedAt: verified ? new Date() : null,
      },
    });
    revalidatePath("/admin/settings");
  } catch {
    await prisma.domainVerification.update({
      where: { id: record.id },
      data: { status: "pending", checkedAt: new Date() },
    });
    revalidatePath("/admin/settings");
  }
}

async function assertCanAddListItem(
  plan: Awaited<ReturnType<typeof getUserPlan>>,
  currentCount: Promise<number>,
  redirectPath: string,
) {
  const current = await currentCount;
  const cap = maxItemsForPlan(plan);
  if (current >= cap) {
    redirect(
      `${redirectPath}?planLimit=1&cap=${encodeURIComponent(String(cap))}`,
    );
  }
}

export async function createProject(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  await assertCanAddListItem(
    plan,
    prisma.project.count({ where: { userId: session.sub } }),
    "/admin/projects",
  );
  await prisma.project.create({
    data: {
      userId: session.sub,
      title: txt(formData, "title", "Untitled project"),
      description: txt(formData, "description"),
      status: parseProjectStatus(txt(formData, "status", "JUST_STARTED")),
      imageUrl: txt(formData, "imageUrl") || null,
      demoUrl: txt(formData, "demoUrl") || null,
      repoUrl: txt(formData, "repoUrl") || null,
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const session = await requireSession();
  await prisma.project.updateMany({
    where: { id, userId: session.sub },
    data: {
      title: txt(formData, "title", "Untitled project"),
      description: txt(formData, "description"),
      status: parseProjectStatus(txt(formData, "status", "JUST_STARTED")),
      imageUrl: txt(formData, "imageUrl") || null,
      demoUrl: txt(formData, "demoUrl") || null,
      repoUrl: txt(formData, "repoUrl") || null,
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  const session = await requireSession();
  await prisma.project.deleteMany({ where: { id, userId: session.sub } });
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function createSkill(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  await assertCanAddListItem(
    plan,
    prisma.skill.count({ where: { userId: session.sub } }),
    "/admin/skills",
  );
  const level = Math.min(100, Math.max(0, num(formData, "level", 50)));
  await prisma.skill.create({
    data: {
      userId: session.sub,
      name: txt(formData, "name", "Skill"),
      category: txt(formData, "category"),
      level,
      exampleNote: txt(formData, "exampleNote"),
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function updateSkill(id: string, formData: FormData) {
  const session = await requireSession();
  const level = Math.min(100, Math.max(0, num(formData, "level", 50)));
  await prisma.skill.updateMany({
    where: { id, userId: session.sub },
    data: {
      name: txt(formData, "name", "Skill"),
      category: txt(formData, "category"),
      level,
      exampleNote: txt(formData, "exampleNote"),
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function deleteSkill(id: string) {
  const session = await requireSession();
  await prisma.skill.deleteMany({ where: { id, userId: session.sub } });
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function createAward(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  await assertCanAddListItem(
    plan,
    prisma.award.count({ where: { userId: session.sub } }),
    "/admin/awards",
  );
  await prisma.award.create({
    data: {
      userId: session.sub,
      title: txt(formData, "title", "Award"),
      issuer: txt(formData, "issuer"),
      year: txt(formData, "year"),
      description: txt(formData, "description"),
      imageUrl: txt(formData, "imageUrl") || null,
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/awards");
}

export async function updateAward(id: string, formData: FormData) {
  const session = await requireSession();
  await prisma.award.updateMany({
    where: { id, userId: session.sub },
    data: {
      title: txt(formData, "title", "Award"),
      issuer: txt(formData, "issuer"),
      year: txt(formData, "year"),
      description: txt(formData, "description"),
      imageUrl: txt(formData, "imageUrl") || null,
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/awards");
}

export async function deleteAward(id: string) {
  const session = await requireSession();
  await prisma.award.deleteMany({ where: { id, userId: session.sub } });
  revalidatePath("/");
  revalidatePath("/admin/awards");
}

export async function createLeadership(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  await assertCanAddListItem(
    plan,
    prisma.leadership.count({ where: { userId: session.sub } }),
    "/admin/leadership",
  );
  await prisma.leadership.create({
    data: {
      userId: session.sub,
      role: txt(formData, "role", "Role"),
      organization: txt(formData, "organization", "Organization"),
      period: txt(formData, "period"),
      description: txt(formData, "description"),
      imageUrl: txt(formData, "imageUrl") || null,
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/leadership");
}

export async function updateLeadership(id: string, formData: FormData) {
  const session = await requireSession();
  await prisma.leadership.updateMany({
    where: { id, userId: session.sub },
    data: {
      role: txt(formData, "role", "Role"),
      organization: txt(formData, "organization", "Organization"),
      period: txt(formData, "period"),
      description: txt(formData, "description"),
      imageUrl: txt(formData, "imageUrl") || null,
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/leadership");
}

export async function deleteLeadership(id: string) {
  const session = await requireSession();
  await prisma.leadership.deleteMany({ where: { id, userId: session.sub } });
  revalidatePath("/");
  revalidatePath("/admin/leadership");
}

export async function createExperience(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  await assertCanAddListItem(
    plan,
    prisma.experience.count({ where: { userId: session.sub } }),
    "/admin/experience",
  );
  await prisma.experience.create({
    data: {
      userId: session.sub,
      title: txt(formData, "title", "Title"),
      company: txt(formData, "company", "Company"),
      location: txt(formData, "location") || null,
      period: txt(formData, "period", "Period"),
      description: txt(formData, "description"),
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/experience");
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await requireSession();
  await prisma.experience.updateMany({
    where: { id, userId: session.sub },
    data: {
      title: txt(formData, "title", "Title"),
      company: txt(formData, "company", "Company"),
      location: txt(formData, "location") || null,
      period: txt(formData, "period", "Period"),
      description: txt(formData, "description"),
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/experience");
}

export async function deleteExperience(id: string) {
  const session = await requireSession();
  await prisma.experience.deleteMany({ where: { id, userId: session.sub } });
  revalidatePath("/");
  revalidatePath("/admin/experience");
}

export async function createEducation(formData: FormData) {
  const session = await requireSession();
  const plan = await getUserPlan(session.sub);
  await assertCanAddListItem(
    plan,
    prisma.education.count({ where: { userId: session.sub } }),
    "/admin/education",
  );
  await prisma.education.create({
    data: {
      userId: session.sub,
      school: txt(formData, "school", "School"),
      degree: txt(formData, "degree", "Degree"),
      period: txt(formData, "period", "Period"),
      details: txt(formData, "details"),
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/education");
}

export async function updateEducation(id: string, formData: FormData) {
  const session = await requireSession();
  await prisma.education.updateMany({
    where: { id, userId: session.sub },
    data: {
      school: txt(formData, "school", "School"),
      degree: txt(formData, "degree", "Degree"),
      period: txt(formData, "period", "Period"),
      details: txt(formData, "details"),
      sortOrder: num(formData, "sortOrder", 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/education");
}

export async function deleteEducation(id: string) {
  const session = await requireSession();
  await prisma.education.deleteMany({ where: { id, userId: session.sub } });
  revalidatePath("/");
  revalidatePath("/admin/education");
}
