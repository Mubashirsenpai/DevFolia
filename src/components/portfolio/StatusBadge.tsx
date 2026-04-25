export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED: {
      label: "Completed",
      className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    },
    IN_PROGRESS: {
      label: "In progress",
      className: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
    },
    JUST_STARTED: {
      label: "Just started",
      className: "bg-sky-500/15 text-sky-200 ring-sky-500/30",
    },
  };
  const m = map[status] ?? map.JUST_STARTED;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${m.className}`}
    >
      {m.label}
    </span>
  );
}
