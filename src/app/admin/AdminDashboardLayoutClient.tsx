"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";

export function AdminDashboardLayoutClient({
  children,
  showSuperAdmin,
}: {
  children: React.ReactNode;
  showSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-900 text-slate-100 lg:min-h-screen lg:flex-row">
      {/* Click-out overlay (below sidebar, above content) */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-[104] bg-black/65 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="admin-dashboard-nav"
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-[105] flex h-[100dvh] max-h-[100dvh] w-[min(18rem,calc(100vw-40px))] flex-col border-r border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:relative lg:inset-auto lg:z-auto lg:max-h-none lg:min-h-[100svh] lg:w-56 lg:max-w-none lg:shrink-0 lg:bg-slate-950/80 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <AdminNav
          showSuperAdmin={showSuperAdmin}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col lg:min-h-screen">
        <header className="sticky top-0 z-[110] flex shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-3 py-2.5 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
              DevFolia
            </p>
            <p className="truncate text-sm font-medium text-white">Admin dashboard</p>
          </div>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="admin-dashboard-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2 text-sm font-semibold text-emerald-200 shadow-sm active:bg-emerald-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              className="h-5 w-5 shrink-0"
              aria-hidden
            >
              {mobileOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
            <span>{mobileOpen ? "Close" : "Menu"}</span>
          </button>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
