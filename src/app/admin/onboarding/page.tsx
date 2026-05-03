import { completeOnboarding } from "@/app/admin/actions";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ensureProfile, getPrivatePortfolioDataForUser } from "@/lib/data";
import { PublicPortfolioPage } from "@/components/portfolio/PublicPortfolioPage";
import { OnboardingPortfolioPreview } from "@/components/onboarding/OnboardingPortfolioPreview";

export default async function AdminOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await requireSession();
  const profile = await ensureProfile(session.sub, session.username);
  const previewData = await getPrivatePortfolioDataForUser(session.sub);
  const [projects, skills, experience, education] = await Promise.all([
    prisma.project.count({ where: { userId: session.sub } }),
    prisma.skill.count({ where: { userId: session.sub } }),
    prisma.experience.count({ where: { userId: session.sub } }),
    prisma.education.count({ where: { userId: session.sub } }),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-white">Publish portfolio</h1>
      <p className="mt-1 text-sm text-slate-400">
        Use this page as your final publish step after customizing and uploading your content.
      </p>
      {error && (
        <div className="mt-4 rounded-lg border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300">
          Profile: {profile.displayName ? "Ready" : "Missing"}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300">
          Projects: {projects} item{projects === 1 ? "" : "s"}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300">
          Skills: {skills} item{skills === 1 ? "" : "s"}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300">
          Experience/Education: {experience + education} entries
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400">
        Public URL:{" "}
        <Link href={`/${session.username}`} className="text-emerald-300 hover:underline">
          /{session.username}
        </Link>
      </p>
      {previewData && (
        <OnboardingPortfolioPreview
          canPublish={!profile.onboardingCompleted}
          isPublished={profile.onboardingCompleted}
          publicPath={`/${session.username}`}
        >
          <PublicPortfolioPage data={previewData} />
        </OnboardingPortfolioPreview>
      )}
      {profile.onboardingCompleted ? (
        <div className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-200">Your portfolio is published.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/${session.username}`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
            >
              View public page
            </Link>
            <Link
              href="/admin"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Back to overview
            </Link>
          </div>
        </div>
      ) : (
        <form action={completeOnboarding} className="mt-6">
          <button
            type="submit"
            className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Publish portfolio
          </button>
        </form>
      )}
    </div>
  );
}
