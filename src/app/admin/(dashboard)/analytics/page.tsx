import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const [user, views] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub } }),
    prisma.dailyProfileView.findMany({
      where: { userId: session.sub },
      orderBy: { day: "asc" },
      take: 120,
    }),
  ]);

  const last14 = getLastDays(14);
  const viewMap = new Map(views.map((v) => [v.day, v.count]));
  const series = last14.map((day) => ({ day, count: viewMap.get(day) ?? 0 }));
  const maxCount = Math.max(1, ...series.map((s) => s.count));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Traffic and public profile performance.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <p className="text-sm text-slate-300">
          Public profile:{" "}
          <Link href={`/${session.username}`} className="text-emerald-300 hover:underline">
            /{session.username}
          </Link>
        </p>
        <p className="mt-2 text-3xl font-bold text-white">
          {user?.publicViews ?? 0}
        </p>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Total profile views
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-white">Last 14 days</h2>
        <div
          className="mt-4 grid items-end gap-2"
          style={{ gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))` }}
        >
          {series.map((point) => (
            <div key={point.day} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-emerald-500/80"
                style={{ height: `${Math.max(6, (point.count / maxCount) * 120)}px` }}
                title={`${point.day}: ${point.count} views`}
              />
              <span className="text-[10px] text-slate-500">
                {point.day.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
