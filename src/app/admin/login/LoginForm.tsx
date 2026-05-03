"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "../auth-actions";

function normalizeApiBase(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function LoginForm({ redirectTo = "/admin" }: { redirectTo?: string }) {
  const remoteBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL ?? "");
  const [state, formAction, serverPending] = useActionState(loginAction, undefined);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [remotePending, setRemotePending] = useState(false);

  if (!remoteBase) {
    return (
      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/40 focus:ring-2"
          />
          <div className="mt-2 text-right">
            <Link
              href="/admin/forgot-password"
              className="text-xs text-emerald-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/40 focus:ring-2"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={serverPending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {serverPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    );
  }

  async function handleRemoteLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRemoteError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";
    setRemotePending(true);
    try {
      const res = await fetch(`${remoteBase}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email?.toLowerCase(), password }),
      });
      const body = (await res.json()) as { error?: string; token?: string };
      if (!res.ok) {
        setRemoteError(body.error ?? "Could not sign in.");
        return;
      }
      if (!body.token) {
        setRemoteError("Invalid response from auth service.");
        return;
      }
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: body.token }),
      });
      if (!sessionRes.ok) {
        const err = (await sessionRes.json()) as { error?: string };
        setRemoteError(err.error ?? "Could not start session.");
        return;
      }
      const safeRedirect =
        redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/admin";
      window.location.assign(safeRedirect);
    } finally {
      setRemotePending(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleRemoteLogin(e)} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/40 focus:ring-2"
        />
        <div className="mt-2 text-right">
          <Link
            href="/admin/forgot-password"
            className="text-xs text-emerald-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/40 focus:ring-2"
        />
      </div>
      {remoteError && (
        <p className="text-sm text-red-400" role="alert">
          {remoteError}
        </p>
      )}
      <button
        type="submit"
        disabled={remotePending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {remotePending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Using remote API at <span className="text-slate-400">{remoteBase}</span>. Set{" "}
        <span className="font-mono text-slate-400">NEXT_PUBLIC_API_URL</span> on Vercel to match your
        Render backend.
      </p>
    </form>
  );
}
