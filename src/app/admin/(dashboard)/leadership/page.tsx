import { prisma } from "@/lib/prisma";
import {
  createLeadership,
  deleteLeadership,
  updateLeadership,
} from "@/app/admin/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { requireSession } from "@/lib/auth";

export default async function AdminLeadershipPage({
  searchParams,
}: {
  searchParams: Promise<{ planLimit?: string; cap?: string }>;
}) {
  const session = await requireSession();
  const { planLimit, cap } = await searchParams;
  const items = await prisma.leadership.findMany({
    where: { userId: session.sub },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Leadership</h1>
        <p className="mt-1 text-sm text-slate-400">
          Clubs, student government, volunteering, team lead roles, etc.
        </p>
      </div>

      {planLimit && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          You have reached your plan limit for leadership entries
          {cap ? ` (${cap} max).` : "."} Upgrade to add more.
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-300">Add role</h2>
        <form action={createLeadership} className="mt-4 grid gap-4">
          <input
            name="role"
            placeholder="Role title"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="organization"
            placeholder="Organization"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="period"
            placeholder="Time period"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="What you led or contributed"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <ImageUploadField fieldName="imageUrl" label="Photo / logo (optional)" />
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
            Add leadership entry
          </button>
        </form>
      </section>

      <ul className="space-y-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <form
              action={updateLeadership.bind(null, item.id)}
              className="space-y-4"
            >
              <div className="flex justify-end">
                <button
                  type="submit"
                  formAction={deleteLeadership.bind(null, item.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <input
                name="role"
                defaultValue={item.role}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="organization"
                defaultValue={item.organization}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="period"
                defaultValue={item.period}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <textarea
                name="description"
                rows={3}
                defaultValue={item.description}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <ImageUploadField
                fieldName="imageUrl"
                label="Image"
                initialUrl={item.imageUrl}
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={item.sortOrder}
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
