import Link from "next/link";
import { MarketingMobileMenu } from "@/components/marketing/MarketingMobileMenu";
import { DevFoliaLogo } from "@/components/marketing/DevFoliaLogo";
import { HeroHeadlineSlideshow } from "@/components/marketing/HeroHeadlineSlideshow";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" aria-label="DevFolia home">
            <DevFoliaLogo />
          </Link>
          <MarketingMobileMenu />
          <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
            <Link href="/#about" className="hover:text-emerald-300">About</Link>
            <Link href="/#what-we-do" className="hover:text-emerald-300">What we do</Link>
            <Link href="/#plans" className="hover:text-emerald-300">Plans</Link>
            <Link href="/contact" className="hover:text-emerald-300">Contact</Link>
            <Link href="/admin/login" className="hover:text-emerald-300">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <RevealOnScroll>
          <section className="subtle-grid overflow-hidden rounded-3xl border border-slate-800/70 p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            DevFolia Platform
          </p>
          <HeroHeadlineSlideshow />
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Build a polished public profile, showcase your proof of work, and
            manage everything from one premium dashboard built for creators,
            engineers, consultants, and teams.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin/signup"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-emerald-300"
            >
              View plans
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700 px-3 py-1">No code setup</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Custom themes</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Analytics ready</span>
          </div>
          </section>
        </RevealOnScroll>

        <section className="mt-12 grid gap-6 sm:grid-cols-3 sm:items-stretch">
          <RevealOnScroll delayMs={60}>
            <a href="#about" className="glass-card flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/40">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">About DevFolia</p>
            <p className="mt-2 text-sm text-slate-400">See the mission, vision, and why this platform exists.</p>
            </a>
          </RevealOnScroll>
          <RevealOnScroll delayMs={120}>
            <a href="#what-we-do" className="glass-card flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/40">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V8m5 8V5m5 11v-6" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">What we do</p>
            <p className="mt-2 text-sm text-slate-400">Discover what users can publish, customize, and track.</p>
            </a>
          </RevealOnScroll>
          <RevealOnScroll delayMs={180}>
            <a href="#plans" className="glass-card flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/40">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7h9a3 3 0 010 6H9a3 3 0 100 6h10" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">Plans</p>
            <p className="mt-2 text-sm text-slate-400">Compare Free, Pro, and Business subscriptions.</p>
            </a>
          </RevealOnScroll>
        </section>

        <section id="about" className="mt-20 scroll-mt-24">
          <RevealOnScroll>
            <div className="glass-card subtle-grid overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="group relative overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
                  alt="Professional presenting personal brand strategy to a team"
                  className="h-64 w-full rounded-2xl object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:rotate-[0.8deg] sm:h-80"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              </div>
              <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
                About
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Built for modern personal branding
              </h2>
              <p className="mt-4 max-w-3xl text-slate-300">
                DevFolia is designed for professionals who want a premium online
                presence without spending weeks building from scratch. It helps users
                present credibility, achievements, and identity in a clean and
                consistent format that is easy to share.
              </p>
              </div>
            </div>
            </div>
          </RevealOnScroll>
        </section>

        <section id="what-we-do" className="mt-16 scroll-mt-24">
          <RevealOnScroll>
            <div className="glass-card subtle-grid overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="group relative overflow-hidden rounded-2xl lg:order-2">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
                  alt="Analytics dashboard and portfolio performance metrics on screen"
                  className="h-64 w-full rounded-2xl object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:-rotate-[0.8deg] sm:h-80"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              </div>
              <div className="lg:order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
                What we do
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Turn profile details into opportunity-ready pages
              </h2>
              <p className="mt-4 max-w-3xl text-slate-300">
                Users can upload projects, skills, work experience, education,
                awards, leadership highlights, social links, and CV files — all from
                one dashboard. DevFolia then transforms that content into polished,
                mobile-ready public pages with custom themes and analytics.
              </p>
              </div>
            </div>
            </div>
          </RevealOnScroll>
        </section>

        <section id="plans" className="mt-16 scroll-mt-24">
          <RevealOnScroll>
            <div className="glass-card subtle-grid overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="group relative overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
                  alt="Subscription pricing planning with financial documents and calculator"
                  className="h-64 w-full rounded-2xl object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:rotate-[0.8deg] sm:h-80"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              </div>
              <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Plans
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Flexible subscriptions for every stage
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Link href="/billing?plan=FREE" className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 transition hover:border-emerald-500/40">
                  <p className="text-base font-semibold text-white">Free</p>
                  <p className="mt-1 text-emerald-300">$0</p>
                  <p className="mt-2 text-xs text-slate-400">Core portfolio publishing</p>
                  </Link>
                  <Link href="/billing?plan=PRO" className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 transition hover:border-emerald-500/40">
                  <p className="text-base font-semibold text-white">Pro</p>
                  <p className="mt-1 text-emerald-300">$12/mo</p>
                  <p className="mt-2 text-xs text-slate-400">Advanced personalization and support</p>
                  </Link>
                  <Link href="/billing?plan=BUSINESS" className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 transition hover:border-emerald-500/40">
                  <p className="text-base font-semibold text-white">Business</p>
                  <p className="mt-1 text-emerald-300">$29/mo</p>
                  <p className="mt-2 text-xs text-slate-400">Custom domains and enhanced analytics</p>
                  </Link>
              </div>
              </div>
            </div>
            </div>
          </RevealOnScroll>
        </section>
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
