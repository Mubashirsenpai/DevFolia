import Link from "next/link";
import { ContactForm } from "@/components/marketing/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
        >
          ← Back to Home
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Contact us</h1>
        <p className="mt-4 text-slate-300">
          Questions about DevFolia, subscriptions, or custom setup? Reach out and
          we will get back to you.
        </p>
        <ContactForm recipientEmail="bawamubashir1974@gmail.com" />
      </main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-slate-500">
        DevFolia © {new Date().getFullYear()} ·{" "}
        <Link href="/contact" className="hover:text-emerald-300">
          Contact us
        </Link>
      </footer>
    </div>
  );
}
