import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/admin/actions";
import { requireSession } from "@/lib/auth";
import { ensureProfile } from "@/lib/data";

export default async function AdminOnboardingPage() {
  const session = await requireSession();
  const profile = await ensureProfile(session.sub, session.username);

  if (profile.onboardingCompleted) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-800 bg-slate-950/50 p-6">
      <h1 className="text-2xl font-bold text-white">Welcome to DevFolia</h1>
      <p className="mt-1 text-sm text-slate-400">
        Complete your public profile basics. You can update everything later.
      </p>
      <form action={completeOnboarding} className="mt-6 grid gap-4">
        <label className="block">
          <span className="text-sm text-slate-300">Display name</span>
          <input
            name="displayName"
            defaultValue={profile.displayName}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Headline</span>
          <input
            name="headline"
            defaultValue={profile.headline}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Bio</span>
          <textarea
            name="bio"
            rows={5}
            defaultValue={profile.bio}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Continue to dashboard
        </button>
      </form>
    </div>
  );
}
