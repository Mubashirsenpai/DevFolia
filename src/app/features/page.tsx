import Link from "next/link";

const features = [
  "Personalized public portfolio page",
  "Image and CV uploads with secure management",
  "Projects, skills, experience, education, awards, leadership",
  "Social/contact links and share-ready profile URL",
  "Visual theme customization for brand identity",
  "Analytics insights for profile performance",
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
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          What users can do on DevFolia
        </h1>
        <p className="mt-5 text-slate-300">
          DevFolia gives users everything they need to build a strong online profile
          from one dashboard.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {features.map((feature, idx) => (
            <li
              key={feature}
              className="glass-card rounded-xl px-4 py-4 text-sm text-slate-200"
            >
              <span className="mr-2 text-emerald-300">0{idx + 1}.</span>
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
        DevFolia © {new Date().getFullYear()} ·{" "}
        <Link href="/contact" className="hover:text-emerald-300">
          Contact us
        </Link>
      </footer>
    </div>
  );
}
