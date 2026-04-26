import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { PLAN_LABELS, normalizePlan } from "@/lib/paystack";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; status?: string }>;
}) {
  const session = await getCurrentSession();
  const { plan, status } = await searchParams;
  const normalized = normalizePlan(plan ?? "PRO");

  if (!session) {
    redirect(`/admin/login?from=${encodeURIComponent(`/billing?plan=${normalized}`)}`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/#plans"
        className="inline-flex rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
      >
        ← Back to plans
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-white">Billing</h1>
      <p className="mt-2 text-slate-400">
        Complete your payment securely with Paystack.
      </p>

      {status && (
        <p className="mt-4 rounded-lg border border-emerald-700/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          Status: {status}
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-sm text-slate-400">Selected plan</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {PLAN_LABELS[normalized]}
        </p>
        <form action="/api/paystack/initialize" method="post" className="mt-6">
          <input type="hidden" name="plan" value={normalized} />
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Continue to Paystack
          </button>
        </form>
      </div>
    </main>
  );
}
