import { prisma } from "@/lib/prisma";
import { createSkill, deleteSkill, updateSkill } from "@/app/admin/actions";
import { requireSession } from "@/lib/auth";

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ planLimit?: string; cap?: string }>;
}) {
  const session = await requireSession();
  const { planLimit, cap } = await searchParams;
  const skills = await prisma.skill.findMany({
    where: { userId: session.sub },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Skills</h1>
        <p className="mt-1 text-sm text-slate-400">
          Group by language or stack (e.g. Python, Java). Level is 0–100 for the
          progress bar on your public page.
        </p>
      </div>

      {planLimit && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          You have reached your plan limit for skills
          {cap ? ` (${cap} max).` : "."} Upgrade to add more.
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-300">Add skill</h2>
        <form action={createSkill} className="mt-4 grid gap-4">
          <input
            name="name"
            placeholder="Skill name (e.g. Python)"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <input
            name="category"
            placeholder="Category / type (e.g. Backend, JVM)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <label className="text-sm text-slate-300">
            Level (0–100)
            <input
              name="level"
              type="number"
              min={0}
              max={100}
              defaultValue={70}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </label>
          <textarea
            name="exampleNote"
            placeholder="Example: APIs with FastAPI, asyncio, typing…"
            rows={2}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
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
            Add skill
          </button>
        </form>
      </section>

      <ul className="space-y-6">
        {skills.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <form action={updateSkill.bind(null, s.id)} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  formAction={deleteSkill.bind(null, s.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <input
                name="name"
                defaultValue={s.name}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="category"
                defaultValue={s.category}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <label className="block text-sm text-slate-300">
                Level (0–100)
                <input
                  name="level"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={s.level}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <textarea
                name="exampleNote"
                rows={2}
                defaultValue={s.exampleNote}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={s.sortOrder}
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
