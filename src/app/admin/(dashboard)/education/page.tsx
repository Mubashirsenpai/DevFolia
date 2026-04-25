import { prisma } from "@/lib/prisma";
import {
  createEducation,
  deleteEducation,
  updateEducation,
} from "@/app/admin/actions";
import { requireSession } from "@/lib/auth";

export default async function AdminEducationPage() {
  const session = await requireSession();
  const rows = await prisma.education.findMany({
    where: { userId: session.sub },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Education</h1>
        <p className="mt-1 text-sm text-slate-400">
          Degrees, programs, and relevant coursework notes.
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-300">Add education</h2>
        <form action={createEducation} className="mt-4 grid gap-4">
          <input
            name="school"
            placeholder="School / university"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="degree"
            placeholder="Degree or program"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="period"
            placeholder="Years"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <textarea
            name="details"
            rows={3}
            placeholder="GPA, honors, focus areas…"
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
        {rows.map((e) => (
          <li
            key={e.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <form action={updateEducation.bind(null, e.id)} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  formAction={deleteEducation.bind(null, e.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <input
                name="school"
                defaultValue={e.school}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="degree"
                defaultValue={e.degree}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="period"
                defaultValue={e.period}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <textarea
                name="details"
                rows={3}
                defaultValue={e.details}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={e.sortOrder}
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
