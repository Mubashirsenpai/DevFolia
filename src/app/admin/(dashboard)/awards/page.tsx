import { prisma } from "@/lib/prisma";
import { createAward, deleteAward, updateAward } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { requireSession } from "@/lib/auth";

export default async function AdminAwardsPage({
  searchParams,
}: {
  searchParams: Promise<{ planLimit?: string; cap?: string }>;
}) {
  const session = await requireSession();
  const { planLimit, cap } = await searchParams;
  const awards = await prisma.award.findMany({
    where: { userId: session.sub },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Awards</h1>
        <p className="mt-1 text-sm text-slate-400">
          Certificates, competitions, honors — optional image per entry.
        </p>
      </div>

      {planLimit && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          You have reached your plan limit for awards
          {cap ? ` (${cap} max).` : "."} Upgrade to add more.
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-300">Add award</h2>
        <form action={createAward} className="mt-4 grid gap-4">
          <input
            name="title"
            placeholder="Title"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="issuer"
            placeholder="Issuer / organization"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            name="year"
            placeholder="Year or date"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Details"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <ImageUploadField fieldName="imageUrl" label="Image (optional)" />
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
            Add award
          </button>
        </form>
      </section>

      <ul className="space-y-6">
        {awards.map((a) => (
          <li
            key={a.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <form action={updateAward.bind(null, a.id)} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  formAction={deleteAward.bind(null, a.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <input
                name="title"
                defaultValue={a.title}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="issuer"
                defaultValue={a.issuer}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                name="year"
                defaultValue={a.year}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <textarea
                name="description"
                rows={3}
                defaultValue={a.description}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <ImageUploadField
                fieldName="imageUrl"
                label="Image"
                initialUrl={a.imageUrl}
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={a.sortOrder}
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
