import { prisma } from "@/lib/prisma";
import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "@/app/admin/actions";
import { requireSession } from "@/lib/auth";

export default async function AdminExperiencePage() {
  const session = await requireSession();
  const rows = await prisma.experience.findMany({
    where: { userId: session.sub },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Experience</h1>
        <p className="mt-1 text-sm text-slate-400">
          Jobs, internships, freelance — mirrors a résumé experience section.
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-300">Add experience</h2>
        <form action={createExperience} className="mt-4 grid gap-4">
          <input
            name="title"
            placeholder="Job title"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="company"
            placeholder="Company"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="location"
            placeholder="Location (optional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="period"
            placeholder="e.g. Jan 2023 – Present"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <textarea
            name="description"
            rows={4}
            placeholder="Bullets or summary (one per line is fine)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <button
            type="submit"
            className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Add
          </button>
        </form>
      </section>

      <ul className="space-y-6">
        {rows.map((x) => (
          <li
            key={x.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <form action={updateExperience.bind(null, x.id)} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  formAction={deleteExperience.bind(null, x.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <input
                name="title"
                defaultValue={x.title}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="company"
                defaultValue={x.company}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="location"
                defaultValue={x.location ?? ""}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="period"
                defaultValue={x.period}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <textarea
                name="description"
                rows={4}
                defaultValue={x.description}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={x.sortOrder}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
