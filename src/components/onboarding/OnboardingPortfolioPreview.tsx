"use client";

import { useEffect, useState } from "react";
import { completeOnboarding } from "@/app/admin/actions";

type Props = {
  children: React.ReactNode;
  canPublish: boolean;
  isPublished: boolean;
  publicPath: string;
};

export function OnboardingPortfolioPreview({
  children,
  canPublish,
  isPublished,
  publicPath,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-300"
      >
        Preview portfolio
      </button>
      {isPublished && (
        <span className="text-xs text-slate-500">
          Preview shows your current draft content. Live page: <span className="text-slate-400">{publicPath}</span>
        </span>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio preview"
        >
          <div className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-3 rounded-t-xl border border-slate-700 border-b-0 bg-slate-900/95 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Preview</p>
              <p className="text-xs text-slate-400">
                {canPublish
                  ? "This is how your public page will look after you publish."
                  : "This matches your current public page content."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canPublish && (
                <form action={completeOnboarding}>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Publish now
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
              >
                {canPublish ? "Back to onboarding" : "Close"}
              </button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto overflow-x-hidden rounded-b-xl border border-slate-700 border-t-0 bg-[var(--background,#020617)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
