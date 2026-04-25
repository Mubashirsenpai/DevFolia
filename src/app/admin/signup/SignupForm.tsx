"use client";

import { useActionState, useState } from "react";
import { signupAction } from "../auth-actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);
  const [usernameHint, setUsernameHint] = useState("");
  const [checking, setChecking] = useState(false);

  async function checkUsername(value: string) {
    const raw = value.trim();
    if (!raw) {
      setUsernameHint("");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        `/api/username-availability?username=${encodeURIComponent(raw)}`,
      );
      const data = (await res.json()) as {
        available: boolean;
        normalized: string;
        reason?: string;
      };
      if (!data.available) {
        setUsernameHint(data.reason ?? "Username is not available.");
      } else if (data.normalized !== raw.toLowerCase()) {
        setUsernameHint(`Will be saved as: ${data.normalized}`);
      } else {
        setUsernameHint("Username is available.");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
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
      </div>
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-300"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          onBlur={(e) => void checkUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-500/40 focus:ring-2"
        />
        {(checking || usernameHint) && (
          <p className="mt-1 text-xs text-slate-400">
            {checking ? "Checking username..." : usernameHint}
          </p>
        )}
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
          minLength={8}
          autoComplete="new-password"
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
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
