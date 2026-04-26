import Image from "next/image";
import Link from "next/link";
import { CSSProperties } from "react";
import { CvMenuButton } from "@/components/portfolio/CvMenuButton";
import { CopyPhoneButton } from "@/components/portfolio/CopyPhoneButton";
import { MobileNavMenu } from "@/components/portfolio/MobileNavMenu";
import { StatusBadge } from "@/components/portfolio/StatusBadge";
import { getPortfolioThemeDefinition } from "@/lib/portfolio-themes";

type PortfolioData = {
  profile: {
    displayName: string;
    headline: string;
    bio: string;
    resumeUrl: string | null;
    email: string | null;
    githubUrl: string | null;
    phone: string | null;
    location: string | null;
    website: string | null;
    profileImage: string | null;
    discordUrl: string | null;
    xUrl: string | null;
    threadsUrl: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    whatsappUrl: string | null;
    linkedinUrl: string | null;
    theme: string;
  };
  projects: Array<{ id: string; title: string; description: string; status: string; imageUrl: string | null }>;
  skills: Array<{ id: string; name: string; category: string; level: number; exampleNote: string }>;
  awards: Array<{ id: string; title: string; issuer: string; year: string; description: string; imageUrl: string | null }>;
  leadership: Array<{ id: string; role: string; organization: string; period: string; description: string; imageUrl: string | null }>;
  experience: Array<{ id: string; title: string; company: string; location: string | null; period: string; description: string }>;
  education: Array<{ id: string; school: string; degree: string; period: string; details: string }>;
};

function absoluteUrl(value?: string | null): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw)) return raw;
  return `https://${raw}`;
}

export function PublicPortfolioPage({ data }: { data: PortfolioData }) {
  const { profile, projects, skills, awards, leadership, experience, education } = data;
  const socialLinks = [
    { label: "Discord", href: absoluteUrl(profile.discordUrl) },
    { label: "X", href: absoluteUrl(profile.xUrl) },
    { label: "Threads", href: absoluteUrl(profile.threadsUrl) },
    { label: "Instagram", href: absoluteUrl(profile.instagramUrl) },
    { label: "Facebook", href: absoluteUrl(profile.facebookUrl) },
    { label: "WhatsApp", href: absoluteUrl(profile.whatsappUrl) },
    { label: "LinkedIn", href: absoluteUrl(profile.linkedinUrl) },
  ].filter((item) => Boolean(item.href));
  const themeStyles = getPortfolioThemeDefinition(profile.theme).style as CSSProperties | undefined;

  return (
    <div className="flex min-h-full flex-1 flex-col" style={themeStyles}>
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-[var(--accent)]">
            {profile.displayName}
          </span>
          <MobileNavMenu />
          <nav className="hidden flex-wrap items-center gap-4 text-sm text-[var(--muted)] sm:flex">
            <a href="#projects" className="hover:text-white">Projects</a>
            <a href="#skills" className="hover:text-white">Skills</a>
            <a href="#resume" className="hover:text-white">Resume</a>
            <a href="#awards" className="hover:text-white">Awards</a>
            <a href="#leadership" className="hover:text-white">Leadership</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[color:color-mix(in_srgb,var(--accent)_88%,white)]">Portfolio & CV</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">{profile.displayName}</h1>
            <p className="mt-3 text-xl text-[var(--muted)]">{profile.headline}</p>
            <p className="mt-6 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-slate-300">{profile.bio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CvMenuButton resumeUrl={profile.resumeUrl} />
              {profile.email && <a href={`mailto:${profile.email}`} className="inline-flex items-center rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:border-emerald-500/50 hover:text-emerald-200">Email me</a>}
              {profile.githubUrl && <a href={absoluteUrl(profile.githubUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:border-emerald-500/50 hover:text-emerald-200">GitHub</a>}
              {profile.phone && <CopyPhoneButton phone={profile.phone} />}
            </div>
            <ul className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
              {profile.location && <li>{profile.location}</li>}
              {profile.website && <li><a href={absoluteUrl(profile.website)} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">Website</a></li>}
            </ul>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xs">
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl bg-gradient-to-tr via-transparent blur-2xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top right, var(--hero-from, rgba(52,211,153,0.2)), transparent, var(--hero-to, rgba(56,189,248,0.2)))",
                  }}
                />
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt=""
                    width={224}
                    height={224}
                    className="relative mx-auto h-48 w-48 rounded-3xl border border-[var(--border)] object-cover shadow-2xl sm:h-56 sm:w-56"
                  />
                ) : (
                  <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-3xl border border-dashed border-slate-600 bg-slate-900/50 text-sm text-slate-500 sm:h-56 sm:w-56">Profile photo coming soon</div>
                )}
              </div>
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-soft)]">Connect with me</p>
                {socialLinks.length > 0 ? (
                  <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-flow-col lg:grid-rows-2 lg:grid-cols-none">
                    {socialLinks.map((item) => (
                      <li key={item.label}>
                        <a href={item.href!} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-300">{item.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Social links coming soon.</p>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="mt-24 scroll-mt-24">
          {projects.length === 0 ? (
            <p className="mt-8 text-slate-500">Projects will appear here soon.</p>
          ) : (
            <ul className="mt-10 grid gap-8 sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg shadow-black/20 transition hover:border-emerald-500/30">
                  <div className="relative aspect-[16/10] bg-slate-900">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-600">No image</div>
                    )}
                    <div className="absolute left-3 top-3"><StatusBadge status={p.status} /></div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section id="skills" className="mt-24 scroll-mt-24">{skills.length === 0 ? <p className="mt-8 text-slate-500">Skills will appear here soon.</p> : <ul className="mt-10 grid gap-6 sm:grid-cols-2">{skills.map((s) => (<li key={s.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-white">{s.name}</h3>{s.category && <p className="text-xs uppercase tracking-wider text-slate-500">{s.category}</p>}</div><span className="text-sm font-mono text-[var(--accent)]">{s.level}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r" style={{ width: `${s.level}%`, backgroundImage: "linear-gradient(to right, var(--skill-bar-from, #059669), var(--skill-bar-to, #34d399))" }} /></div>{s.exampleNote && <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.exampleNote}</p>}</li>))}</ul>}</section>
        <section id="resume" className="mt-24 scroll-mt-24"><div className="border-b border-[var(--border)] pb-4"><h2 className="text-2xl font-bold text-white">Experience & education</h2><p className="mt-1 text-sm text-[var(--muted)]">Professional timeline of experience and education.</p></div><div className="mt-10 grid gap-12 lg:grid-cols-2"><div><h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">Experience</h3>{experience.length === 0 ? <p className="mt-4 text-sm text-slate-500">No entries yet.</p> : <ul className="mt-6 space-y-8">{experience.map((x) => (<li key={x.id} className="border-l-2 pl-4" style={{ borderColor: "var(--experience-rail, rgba(16,185,129,0.45))" }}><p className="font-semibold text-white">{x.title}</p><p className="text-sm text-[var(--accent-soft)]">{x.company}</p><p className="text-xs text-slate-500">{x.period}{x.location ? ` · ${x.location}` : ""}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{x.description}</p></li>))}</ul>}</div><div><h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">Education</h3>{education.length === 0 ? <p className="mt-4 text-sm text-slate-500">No entries yet.</p> : <ul className="mt-6 space-y-8">{education.map((e) => (<li key={e.id} className="border-l-2 pl-4" style={{ borderColor: "var(--education-rail, rgba(56,189,248,0.45))" }}><p className="font-semibold text-white">{e.school}</p><p className="text-sm text-[color:color-mix(in_srgb,var(--accent-soft)_80%,white)]">{e.degree}</p><p className="text-xs text-slate-500">{e.period}</p>{e.details && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{e.details}</p>}</li>))}</ul>}</div></div></section>
        <section id="awards" className="mt-24 scroll-mt-24">{awards.length === 0 ? <p className="mt-8 text-slate-500">No awards listed yet.</p> : <ul className="mt-10 grid gap-6 sm:grid-cols-2">{awards.map((a) => (<li key={a.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">{a.imageUrl && <div className="relative aspect-video w-full"><Image src={a.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /></div>}<div className="p-5"><h3 className="font-semibold text-white">{a.title}</h3><p className="text-sm text-[var(--accent-soft)]">{a.issuer}</p>{a.year && <p className="mt-1 text-xs text-slate-500">{a.year}</p>}{a.description && <p className="mt-3 text-sm text-slate-400">{a.description}</p>}</div></li>))}</ul>}</section>
        <section id="leadership" className="mt-24 scroll-mt-24">{leadership.length === 0 ? <p className="mt-8 text-slate-500">No leadership entries yet.</p> : <ul className="mt-10 grid gap-6 sm:grid-cols-2">{leadership.map((l) => (<li key={l.id} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">{l.imageUrl && <Image src={l.imageUrl} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-xl object-cover" />}<div><h3 className="font-semibold text-white">{l.role}</h3><p className="text-sm text-slate-300">{l.organization}</p><p className="mt-1 text-xs text-slate-500">{l.period}</p>{l.description && <p className="mt-2 text-sm text-slate-400">{l.description}</p>}</div></li>))}</ul>}</section>
      </main>
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-slate-600">
        Built with{" "}
        <Link href="/" className="text-[var(--accent)] hover:underline">
          DevFolia
        </Link>
      </footer>
    </div>
  );
}
