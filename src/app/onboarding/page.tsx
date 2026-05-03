import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

/** Helpful landing when `/onboarding` is opened instead of `/admin/onboarding`. */
export default async function PublisherOnboardingPage() {
  const session = await getCurrentSession();
  if (session) redirect("/admin/onboarding");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">DevFolia</p>
      <h1 className="mt-3 text-2xl font-bold text-white">Publisher onboarding</h1>
      <p className="mt-3 text-sm text-slate-400">
        Portfolio publish and setup lives in your admin dashboard, not at this URL.
      </p>
      <Link
        href={`/admin/login?from=${encodeURIComponent("/admin/onboarding")}`}
        className="mt-8 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
      >
        Sign in to onboarding
      </Link>
      <Link
        href="/admin/signup"
        className="mt-4 text-sm text-slate-500 hover:text-emerald-300"
      >
        Create an account →
      </Link>
    </main>
  );
}
