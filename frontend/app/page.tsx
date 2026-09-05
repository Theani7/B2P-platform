"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";
import { Menu, X, ArrowRight, ArrowUpRight } from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#index", label: "Index" },
  { href: "#creed", label: "Creed" },
  { href: "#steps", label: "Steps" },
];

function LandingNav({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-midnight-ink/10 bg-linen-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-midnight-ink">
          Byparsathy<span className="text-signal-blue">®</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-roboto-mono text-xs uppercase tracking-widest text-slate-custom transition-colors hover:text-midnight-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <Link href={dash}>
              <Button className="rounded-pill">Dashboard <ArrowUpRight size={15} /></Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-custom transition-colors hover:text-midnight-ink">
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
              <span className="text-lg font-semibold text-midnight-ink">Byparsathy®</span>
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

/* ---------------------------------- hero ---------------------------------- */

function SpinBadge() {
  return (
    <div className="animate-spin-slower relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <path id="badge-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-midnight-ink text-[10.5px] font-semibold uppercase" style={{ letterSpacing: "2.5px" }}>
          <textPath href="#badge-circle">free to join · nepal · free to join ·</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-signal-blue text-white">
          <ArrowRight size={18} className="-rotate-45" />
        </span>
      </div>
    </div>
  );
}

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-14 pt-32 lg:pt-40">
      <div className="mx-auto max-w-[1400px] px-6">
        <p className="font-roboto-mono mb-6 text-xs uppercase tracking-widest text-signal-blue">
          The brand × creator marketplace
        </p>
        <h1 className="font-semibold uppercase leading-[0.92] tracking-tight text-midnight-ink text-[clamp(3.5rem,11vw,10rem)]">
          Brands<br />
          <span className="text-outline-ink">meet</span> creators<span className="text-signal-blue">.</span>
        </h1>

        <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1fr_auto] lg:gap-6">
          <div>
            <p className="mb-8 max-w-md text-body leading-relaxed text-graphite/80">
              Post a brief. Get scored on fit, not fame. Launch work worth talking about.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {isAuthed ? (
                <Link href={dash}>
                  <Button className="h-13 rounded-pill px-8 text-base">Open dashboard <ArrowRight size={16} /></Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="h-13 rounded-pill px-8 text-base">Start free <ArrowRight size={16} /></Button>
                  </Link>
                  <Link href="/login" className="px-2 py-2 text-sm font-medium text-slate-custom transition-colors hover:text-midnight-ink">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden justify-end lg:flex">
            <SpinBadge />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- marquee --------------------------------- */

const WORDS = ["Post a brief", "Get scored", "Meet creators", "Launch together"];

function Marquee() {
  const row = [...WORDS, ...WORDS, ...WORDS, ...WORDS];
  return (
    <section aria-label="What happens here" className="overflow-hidden border-y-2 border-midnight-ink bg-signal-blue py-4">
      <div className="animate-marquee-x flex w-max items-center gap-8 pr-8">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-lg font-semibold uppercase tracking-tight text-white">
            {w}
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- index ---------------------------------- */

const INDEX_ROWS = [
  { n: "01", title: "Scored matching", body: "Niche 40 · Place 20 · Crowd 15 · Proof 25. The math is printed on every match." },
  { n: "02", title: "Verified humans", body: "Identity and audience checks before anyone touches your brief." },
  { n: "03", title: "One thread", body: "Briefs, drafts, approvals, and chat live in a single collaboration." },
  { n: "04", title: "Public record", body: "Two sided reviews. Reputation you can hire on, rates you can trust." },
];

function Index() {
  return (
    <section id="index" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        {INDEX_ROWS.map((r) => (
          <Link
            key={r.n}
            href="/register"
            className="group grid gap-2 border-t-2 border-midnight-ink py-8 transition-colors last:border-b hover:bg-midnight-ink lg:grid-cols-[100px_1fr_1fr] lg:gap-10 lg:py-10"
          >
            <span className="font-roboto-mono text-sm text-signal-blue group-hover:text-white/60">{r.n}</span>
            <span className="text-3xl font-semibold uppercase tracking-tight text-midnight-ink group-hover:text-white lg:text-5xl">
              {r.title}
            </span>
            <span className="max-w-md self-center text-body leading-relaxed text-ash group-hover:text-white/70">
              {r.body}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- creed ---------------------------------- */

function Creed() {
  return (
    <section id="creed" className="bg-midnight-ink py-24 lg:py-36">
      <div className="mx-auto max-w-[1400px] px-6">
        <p className="font-roboto-mono mb-8 text-xs uppercase tracking-widest text-white/40">The creed</p>
        <p className="max-w-5xl text-3xl font-medium leading-tight tracking-tight text-white lg:text-6xl">
          Fame is cheap. <span className="text-outline-paper">Fit is rare.</span> We built the marketplace
          that can tell the difference<span className="text-signal-blue">.</span>
        </p>
        <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
          {[
            ["100", "points in every score"],
            ["04", "steps to published"],
            ["02", "sides, one workspace"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-roboto-mono text-5xl text-white lg:text-6xl">{v}</p>
              <p className="mt-2 text-sm text-white/50">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- steps ---------------------------------- */

const STEPS = ["Profile in minutes", "Briefs meet matches", "Deliver in thread", "Review, repeat"];

function Steps() {
  return (
    <section id="steps" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-px overflow-hidden rounded-cards-lg border-2 border-midnight-ink bg-midnight-ink sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s} className="bg-linen-canvas p-8 lg:p-10">
              <p className="font-roboto-mono mb-6 text-6xl leading-none text-signal-blue">0{i + 1}</p>
              <p className="text-xl font-semibold uppercase tracking-tight text-midnight-ink">{s}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/register">
            <Button className="h-13 rounded-pill px-8 text-base">Claim your handle <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  return (
    <footer className="overflow-hidden bg-midnight-ink pt-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col justify-between gap-10 pb-14 md:flex-row">
          <div className="flex gap-4">
            <Link href="/register?role=BUSINESS" className="rounded-pill bg-white px-6 py-3 text-sm font-semibold text-midnight-ink transition-opacity hover:opacity-85">
              I am a brand
            </Link>
            <Link href="/register?role=PROMOTER" className="rounded-pill border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              I am a creator
            </Link>
          </div>
          <div className="flex gap-10">
            {[
              { title: "Map", links: [{ label: "Index", href: "#index" }, { label: "Creed", href: "#creed" }, { label: "Steps", href: "#steps" }] },
              { title: "Co", links: [{ label: "About", href: "/about" }, { label: "Sign in", href: "/login" }] },
              { title: "Law", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-roboto-mono mb-3 text-[11px] uppercase tracking-widest text-white/35">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
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
        <p aria-hidden className="select-none whitespace-nowrap text-center font-semibold uppercase leading-none tracking-tight text-white/[0.07] text-[clamp(4rem,14.5vw,13rem)]">
          Byparsathy
        </p>
        <p className="border-t border-white/10 py-5 text-xs text-white/35">
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
        <Marquee />
        <Index />
        <Creed />
        <Steps />
      </main>
      <Footer />
    </div>
  );
}
