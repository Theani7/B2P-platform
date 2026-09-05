"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";
import { Menu, X, ArrowRight, ArrowUpRight } from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#live", label: "Live" },
  { href: "#score", label: "Scoring" },
  { href: "#chapters", label: "Platform" },
  { href: "#faq", label: "FAQ" },
];

function LandingNav({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-steel/10 bg-linen-canvas/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="text-lg font-medium tracking-tight text-midnight-ink">
          Byparsathy<span className="text-signal-blue">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-custom transition-colors hover:text-midnight-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link href={dash}>
              <Button variant="ghost">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm text-slate-custom transition-colors hover:text-midnight-ink">
                Sign in
              </Link>
              <Link href="/register">
                <Button className="rounded-pill">Get started <ArrowUpRight size={15} /></Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-buttons p-2 text-slate-custom hover:bg-sky-wash md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-midnight-ink/30 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed bottom-0 right-0 top-0 z-50 flex w-72 flex-col bg-linen-canvas md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-steel/10 px-6">
              <span className="text-lg font-medium text-midnight-ink">Byparsathy.</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-buttons p-2 text-slate-custom hover:bg-sky-wash"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-buttons px-3 py-3 text-sm text-slate-custom transition-colors hover:bg-sky-wash"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-steel/10 p-6">
              {isAuthed ? (
                <Link href={dash} onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

/* -------------------------------- live feed -------------------------------- */

const FEED = [
  { brief: "Festival snack launch", detail: "Food · Kathmandu · Rs 45K", score: 96 },
  { brief: "Trek gear field test", detail: "Travel · Pokhara · Rs 30K", score: 91 },
  { brief: "Gadget unboxing wave", detail: "Tech · Lalitpur · Rs 60K", score: 89 },
  { brief: "Winter lookbook", detail: "Fashion · Kathmandu · Rs 38K", score: 93 },
];

function LiveFeed() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % FEED.length), 3200);
    return () => clearInterval(id);
  }, [paused]);

  const item = FEED[index];

  return (
    <div
      id="live"
      className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-7 shadow-feature-section sm:p-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="text-caption font-medium uppercase tracking-wide text-ash">Happening now</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-status">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-status" />
          Live
        </span>
      </div>

      <div key={index} className="animate-fade-slide-up">
        <p className="mb-1 text-heading text-graphite">{item.brief}</p>
        <p className="mb-5 text-sm text-ash">{item.detail}</p>
        <div className="flex items-end justify-between">
          <p className="text-caption uppercase tracking-wide text-fog">Top match</p>
          <p className="font-roboto-mono text-display leading-none text-signal-blue">{item.score}<span className="text-lg text-ash">%</span></p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sky-wash">
          <div className="h-full rounded-full bg-signal-blue transition-all duration-700" style={{ width: `${item.score}%` }} />
        </div>
      </div>

      <div className="mt-6 flex gap-1.5">
        {FEED.map((_, i) => (
          <button
            key={i}
            aria-label={`Show brief ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1 flex-1 rounded-full transition-colors ${i === index ? "bg-signal-blue" : "bg-steel/15 hover:bg-steel/30"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-16 pt-32 lg:pb-24 lg:pt-40">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 20%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0.5) 50%, rgba(252,252,252,0) 75%)",
        }}
      />
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div>
          <p className="font-roboto-mono mb-6 text-xs text-signal-blue">brand × creator marketplace — nepal</p>
          <h1 className="text-display text-midnight-ink">
            Put your brand<br />in trusted hands<span className="text-signal-blue">.</span>
          </h1>
          <p className="mb-9 mt-6 max-w-md text-body leading-relaxed text-graphite/80">
            Post a brief. Meet creators scored on fit, not fame. Launch work you can measure.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {isAuthed ? (
              <Link href={dash}>
                <Button className="h-12 rounded-pill px-7 text-base">Open dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button className="h-12 rounded-pill px-7 text-base">
                    <span className="flex items-center gap-2">Start free <ArrowRight size={16} /></span>
                  </Button>
                </Link>
                <Link href="/login" className="px-2 py-2 text-sm font-medium text-slate-custom transition-colors hover:text-midnight-ink">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        <LiveFeed />
      </div>
    </section>
  );
}

/* ------------------------------- score band -------------------------------- */

const SEGMENTS = [
  { label: "Niche", pts: 40 },
  { label: "Place", pts: 20 },
  { label: "Crowd", pts: 15 },
  { label: "Proof", pts: 25 },
];

function ScoreBand() {
  return (
    <section id="score" className="border-y border-steel/10 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <h2 className="mb-3 text-heading-lg text-midnight-ink">One number, fully open</h2>
            <p className="max-w-sm text-body leading-relaxed text-ash">
              Every match is scored out of 100. Nothing hidden, nothing averaged away.
            </p>
          </div>
          <div>
            <div className="flex h-14 w-full overflow-hidden rounded-buttons">
              {SEGMENTS.map((s) => (
                <div
                  key={s.label}
                  className="flex h-full flex-col justify-center border-r border-white/60 bg-sky-wash px-4 last:border-0"
                  style={{ width: `${s.pts}%` }}
                >
                  <span className="font-roboto-mono text-sm text-midnight-ink">{s.pts}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ash">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between">
              <span className="text-xs text-fog">Fit · Place · Crowd · Proof</span>
              <span className="font-roboto-mono text-xs text-signal-blue">100 pts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- chapters --------------------------------- */

const CHAPTERS = [
  {
    n: "01",
    title: "Brief it",
    body: "Describe the work, the crowd, and the budget. A structured brief takes minutes and answers every question a creator would ask.",
    tags: ["Goals", "Budget", "Requirements"],
  },
  {
    n: "02",
    title: "Meet the shortlist",
    body: "Applications arrive ranked by the open score. Open a profile, check the record, and invite your favorites.",
    tags: ["Ranked applicants", "Verified profiles", "Direct invites"],
  },
  {
    n: "03",
    title: "Ship it together",
    body: "Drafts, feedback, and approvals move through one thread. Chat stays attached to the work it is about.",
    tags: ["Deliverables", "Approvals", "In-context chat"],
  },
];

function Chapters() {
  return (
    <section id="chapters" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        {CHAPTERS.map((c, i) => (
          <div
            key={c.n}
            className={`grid gap-6 border-t border-steel/10 py-12 lg:py-16 ${i === CHAPTERS.length - 1 ? "border-b" : ""} lg:grid-cols-[120px_1fr_1fr] lg:gap-10`}
          >
            <p className="font-roboto-mono text-display leading-none text-steel/25">{c.n}</p>
            <h3 className="text-heading-lg text-midnight-ink">{c.title}</h3>
            <div>
              <p className="mb-5 max-w-md text-body leading-relaxed text-ash">{c.body}</p>
              <div className="flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-badges bg-sky-wash px-2.5 py-1 text-xs font-medium text-signal-blue">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------- roles ---------------------------------- */

function Roles() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-px overflow-hidden rounded-cards-lg border border-steel/10 bg-steel/10 sm:grid-cols-2">
        <div className="bg-white p-10 lg:p-14">
          <p className="font-roboto-mono mb-4 text-xs text-signal-blue">for brands</p>
          <h3 className="mb-3 text-heading-lg text-midnight-ink">Hire on evidence</h3>
          <p className="mb-8 max-w-sm text-body leading-relaxed text-ash">
            Compare audiences, read real reviews, and approve work without leaving the thread.
          </p>
          <Link href="/register?role=BUSINESS" className="inline-flex items-center gap-1.5 text-sm font-medium text-signal-blue hover:opacity-75">
            Start hiring <ArrowRight size={15} />
          </Link>
        </div>
        <div className="bg-midnight-ink p-10 lg:p-14">
          <p className="font-roboto-mono mb-4 text-xs text-white/50">for creators</p>
          <h3 className="mb-3 text-heading-lg text-white">Get found for your thing</h3>
          <p className="mb-8 max-w-sm text-body leading-relaxed text-white/70">
            One profile, matched briefs, reviews that raise your rate. No follower gatekeeping.
          </p>
          <Link href="/register?role=PROMOTER" className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:opacity-75">
            Join as a creator <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQS = [
  {
    q: "What does it cost?",
    a: "Joining and building a profile is free. Businesses pay only for the campaigns they run.",
  },
  {
    q: "How is the score calculated?",
    a: "Niche fit (40), location (20), audience (15), and track record (25). The full split shows on every match.",
  },
  {
    q: "Who owns the content?",
    a: "Creators do. Posting it here only lets the platform display it for marketplace purposes.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[720px] px-6">
        <h2 className="mb-10 text-heading-lg text-midnight-ink">Asked often</h2>
        <div className="border-t border-steel/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-steel/10">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-heading-sm text-graphite">{f.q}</span>
                  <span className={`font-roboto-mono text-sm ${isOpen ? "text-signal-blue" : "text-fog"}`}>
                    {isOpen ? "—" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="animate-fade-slide-up max-w-2xl pb-6 text-sm leading-relaxed text-ash">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- CTA ----------------------------------- */

function CTA({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="bg-linen-canvas px-6 pb-20 lg:pb-28">
      <div className="mx-auto max-w-[1200px] rounded-cards-lg bg-midnight-ink px-6 py-16 text-center lg:py-20">
        <h2 className="mx-auto mb-4 max-w-xl text-heading-lg text-white">
          Your next collab is one brief away
        </h2>
        <p className="mx-auto mb-9 max-w-md text-body text-white/65">
          Free to start. Pick a side and meet your match.
        </p>
        {isAuthed ? (
          <Link href={dash}>
            <Button className="h-12 rounded-pill bg-white px-7 text-base font-medium text-midnight-ink hover:opacity-90">
              Open dashboard
            </Button>
          </Link>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register?role=BUSINESS" className="rounded-pill bg-white px-7 py-3 text-sm font-medium text-midnight-ink transition-opacity hover:opacity-90">
              I am a brand
            </Link>
            <Link href="/register?role=PROMOTER" className="rounded-pill border border-white/25 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
              I am a creator
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-steel/10 bg-linen-canvas">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-medium tracking-tight text-midnight-ink">Byparsathy<span className="text-signal-blue">.</span></p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash">
            The brand to creator marketplace. Direct briefs, open scoring, honest reviews.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {[
            { title: "Platform", links: [{ label: "Live", href: "#live" }, { label: "Scoring", href: "#score" }, { label: "FAQ", href: "#faq" }] },
            { title: "Company", links: [{ label: "About", href: "/about" }] },
            { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
          ].map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-caption font-medium uppercase tracking-wide text-fog">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link href={l.href} className="text-sm text-slate-custom transition-colors hover:text-midnight-ink">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="text-sm text-slate-custom transition-colors hover:text-midnight-ink">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-steel/10">
        <p className="mx-auto max-w-[1200px] px-6 py-5 text-xs text-fog">
          © {new Date().getFullYear()} Byparsathy · Made in Nepal
        </p>
      </div>
    </footer>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function LandingPage() {
  const { token, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAuthed = mounted && !!token && !!user;

  return (
    <div className="min-h-screen bg-linen-canvas text-graphite antialiased">
      <LandingNav isAuthed={isAuthed} role={user?.role} />
      <main>
        <Hero isAuthed={isAuthed} role={user?.role} />
        <ScoreBand />
        <Chapters />
        <Roles />
        <Faq />
        <CTA isAuthed={isAuthed} role={user?.role} />
      </main>
      <Footer />
    </div>
  );
}
