import { prisma } from "@/lib/prisma";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/admin/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { PROJECT_STATUSES } from "@/lib/types";
import { requireSession } from "@/lib/auth";

function statusLabel(s: string) {
  switch (s) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In progress";
    default:
      return "Just started";
  }
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ planLimit?: string; cap?: string }>;
}) {
  const session = await requireSession();
  const { planLimit, cap } = await searchParams;
  const projects = await prisma.project.findMany({
    where: { userId: session.sub },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="mt-1 text-sm text-slate-400">
          Set status, optional cover image, and links. Lower sort order appears
          first.
        </p>
      </div>

      {planLimit && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          You have reached your plan limit for projects
          {cap ? ` (${cap} max).` : "."} Upgrade to add more.
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-300">Add project</h2>
        <form action={createProject} className="mt-4 grid gap-4">
          <input
            name="title"
            placeholder="Title"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <label className="block text-sm text-slate-300">
            Status
            <select
              name="status"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {PROJECT_STATUSES.map((s: (typeof PROJECT_STATUSES)[number]) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <ImageUploadField fieldName="imageUrl" label="Project image (optional)" />
          <input
            name="demoUrl"
            placeholder="Live demo URL"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <input
            name="repoUrl"
            placeholder="Repository URL"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <input
            name="sortOrder"
            type="number"
            placeholder="Sort order (e.g. 0)"
            defaultValue={0}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
          />
          <button
            type="submit"
            className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Create project
          </button>
        </form>
      </section>

      <ul className="space-y-8">
        {projects.map((p: (typeof projects)[number]) => (
          <li
            key={p.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <form action={updateProject.bind(null, p.id)} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-slate-500">
                  Edit project
                </span>
                <button
                  type="submit"
                  formAction={deleteProject.bind(null, p.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <input
                name="title"
                defaultValue={p.title}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
              />
              <textarea
                name="description"
                rows={3}
                defaultValue={p.description}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
              />
              <label className="block text-sm text-slate-300">
                Status
                <select
                  name="status"
                  defaultValue={p.status}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {PROJECT_STATUSES.map((s: (typeof PROJECT_STATUSES)[number]) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <ImageUploadField
                fieldName="imageUrl"
                label="Project image"
                initialUrl={p.imageUrl}
              />
              <input
                name="demoUrl"
                defaultValue={p.demoUrl ?? ""}
                placeholder="Demo URL"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
              />
              <input
                name="repoUrl"
                defaultValue={p.repoUrl ?? ""}
                placeholder="Repo URL"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={p.sortOrder}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/30 focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Save changes
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
