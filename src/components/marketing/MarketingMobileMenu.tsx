"use client";

import Link from "next/link";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#what-we-do", label: "What we do" },
  { href: "/#plans", label: "Plans" },
  { href: "/contact", label: "Contact" },
  { href: "/admin/login", label: "Sign in" },
];

export function MarketingMobileMenu() {
  return (
    <details className="relative sm:hidden">
      <summary className="inline-flex h-10 w-10 list-none items-center justify-center rounded-lg border border-slate-700 text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </summary>
      <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-800 bg-slate-950/95 p-1 shadow-xl backdrop-blur">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-emerald-300"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
