import Link from "next/link";

const features = [
  "Create a personalized public portfolio page",
  "Upload profile image, CV, project and award images",
  "Manage projects, skills, experience, education, awards, leadership",
  "Add social and contact links",
  "Choose visual themes for your public page",
  "Track profile views in analytics",
];

export default function FeaturesPage() {
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
          Features
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">
          What users can do on DevFolia
        </h1>
        <p className="mt-5 text-slate-300">
          DevFolia gives users everything they need to build a strong online profile
          from one dashboard.
        </p>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
            >
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex gap-3">
          <Link
            href="/pricing"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
          >
            See pricing
          </Link>
          <Link
            href="/admin/signup"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Start now
          </Link>
        </div>
      </main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-slate-500">
        DevFolia © {new Date().getFullYear()} · Build your public brand
      </footer>
    </div>
  );
}
