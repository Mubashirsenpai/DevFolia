import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    points: ["Public profile link", "Core dashboard sections", "Basic theme options"],
  },
  {
    name: "Pro",
    price: "$12/mo",
    points: ["Everything in Free", "Advanced customization", "Priority support"],
  },
  {
    name: "Business",
    price: "$29/mo",
    points: ["Everything in Pro", "Custom domain support", "Enhanced analytics"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
        >
          ← Back to Home
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Pricing
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Simple subscription plans</h1>
        <p className="mt-5 max-w-2xl text-slate-300">
          Choose a plan based on your portfolio goals. Upgrade anytime from dashboard
          settings.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card rounded-2xl p-6 transition hover:-translate-y-0.5 ${
                plan.name === "Pro" ? "border-emerald-500/40 shadow-[0_12px_35px_rgba(52,211,153,0.12)]" : ""
              }`}
            >
              <p className="text-lg font-semibold text-white">{plan.name}</p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">{plan.price}</p>
              {plan.name === "Pro" && (
                <p className="mt-2 inline-flex rounded-full border border-emerald-500/40 px-2 py-0.5 text-[11px] text-emerald-300">
                  Most popular
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {plan.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Link
          href="/admin/signup"
          className="mt-10 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Get started
        </Link>
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
