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

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950/80">
      <div className="border-b border-slate-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Admin
        </p>
        <p className="mt-1 text-sm text-slate-400">Content manager</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
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
      <div className="border-t border-slate-800 p-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Log out
          </button>
        </form>
        <Link
          href="/"
          className="mt-1 block rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-emerald-400"
        >
          View site →
        </Link>
      </div>
    </aside>
  );
}
