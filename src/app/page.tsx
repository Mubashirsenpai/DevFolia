import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-emerald-400">
            DEVFOLIA
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
            <Link href="/about" className="hover:text-emerald-300">About</Link>
            <Link href="/features" className="hover:text-emerald-300">Features</Link>
            <Link href="/pricing" className="hover:text-emerald-300">Pricing</Link>
            <Link href="/admin/login" className="hover:text-emerald-300">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            DevFolia
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Build your personal brand with a professional portfolio page.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            DevFolia lets anyone create a modern public profile, manage content
            from a private dashboard, and share one clean link for projects,
            experience, skills, awards, and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin/signup"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
            >
              View plans
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Already have a profile? Open it at <code>/yourusername</code>
          </p>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          <Link href="/about" className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-emerald-500/40">
            <p className="text-lg font-semibold text-white">About DevFolia</p>
            <p className="mt-2 text-sm text-slate-400">What the platform is and why it exists.</p>
          </Link>
          <Link href="/features" className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-emerald-500/40">
            <p className="text-lg font-semibold text-white">What you can do</p>
            <p className="mt-2 text-sm text-slate-400">Manage content, customize pages, and share your profile.</p>
          </Link>
          <Link href="/pricing" className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-emerald-500/40">
            <p className="text-lg font-semibold text-white">Subscription plans</p>
            <p className="mt-2 text-sm text-slate-400">Choose Free, Pro, or Business based on your goals.</p>
          </Link>
        </section>
      </main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-slate-500">
        DevFolia © {new Date().getFullYear()} · Build your public brand
      </footer>
    </div>
  );
}
