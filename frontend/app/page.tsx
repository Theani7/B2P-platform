"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";
import { Menu, X, ArrowRight, Plus } from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#how", label: "How it works" },
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
        <Link href="/" className="text-lg font-medium text-signal-blue">
          Byparsathy
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-custom transition-colors hover:text-signal-blue"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <Link href={dash}>
              <Button variant="ghost">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm text-slate-custom transition-colors hover:text-signal-blue">
                Sign in
              </Link>
              <Link href="/register">
                <Button>Get started</Button>
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
              <span className="text-lg font-medium text-signal-blue">Byparsathy</span>
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
                  <Button variant="primary" className="w-full">Open dashboard</Button>
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

/* ------------------------------- match preview ------------------------------ */

const MATCH_ROWS = [
  { niche: "Food and lifestyle", reach: "42K followers", score: 96 },
  { niche: "Travel vlogs", reach: "28K followers", score: 91 },
  { niche: "Wellness", reach: "15K followers", score: 88 },
];

function MatchPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-4 rounded-cards-lg bg-signal-blue/5 blur-2xl" />
      <div className="relative rounded-cards-lg border border-steel/10 bg-white p-6 shadow-feature-section sm:p-7">
        <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">Summer Launch 2026</p>
        <p className="mb-5 text-heading-sm text-graphite">Top matches</p>
        <div className="divide-y divide-steel/10 border-y border-steel/10">
          {MATCH_ROWS.map((r) => (
            <div key={r.niche} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-graphite">{r.niche}</p>
                <p className="mt-0.5 text-xs text-ash">{r.reach}</p>
              </div>
              <span className="font-roboto-mono text-sm text-signal-blue">{r.score}%</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-fog">Scores combine niche fit, location, audience, and track record.</p>
      </div>
    </div>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0.55) 45%, rgba(252,252,252,0) 75%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <h1 className="mx-auto mb-5 max-w-2xl text-display text-midnight-ink">
          Every campaign finds <span className="text-signal-blue">its creator</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-body leading-relaxed text-graphite/80">
          Post a brief, meet scored matches, and run the collaboration in one quiet workspace.
        </p>
        <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
          {isAuthed ? (
            <Link href={dash}>
              <Button className="h-12 px-6 text-base">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button className="h-12 px-6 text-base">Get started</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="h-12 px-6 text-base">Sign in</Button>
              </Link>
            </>
          )}
        </div>
        <MatchPreview />
      </div>
    </section>
  );
}

/* --------------------------------- niches ---------------------------------- */

const NICHES = ["Fashion", "Tech", "Food", "Travel", "Fitness", "Gaming", "Beauty", "Education"];

function Niches() {
  return (
    <section className="border-y border-steel/10 bg-white py-10">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <p className="mb-5 text-caption font-medium uppercase tracking-wide text-fog">Creators across every niche</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {NICHES.map((n) => (
            <span key={n} className="text-heading-sm text-ash transition-colors hover:text-graphite">{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- platform --------------------------------- */

const FEATURES = [
  { title: "Scored matching", body: "Niche, location, audience, and track record compress into one number you can inspect." },
  { title: "Structured briefs", body: "Goals, budget, and requirements live in one place both sides can see." },
  { title: "Calm delivery", body: "Drafts, approvals, and reviews move forward without chasing threads." },
  { title: "Shared context", body: "Every message belongs to its collaboration. Nothing gets lost." },
  { title: "Verified profiles", body: "Identity and audience checks run before anyone can apply." },
  { title: "Honest reputation", body: "Two sided reviews compound into trust worth hiring on." },
];

function Platform() {
  return (
    <section id="platform" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[900px] px-6">
        <h2 className="mx-auto mb-4 max-w-xl text-center text-heading-lg text-midnight-ink">
          Less noise around hiring creators
        </h2>
        <p className="mx-auto mb-14 max-w-md text-center text-body text-ash">
          Six quiet tools replace the spreadsheet, the inbox, and the follow up.
        </p>
        <div className="divide-y divide-steel/10 border-y border-steel/10">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="grid gap-1 py-6 sm:grid-cols-[64px_1fr] sm:gap-6">
              <span className="font-roboto-mono text-sm text-fog">0{i + 1}</span>
              <div>
                <h3 className="mb-1 text-heading-sm text-graphite">{f.title}</h3>
                <p className="max-w-xl text-sm leading-relaxed text-ash">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- steps ---------------------------------- */

const STEPS = [
  { title: "Create your profile", desc: "Business or creator, finished in minutes." },
  { title: "Match and apply", desc: "Scores point both sides toward the fit." },
  { title: "Deliver together", desc: "Briefs, drafts, and approvals in one thread." },
  { title: "Review and repeat", desc: "Each collaboration builds your record." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[900px] px-6">
        <h2 className="mb-12 text-center text-heading-lg text-midnight-ink">Four steps, no detours</h2>
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <p className="font-roboto-mono mb-3 border-b border-steel/10 pb-3 text-sm text-signal-blue">0{i + 1}</p>
              <h3 className="mb-1.5 text-heading-sm text-graphite">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 text-center">
          <Link href="/register">
            <Button className="h-12 px-6 text-base">
              <span className="flex items-center gap-2">Get started <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQS = [
  {
    q: "How does the matching score work?",
    a: "Each promoter is scored out of 100 across niche fit, location, audience, and track record, with the breakdown always visible.",
  },
  {
    q: "Is Byparsathy free?",
    a: "Joining and building a profile is free. Businesses pay only for the campaigns they run.",
  },
  {
    q: "Who can apply to my campaign?",
    a: "Any verified promoter. Every application arrives pre-scored so you review fit first.",
  },
  {
    q: "How do creators get paid?",
    a: "Terms are agreed inside the collaboration before work starts, and completed work earns public reviews.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[720px] px-6">
        <h2 className="mb-10 text-center text-heading-lg text-midnight-ink">Questions</h2>
        <div className="divide-y divide-steel/10 border-y border-steel/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-heading-sm text-graphite">{f.q}</span>
                  <Plus size={16} className={`flex-shrink-0 text-signal-blue transition-transform ${isOpen ? "rotate-45" : ""}`} />
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

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-steel/10 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div>
          <p className="text-lg font-medium text-signal-blue">Byparsathy</p>
          <p className="mt-1 text-sm text-ash">Brand to creator collaborations, made in Nepal.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#platform" className="text-sm text-ash transition-colors hover:text-signal-blue">Platform</a>
          <Link href="/about" className="text-sm text-ash transition-colors hover:text-signal-blue">About</Link>
          <Link href="/login" className="text-sm text-ash transition-colors hover:text-signal-blue">Sign in</Link>
          <Link href="/register" className="text-sm font-medium text-signal-blue hover:opacity-80">Get started</Link>
        </div>
      </div>
      <div className="border-t border-steel/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ash">© {new Date().getFullYear()} Byparsathy. All rights reserved.</p>
          <p className="flex gap-4 text-xs text-ash">
            <Link href="/privacy" className="transition-colors hover:text-signal-blue">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-signal-blue">Terms</Link>
          </p>
        </div>
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
    <div className="min-h-screen bg-linen-canvas">
      <LandingNav isAuthed={isAuthed} role={user?.role} />
      <main>
        <Hero isAuthed={isAuthed} role={user?.role} />
        <Niches />
        <Platform />
        <HowItWorks />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
