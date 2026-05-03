import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-950 px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          DevFolia
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Reset password</h1>
        {!token ? (
          <p className="mt-3 text-sm text-red-400">
            Reset token is missing or invalid. Request a new link.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-400">
              Enter your new password to regain access.
            </p>
            <ResetPasswordForm token={token} />
          </>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/admin/login" className="text-emerald-400 hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
