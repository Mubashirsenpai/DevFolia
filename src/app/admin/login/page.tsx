import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reset?: string }>;
}) {
  const { from, reset } = await searchParams;
  const session = await getCurrentSession();
  if (session) redirect(from && from.startsWith("/") ? from : "/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          DevFolia
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Access your DevFolia dashboard.
        </p>
        {reset === "success" ? (
          <p className="mt-3 rounded-md border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">
            Password updated successfully. Sign in with your new password.
          </p>
        ) : null}
        <LoginForm redirectTo={from && from.startsWith("/") ? from : "/admin"} />
        <p className="mt-4 text-center text-sm text-slate-400">
          New here?{" "}
          <Link href="/admin/signup" className="text-emerald-400 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/" className="text-emerald-400 hover:underline">
            ← Back to DevFolia
          </Link>
        </p>
      </div>
    </div>
  );
}
