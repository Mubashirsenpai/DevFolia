type Point = { day: string; count: number };

/**
 * 14-day view counts: fluid columns on narrow screens (no forced min-width),
 * every other date label hidden below `sm` to reduce overlap.
 */
export function AdminViewsBarChart({
  series,
  maxCount,
  barMaxHeight = 120,
}: {
  series: Point[];
  maxCount: number;
  barMaxHeight?: number;
}) {
  return (
    <div className="mt-4 w-full min-w-0 max-w-full">
      <div
        className="grid w-full min-w-0 items-end gap-1 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
        }}
      >
        {series.map((point, i) => (
          <div key={point.day} className="flex min-w-0 flex-col items-center gap-1 sm:gap-2">
            <div
              className="w-full max-w-full min-h-[6px] rounded-t bg-emerald-500/80"
              style={{
                height: `${Math.max(8, (point.count / maxCount) * barMaxHeight)}px`,
              }}
              title={`${point.day}: ${point.count} views`}
            />
            <span
              className={`whitespace-nowrap text-center text-[8px] text-slate-500 sm:text-[10px] ${
                i % 2 !== 0 ? "hidden sm:block" : ""
              }`}
            >
              {point.day.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
