import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdminSession } from "@/lib/super-admin";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export default async function SuperAdminPage() {
  const session = await requireSession();
  const allowed = await isSuperAdminSession(session);
  if (!allowed) redirect("/admin");

  const [totalUsers, publishedProfiles, activeSubscribers, recentSignups, recentEvents, eventStats] =
    await Promise.all([
      prisma.user.count(),
      prisma.profile.count({ where: { onboardingCompleted: true } }),
      prisma.user.count({ where: { plan: { in: ["PRO", "BUSINESS"] } } }),
      prisma.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.platformEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.platformEvent.groupBy({
        by: ["type"],
        where: { createdAt: { gte: daysAgo(7) } },
        _count: { _all: true },
        orderBy: { _count: { type: "desc" } },
      }),
    ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Platform-wide health, growth, and product activity.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total users</p>
          <p className="mt-2 text-2xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Published profiles</p>
          <p className="mt-2 text-2xl font-bold text-white">{publishedProfiles}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Paid subscribers</p>
          <p className="mt-2 text-2xl font-bold text-white">{activeSubscribers}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">New users (7d)</p>
          <p className="mt-2 text-2xl font-bold text-white">{recentSignups}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-white">Event activity (last 7 days)</h2>
        {eventStats.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No tracked events yet.</p>
        ) : (
          <ul className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2">
            {eventStats.map((evt: (typeof eventStats)[number]) => (
              <li
                key={evt.type}
                className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-slate-300" title={evt.type}>
                  {evt.type}
                </span>
                <span className="font-semibold text-emerald-300">{evt._count._all}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-white">Recent events</h2>
        {recentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No events logged yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentEvents.map((evt: (typeof recentEvents)[number]) => (
              <li key={evt.id} className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                <p className="text-sm text-slate-200">{evt.type}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {evt.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
