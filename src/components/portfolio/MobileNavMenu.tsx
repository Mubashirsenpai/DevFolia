"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Resume", href: "#resume" },
  { label: "Awards", href: "#awards" },
  { label: "Leadership", href: "#leadership" },
];

export function MobileNavMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnResize() {
      if (window.innerWidth >= 640) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        className="inline-flex min-h-11 items-center rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300"
      >
        Menu
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-[min(70vh,24rem)] w-[min(16rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-xl border border-[var(--border)] bg-slate-950/95 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur">
          <nav className="flex flex-col py-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center px-4 py-3 text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
