"use client";

import { useActionState, useState } from "react";
import { signupAction } from "../auth-actions";

function normalizeApiBase(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function SignupForm() {
  const remoteBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL ?? "");
  const [state, formAction, serverPending] = useActionState(signupAction, undefined);
  const [usernameHint, setUsernameHint] = useState("");
  const [checking, setChecking] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [remotePending, setRemotePending] = useState(false);

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
      let data: {
        available: boolean;
        normalized: string;
        reason?: string;
      };
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setUsernameHint("Could not check username (server error).");
        return;
      }
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

  async function handleRemoteSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRemoteError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim() ?? "";
    const username = (form.elements.namedItem("username") as HTMLInputElement)?.value ?? "";
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";
    const confirmPassword =
      (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value ?? "";
    if (!email || !email.includes("@")) {
      setRemoteError("Enter a valid email.");
      return;
    }
    if (username.trim().length < 3) {
      setRemoteError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 8) {
      setRemoteError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setRemoteError("Passwords do not match.");
      return;
    }
    setRemotePending(true);
    try {
      const res = await fetch(`${remoteBase}/auth/signup`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          username: username.trim(),
          password,
        }),
      });
      const body = (await res.json()) as { error?: string; token?: string };
      if (!res.ok) {
        setRemoteError(body.error ?? "Could not create account.");
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
      window.location.assign("/admin/onboarding");
    } finally {
      setRemotePending(false);
    }
  }

  if (!remoteBase) {
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
            onBlur={(ev) => void checkUsername(ev.target.value)}
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
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-300"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
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
          disabled={serverPending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {serverPending ? "Creating account…" : "Create account"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => void handleRemoteSignup(e)} className="mt-8 space-y-4">
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
          onBlur={(ev) => void checkUsername(ev.target.value)}
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
      <div>
        <label
          htmlFor="confirmPassword-remote"
          className="block text-sm font-medium text-slate-300"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword-remote"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        {remotePending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Remote signup uses <span className="font-mono text-slate-400">NEXT_PUBLIC_API_URL</span> (
        {remoteBase}).
      </p>
    </form>
  );
}
