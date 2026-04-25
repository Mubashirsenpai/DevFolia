import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

export default async function AdminSignupPage() {
  const session = await getCurrentSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          DevFolia
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Build your own shareable portfolio page.
        </p>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
