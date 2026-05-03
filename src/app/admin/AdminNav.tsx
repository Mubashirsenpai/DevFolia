"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "./auth-actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/onboarding", label: "Onboarding" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/education", label: "Education" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/leadership", label: "Leadership" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({
  showSuperAdmin = false,
  onNavigate,
}: {
  showSuperAdmin?: boolean;
  /** Close mobile drawer after navigation. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navLinks = showSuperAdmin
    ? [...links, { href: "/admin/super", label: "Super Admin" }]
    : links;

  return (
    <div
      role="navigation"
      aria-label="Admin sections"
      className="flex h-full min-h-0 w-full flex-col bg-slate-950/80 lg:bg-transparent"
    >
      <div className="shrink-0 border-b border-slate-800 p-4 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          DEVFOLIA
        </p>
        <p className="mt-1 text-sm text-slate-400">Content manager</p>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2 py-2">
        {navLinks.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => onNavigate?.()}
              className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium leading-snug transition lg:min-h-10 lg:py-2 ${
                active
                  ? "bg-emerald-600/20 text-emerald-300"
                  : "text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-slate-800 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <form action={logoutAction}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white lg:min-h-10 lg:py-2"
          >
            Log out
          </button>
        </form>
        <Link
          href="/"
          onClick={() => onNavigate?.()}
          className="mt-1 flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:text-emerald-400 lg:min-h-10 lg:py-2"
        >
          View site →
        </Link>
      </div>
    </div>
  );
}
