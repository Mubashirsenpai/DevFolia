import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
        >
          ← Back to Home
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
          About
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">What is DevFolia?</h1>
        <p className="mt-5 text-slate-300">
          DevFolia is an independent web app where users create and manage their own
          portfolio profile, then share a unique public link with recruiters,
          clients, and collaborators.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-lg font-semibold text-white">Creator-first</p>
            <p className="mt-2 text-sm text-slate-400">
              Easy onboarding and a focused dashboard for quick profile updates.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-lg font-semibold text-white">Share-ready</p>
            <p className="mt-2 text-sm text-slate-400">
              Every user gets a public route like <code>/username</code>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <Link
            href="/features"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
          >
            Explore features
          </Link>
          <Link
            href="/admin/signup"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Create account
          </Link>
        </div>
      </main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-slate-500">
        DevFolia © {new Date().getFullYear()} · Build your public brand
      </footer>
    </div>
  );
}
