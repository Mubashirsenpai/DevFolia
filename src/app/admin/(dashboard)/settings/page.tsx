import { updateAccountSettings, verifyCustomDomain } from "@/app/admin/actions";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const session = await requireSession();
  const [user, profile, domainVerification] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub } }),
    prisma.profile.findUnique({ where: { userId: session.sub } }),
    prisma.domainVerification.findUnique({ where: { userId: session.sub } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Subscription, theme, domain, and account preferences.
        </p>
      </div>

      <form
        action={updateAccountSettings}
        className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/50 p-6"
      >
        <label className="block">
          <span className="text-sm text-slate-300">Plan</span>
          <select
            name="plan"
            defaultValue={user?.plan ?? "FREE"}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="BUSINESS">Business</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Billing email</span>
          <input
            name="billingEmail"
            type="email"
            defaultValue={user?.billingEmail ?? user?.email ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Portfolio theme</span>
          <select
            name="theme"
            defaultValue={profile?.theme ?? "midnight"}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="midnight">Midnight</option>
            <option value="emerald">Emerald</option>
            <option value="sunset">Sunset</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Custom domain</span>
          <input
            name="customDomain"
            defaultValue={profile?.customDomain ?? ""}
            placeholder="portfolio.yourdomain.com"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>

        <div className="rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
          Stripe checkout and billing portal are now wired. Add Stripe env vars to
          enable live billing flows.
        </div>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Save settings
        </button>
      </form>

      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-white">Billing</h2>
        <p className="text-sm text-slate-400">
          Current plan: <span className="text-emerald-300">{user?.plan ?? "FREE"}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <form action="/api/billing/checkout" method="post">
            <input type="hidden" name="plan" value="PRO" />
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/50"
            >
              Upgrade to Pro
            </button>
          </form>
          <form action="/api/billing/checkout" method="post">
            <input type="hidden" name="plan" value="BUSINESS" />
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/50"
            >
              Upgrade to Business
            </button>
          </form>
          <form action="/api/billing/portal" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/50"
            >
              Manage billing portal
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-lg font-semibold text-white">Custom domain verification</h2>
        {domainVerification ? (
          <>
            <p className="text-sm text-slate-300">
              Domain: <span className="text-emerald-300">{domainVerification.domain}</span>
            </p>
            <p className="text-sm text-slate-400">
              Status: {domainVerification.status}
            </p>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-300">
              Add TXT record:
              <div className="mt-1 font-mono text-emerald-300">
                devfolia-verify={domainVerification.token}
              </div>
            </div>
            <form action={verifyCustomDomain}>
              <button
                type="submit"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/50"
              >
                Check verification
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Add a custom domain in settings above, save, then verify it here.
          </p>
        )}
      </div>
    </div>
  );
}
