import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureProfile } from "@/lib/data";
import { requireSession } from "@/lib/auth";
import { backendApiGet } from "@/lib/backend-api";

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

export default async function AdminHomePage() {
  const session = await requireSession();
  const backend = await backendApiGet<{
    ok: boolean;
    data: {
      publicViews: number;
      viewsToday: number;
      views7d: number;
      series14: Array<{ day: string; count: number }>;
      counts: {
        projects: number;
        skills: number;
        awards: number;
        leadership: number;
        experience: number;
        education: number;
      };
    };
  }>("/analytics/overview");
  let projects = 0;
  let skills = 0;
  let awards = 0;
  let leadership = 0;
  let experience = 0;
  let education = 0;
  let user: { publicViews?: number; plan?: string } | null = null;
  let profile: { theme?: string | null } | null = null;
  let views: Array<{ day: string; count: number }> = [];

  if (backend?.ok) {
    projects = backend.data.counts.projects;
    skills = backend.data.counts.skills;
    awards = backend.data.counts.awards;
    leadership = backend.data.counts.leadership;
    experience = backend.data.counts.experience;
    education = backend.data.counts.education;
    user = { publicViews: backend.data.publicViews };
    views = backend.data.series14;
    profile = await prisma.profile.findUnique({
      where: { userId: session.sub },
      select: { theme: true },
    });
  } else {
    await ensureProfile(session.sub, session.username);
    [projects, skills, awards, leadership, experience, education, user, profile, views] = await Promise.all([
      prisma.project.count({ where: { userId: session.sub } }),
      prisma.skill.count({ where: { userId: session.sub } }),
      prisma.award.count({ where: { userId: session.sub } }),
      prisma.leadership.count({ where: { userId: session.sub } }),
      prisma.experience.count({ where: { userId: session.sub } }),
      prisma.education.count({ where: { userId: session.sub } }),
      prisma.user.findUnique({ where: { id: session.sub } }),
      prisma.profile.findUnique({ where: { userId: session.sub } }),
      prisma.dailyProfileView.findMany({
        where: { userId: session.sub },
        orderBy: { day: "asc" },
        take: 120,
      }),
    ]);
  }
  const last14 = getLastDays(14);
  const viewMap = new Map<string, number>(
    views.map((v: { day: string; count: number }) => [v.day, v.count]),
  );
  const series = last14.map((day: string) => ({ day, count: viewMap.get(day) ?? 0 }));
  const maxCount = Math.max(1, ...series.map((s: (typeof series)[number]) => s.count));
  const todayKey = new Date().toISOString().slice(0, 10);
  const viewsToday = backend?.ok ? backend.data.viewsToday : viewMap.get(todayKey) ?? 0;
  const views7d = backend?.ok
    ? backend.data.views7d
    : series.slice(-7).reduce((sum, p) => sum + p.count, 0);
  const totalContent =
    projects + skills + awards + leadership + experience + education;
  const sectionStats = [
    { label: "Projects", href: "/admin/projects", value: projects },
    { label: "Skills", href: "/admin/skills", value: skills },
    { label: "Experience", href: "/admin/experience", value: experience },
    { label: "Education", href: "/admin/education", value: education },
    { label: "Awards", href: "/admin/awards", value: awards },
    { label: "Leadership", href: "/admin/leadership", value: leadership },
  ];
  const maxSectionValue = Math.max(
    1,
    ...sectionStats.map((s: (typeof sectionStats)[number]) => s.value),
  );

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
    <div className="mx-auto max-w-5xl">
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

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total views</p>
          <p className="mt-1 text-2xl font-bold text-white">{user?.publicViews ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Views (7d)</p>
          <p className="mt-1 text-2xl font-bold text-white">{views7d}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Views today</p>
          <p className="mt-1 text-2xl font-bold text-white">{viewsToday}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Content entries</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalContent}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Portfolio views (14 days)</h2>
            <Link href="/admin/analytics" className="text-xs text-emerald-300 hover:underline">
              Full analytics
            </Link>
          </div>
          <div
            className="mt-4 grid items-end gap-2"
            style={{ gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))` }}
          >
            {series.map((point: (typeof series)[number]) => (
              <div key={point.day} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-emerald-500/80"
                  style={{ height: `${Math.max(8, (point.count / maxCount) * 120)}px` }}
                  title={`${point.day}: ${point.count} views`}
                />
                <span className="text-[10px] text-slate-500">{point.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Content distribution</h2>
          <ul className="mt-4 space-y-3">
            {sectionStats.map((item: (typeof sectionStats)[number]) => (
              <li key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <Link href={item.href} className="text-slate-300 hover:text-emerald-300">
                    {item.label}
                  </Link>
                  <span className="text-slate-400">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    style={{ width: `${Math.max(6, (item.value / maxSectionValue) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.map((c: (typeof cards)[number]) => (
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
