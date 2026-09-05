"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Zap,
  Target,
  MessagesSquare,
  ClipboardList,
  Star,
} from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#match", label: "Matching" },
  { href: "#platform", label: "Platform" },
  { href: "#who", label: "Who it is for" },
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
        <Link href="/" className="flex items-center gap-2 text-lg font-medium text-signal-blue">
          <span className="flex h-7 w-7 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white">B</span>
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

/* -------------------------------- match lab -------------------------------- */

const LAB_DATA: Record<string, { name: string; meta: string; score: number; bars: { label: string; value: number; max: number }[] }> = {
  Food: {
    name: "Sushma Pandey",
    meta: "Food and lifestyle · 42K followers",
    score: 96,
    bars: [
      { label: "Niche fit", value: 40, max: 40 },
      { label: "Location", value: 20, max: 20 },
      { label: "Audience", value: 15, max: 15 },
      { label: "Track record", value: 21, max: 25 },
    ],
  },
  Travel: {
    name: "Roshan Poudel",
    meta: "Travel vlogs · 28K followers",
    score: 91,
    bars: [
      { label: "Niche fit", value: 40, max: 40 },
      { label: "Location", value: 18, max: 20 },
      { label: "Audience", value: 13, max: 15 },
      { label: "Track record", value: 20, max: 25 },
    ],
  },
  Tech: {
    name: "Bibek Shrestha",
    meta: "Gadgets and reviews · 31K followers",
    score: 89,
    bars: [
      { label: "Niche fit", value: 38, max: 40 },
      { label: "Location", value: 20, max: 20 },
      { label: "Audience", value: 12, max: 15 },
      { label: "Track record", value: 19, max: 25 },
    ],
  },
  Fashion: {
    name: "Priya KC",
    meta: "Style and lookbooks · 56K followers",
    score: 93,
    bars: [
      { label: "Niche fit", value: 40, max: 40 },
      { label: "Location", value: 19, max: 20 },
      { label: "Audience", value: 14, max: 15 },
      { label: "Track record", value: 20, max: 25 },
    ],
  },
};

const LAB_NICHES = Object.keys(LAB_DATA);

function MatchLab() {
  const [niche, setNiche] = useState("Food");
  const d = LAB_DATA[niche];
  const radius = 44;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-cards-lg bg-signal-blue/5 blur-2xl" />
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-6 shadow-feature-section sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-caption font-medium uppercase tracking-wide text-ash">Try the matcher</p>
          <span className="inline-flex items-center gap-1.5 rounded-badges bg-emerald-status/10 px-2 py-0.5 text-xs font-medium text-emerald-status">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-status" />
            Live demo
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {LAB_NICHES.map((n) => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-all ${
                niche === n
                  ? "bg-midnight-ink text-white"
                  : "bg-sky-wash/70 text-slate-custom hover:bg-sky-wash hover:text-graphite"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div key={niche} className="animate-fade-slide-in flex items-center gap-5">
          <div className="relative h-28 w-28 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#f0f4fe" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#145aff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ - (circ * d.score) / 100}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-roboto-mono text-2xl font-medium text-midnight-ink">{d.score}</span>
              <span className="text-[10px] uppercase tracking-wide text-ash">match</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-wash text-sm font-medium text-signal-blue">
              {d.name.split(" ").map((w) => w[0]).join("")}
            </div>
            <p className="mt-2 truncate text-sm font-medium text-graphite">{d.name}</p>
            <p className="truncate text-xs text-ash">{d.meta}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-steel/10 pt-5">
          {d.bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-graphite">{b.label}</span>
                <span className="font-roboto-mono text-ash">{b.value}/{b.max}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-sky-wash">
                <div
                  className="h-full rounded-full bg-signal-blue transition-all duration-700 ease-out"
                  style={{ width: `${(b.value / b.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-16 pt-28 lg:pb-24 lg:pt-36">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 18% 10%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0.55) 45%, rgba(252,252,252,0) 75%)",
        }}
      />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-10">
        <div className="text-left">
          <Link
            href={isAuthed ? dash : "/register"}
            className="mb-6 inline-flex items-center gap-2 rounded-pill border border-steel/15 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-custom backdrop-blur-sm transition-colors hover:border-signal-blue/40 hover:text-signal-blue"
          >
            <Zap size={12} className="text-signal-blue" />
            Brand to creator marketplace
            <ArrowUpRight size={12} />
          </Link>

          <h1 className="mb-5 text-display text-midnight-ink">
            Creators your customers <span className="text-signal-blue">already trust</span>
          </h1>

          <p className="mb-8 max-w-md text-body leading-relaxed text-graphite/80">
            Score every promoter on fit, audience, and track record before you spend a rupee.
          </p>

          <div className="mb-10 flex flex-wrap items-center gap-4">
            {isAuthed ? (
              <Link href={dash}>
                <Button className="h-12 px-6 text-base">Open dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button className="h-12 px-6 text-base">
                    <span className="flex items-center gap-2">
                      <span>Get started</span>
                      <ArrowRight size={16} />
                    </span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="h-12 px-6 text-base">Sign in</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {["No spreadsheets, no scattered DMs", "Verified profiles only", "Free to join for creators"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 text-sm text-ash">
                <Check size={15} className="flex-shrink-0 text-emerald-status" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div id="match">
          <MatchLab />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- ticker --------------------------------- */

const TICKS = [
  { text: "Sushma applied to Summer Launch", score: 96 },
  { text: "Roshan accepted a festival brief", score: 91 },
  { text: "Anita published a wellness reel", score: 88 },
  { text: "Priya got verified", score: 93 },
  { text: "Bibek bid on a gadget drop", score: 89 },
];

function Ticker() {
  const row = [...TICKS, ...TICKS];
  return (
    <section aria-label="Marketplace activity" className="overflow-hidden border-y border-steel/10 bg-white py-4">
      <div className="animate-marquee-x flex w-max items-center gap-8 pr-8">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm text-ash">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-status" />
            {t.text}
            <span className="font-roboto-mono text-xs text-signal-blue">{t.score}%</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- platform -------------------------------- */

const PLATFORM_CARDS = [
  {
    icon: Target,
    tint: "bg-sky-wash text-signal-blue",
    title: "Post a brief",
    body: "Goals, budget, audience, and requirements in one structured brief.",
  },
  {
    icon: Sparkles,
    tint: "bg-sky-wash text-signal-blue",
    title: "Get scored applicants",
    body: "Every application arrives with its match score and reasoning.",
  },
  {
    icon: ClipboardList,
    tint: "bg-sky-wash text-signal-blue",
    title: "Approve deliverables",
    body: "Review drafts, request changes, and publish without leaving the app.",
  },
  {
    icon: MessagesSquare,
    tint: "bg-sky-wash text-signal-blue",
    title: "Chat in context",
    body: "Each collaboration carries its own conversation thread.",
  },
  {
    icon: Star,
    tint: "bg-amber-tag/15 text-amber-tag",
    title: "Build reputation",
    body: "Two sided reviews compound into trust you can hire on.",
  },
  {
    icon: ShieldCheck,
    tint: "bg-emerald-status/10 text-emerald-status",
    title: "Stay verified",
    body: "Identity and audience checks keep bots and fakes out.",
  },
];

function Platform() {
  return (
    <section id="platform" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-md text-heading-lg text-midnight-ink">
            Everything after hello, handled
          </h2>
          <p className="max-w-sm text-body leading-relaxed text-ash">
            Six tools that replace the spreadsheet, the inbox threads, and the follow up anxiety.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_CARDS.map((c) => (
            <div
              key={c.title}
              className="group rounded-cards border border-steel/10 bg-white p-6 shadow-product-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-buttons ${c.tint}`}>
                <c.icon size={18} />
              </span>
              <h3 className="mb-1.5 text-heading-sm text-graphite">{c.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- who ----------------------------------- */

function Who() {
  return (
    <section id="who" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-4 px-6 md:grid-cols-2">
        <div className="rounded-cards-lg bg-sky-wash/60 p-8 lg:p-10">
          <p className="mb-2 text-caption font-medium uppercase tracking-wide text-signal-blue">For business</p>
          <h3 className="mb-3 text-heading-lg text-midnight-ink">Launch in an afternoon</h3>
          <p className="mb-6 max-w-sm text-body leading-relaxed text-steel">
            Write one brief and wake up to a ranked shortlist. Approve the work, pay for results, repeat.
          </p>
          <Link href="/register">
            <Button>
              <span className="flex items-center gap-2">Get started <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-linen-canvas p-8 lg:p-10">
          <p className="mb-2 text-caption font-medium uppercase tracking-wide text-emerald-status">For creators</p>
          <h3 className="mb-3 text-heading-lg text-midnight-ink">Get paid for influence</h3>
          <p className="mb-6 max-w-sm text-body leading-relaxed text-steel">
            Build one profile, collect verified reviews, and let matched briefs come to you.
          </p>
          <Link href="/register">
            <Button variant="ghost">
              <span className="flex items-center gap-2">Get started <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- steps ---------------------------------- */

const STEPS = [
  { title: "Create your profile", desc: "Business or creator, done in minutes." },
  { title: "Match and apply", desc: "Scores guide both sides to the fit." },
  { title: "Deliver together", desc: "Briefs, drafts, and approvals in one thread." },
  { title: "Review and repeat", desc: "Every collaboration builds your record." },
];

function Steps() {
  return (
    <section className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[800px] px-6">
        <h2 className="mb-12 text-center text-heading-lg text-midnight-ink">From signup to published</h2>
        <ol className="relative space-y-0 border-l border-steel/20 pl-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 pb-10 last:pb-0">
              <span className="font-roboto-mono z-10 -ml-[21px] flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-steel/15 bg-white text-sm text-signal-blue shadow-product-card">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="mb-1 text-heading-sm text-graphite">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ash">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQS = [
  {
    q: "How does the matching score work?",
    a: "Each promoter is scored out of 100 across niche fit, location, audience, and track record. You always see the breakdown behind the number.",
  },
  {
    q: "Is Byparsathy free?",
    a: "Joining and building a profile is free for everyone. Businesses pay only for the campaigns they run.",
  },
  {
    q: "Who can apply to my campaign?",
    a: "Any verified promoter can apply, and every application arrives pre-scored so you review fit first, profiles second.",
  },
  {
    q: "How do creators get paid?",
    a: "Terms are agreed inside the collaboration before work starts, and reviews on completion build the record both sides rely on.",
  },
  {
    q: "What stops fake followers?",
    a: "Promoters pass identity and audience verification before they can apply, and review history is public to hiring businesses.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[800px] px-6">
        <h2 className="mb-10 text-center text-heading-lg text-midnight-ink">Questions, answered</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`overflow-hidden rounded-cards border transition-colors ${isOpen ? "border-signal-blue/30 bg-sky-wash/40" : "border-steel/10 bg-white"}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-heading-sm text-graphite">{f.q}</span>
                  <ChevronDown size={18} className={`flex-shrink-0 text-signal-blue transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <p className="animate-fade-slide-up px-5 pb-5 text-sm leading-relaxed text-ash">{f.a}</p>
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
    <section className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="relative overflow-hidden rounded-cards-lg bg-midnight-ink p-12 text-center lg:p-16">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(60% 90% at 50% 110%, rgba(20,90,255,0.45) 0%, rgba(2,5,32,0) 70%)" }}
          />
          <div className="relative">
            <h2 className="mx-auto mb-4 max-w-xl text-heading-lg text-white">
              Stop guessing who to hire
            </h2>
            <p className="mx-auto mb-8 max-w-md text-body text-white/70">
              See the score behind every creator before you commit a single rupee.
            </p>
            {isAuthed ? (
              <Link href={dash}>
                <Button className="h-12 px-6 text-base">Open dashboard</Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button className="h-12 px-6 text-base">
                  <span className="flex items-center gap-2">
                    Get started
                    <ArrowRight size={16} />
                  </span>
                </Button>
              </Link>
            )}
          </div>
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
          <p className="flex items-center gap-2 text-lg font-medium text-signal-blue">
            <span className="flex h-7 w-7 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white">B</span>
            Byparsathy
          </p>
          <p className="mt-1 text-sm text-ash">Brand to promoter collaborations, made in Nepal.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#match" className="text-sm text-ash transition-colors hover:text-signal-blue">Matching</a>
          <a href="#faq" className="text-sm text-ash transition-colors hover:text-signal-blue">FAQ</a>
          <Link href="/login" className="text-sm text-ash transition-colors hover:text-signal-blue">Sign in</Link>
          <Link href="/register" className="text-sm font-medium text-signal-blue hover:opacity-80">Get started</Link>
        </div>
      </div>
      <div className="border-t border-steel/10">
        <p className="mx-auto max-w-[1200px] px-6 py-5 text-xs text-ash">
          © {new Date().getFullYear()} Byparsathy. All rights reserved.
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
    <div className="min-h-screen bg-linen-canvas">
      <LandingNav isAuthed={isAuthed} role={user?.role} />
      <main>
        <Hero isAuthed={isAuthed} role={user?.role} />
        <Ticker />
        <Platform />
        <Who />
        <Steps />
        <Faq />
        <CTA isAuthed={isAuthed} role={user?.role} />
      </main>
      <Footer />
    </div>
  );
}
