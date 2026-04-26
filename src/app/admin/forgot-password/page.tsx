import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          DevFolia
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your account email to receive a reset link.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/admin/login" className="text-emerald-400 hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
