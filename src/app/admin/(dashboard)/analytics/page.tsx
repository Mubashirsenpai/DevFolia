import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { backendApiGet } from "@/lib/backend-api";
import { AdminViewsBarChart } from "@/components/admin/AdminViewsBarChart";

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

export default async function AdminAnalyticsPage() {
  const session = await requireSession();
  const backend = await backendApiGet<{
    ok: boolean;
    data: {
      publicViews: number;
      series14: Array<{ day: string; count: number }>;
    };
  }>("/analytics/overview");
  const [user, views] = backend
    ? [{ publicViews: backend.data.publicViews }, backend.data.series14]
    : await Promise.all([
        prisma.user.findUnique({ where: { id: session.sub } }),
        prisma.dailyProfileView.findMany({
          where: { userId: session.sub },
          orderBy: { day: "asc" },
          take: 120,
        }),
      ]);

  const last14 = getLastDays(14);
  const viewMap = new Map<string, number>(
    views.map((v: { day: string; count: number }) => [v.day, v.count]),
  );
  const series = last14.map((day: string) => ({ day, count: viewMap.get(day) ?? 0 }));
  const maxCount = Math.max(1, ...series.map((s: (typeof series)[number]) => s.count));

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Traffic and public profile performance.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <p className="text-sm text-slate-300">
          Public profile:{" "}
          <Link
            href={`/${session.username}`}
            className="break-all text-emerald-300 hover:underline sm:break-normal"
          >
            /{session.username}
          </Link>
        </p>
        <p className="mt-2 break-all text-3xl font-bold text-white tabular-nums">
          {user?.publicViews ?? 0}
        </p>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Total profile views
        </p>
      </div>

      <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">Last 14 days</h2>
        <AdminViewsBarChart series={series} maxCount={maxCount} barMaxHeight={120} />
      </div>
    </div>
  );
}
