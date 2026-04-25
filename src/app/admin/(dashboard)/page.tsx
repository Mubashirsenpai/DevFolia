import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureProfile } from "@/lib/data";
import { requireSession } from "@/lib/auth";

export default async function AdminHomePage() {
  const session = await requireSession();
  await ensureProfile(session.sub, session.username);
  const [projects, skills, awards, leadership, user, profile] = await Promise.all([
    prisma.project.count({ where: { userId: session.sub } }),
    prisma.skill.count({ where: { userId: session.sub } }),
    prisma.award.count({ where: { userId: session.sub } }),
    prisma.leadership.count({ where: { userId: session.sub } }),
    prisma.user.findUnique({ where: { id: session.sub } }),
    prisma.profile.findUnique({ where: { userId: session.sub } }),
  ]);

  const cards = [
    { href: "/admin/profile", label: "Profile & photo", hint: "Headline, bio, links" },
    { href: "/admin/projects", label: "Projects", hint: `${projects} items` },
    { href: "/admin/skills", label: "Skills", hint: `${skills} items` },
    { href: "/admin/experience", label: "Experience", hint: "Work history" },
    { href: "/admin/education", label: "Education", hint: "Degrees & schools" },
    { href: "/admin/awards", label: "Awards", hint: `${awards} items` },
    { href: "/admin/leadership", label: "Leadership", hint: `${leadership} items` },
    { href: "/admin/settings", label: "Settings", hint: `${user?.plan ?? "FREE"} plan` },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-slate-400">
        Update your public resume site. Visitors only see the public homepage; this
        area is protected.
      </p>
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
        <p>
          Public URL:{" "}
          <Link href={`/${session.username}`} className="text-emerald-300 hover:underline">
            /{session.username}
          </Link>
        </p>
        <p className="mt-1 text-slate-400">
          Views: {user?.publicViews ?? 0} · Theme: {profile?.theme ?? "midnight"}
        </p>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-emerald-600/40 hover:bg-slate-950"
            >
              <span className="font-semibold text-emerald-300">{c.label}</span>
              <span className="mt-1 block text-sm text-slate-500">{c.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
