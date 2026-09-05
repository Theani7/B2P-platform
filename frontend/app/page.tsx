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
  MessagesSquare,
  ClipboardList,
  Sparkles,
  Store,
  Megaphone,
  Inbox,
  FileCheck2,
} from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#business", label: "For business" },
  { href: "#creators", label: "For creators" },
  { href: "#how", label: "How it works" },
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

/* ------------------------------ product preview ------------------------------ */

const MATCH_ROWS = [
  { name: "Sushma Pandey", meta: "Food and lifestyle", reach: "42K", score: 96 },
  { name: "Roshan Poudel", meta: "Travel vlogs", reach: "28K", score: 91 },
  { name: "Anita Maharjan", meta: "Wellness", reach: "15K", score: 88 },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-status/10 text-emerald-status"
      : "bg-amber-tag/10 text-amber-tag";
  return (
    <span className={`font-roboto-mono inline-flex items-center rounded-badges px-2 py-0.5 text-xs font-medium ${color}`}>
      {score}%
    </span>
  );
}

function MatchPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-4 rounded-cards-lg bg-signal-blue/5 blur-2xl" />
      <div className="animate-fade-slide-up relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-5 text-left shadow-feature-section">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">Match results</p>
            <p className="text-sm font-medium text-graphite">Summer Launch 2026</p>
          </div>
          <span className="inline-flex items-center rounded-badges bg-emerald-status/10 px-2 py-0.5 text-xs font-medium text-emerald-status">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-status" />
            Live
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {MATCH_ROWS.map((p) => (
            <div key={p.name} className="flex items-center justify-between rounded-cards px-3 py-2.5 transition-colors hover:bg-sky-wash/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-wash text-[10px] font-medium text-signal-blue">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-xs font-medium text-graphite">{p.name}</p>
                  <p className="text-[10px] text-ash">{p.meta} · {p.reach}</p>
                </div>
              </div>
              <ScoreBadge score={p.score} />
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-steel/10 pt-4">
          {[
            { label: "Applications", value: "24" },
            { label: "Avg. match", value: "87%" },
          ].map((s) => (
            <div key={s.label} className="rounded-cards bg-linen-canvas p-3">
              <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">{s.label}</p>
              <p className="font-roboto-mono text-sm font-medium text-graphite">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-slide-up animate-delay-100 absolute -left-3 top-10 hidden items-center gap-2 rounded-cards border border-steel/10 bg-white/90 px-3 py-2 shadow-product-card backdrop-blur-sm sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-status/10">
          <Inbox size={12} className="text-emerald-status" />
        </span>
        <p className="text-xs font-medium text-graphite">New application</p>
      </div>
      <div className="animate-fade-slide-up animate-delay-200 absolute -right-3 bottom-12 hidden items-center gap-2 rounded-cards border border-steel/10 bg-white/90 px-3 py-2 shadow-product-card backdrop-blur-sm sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-wash">
          <FileCheck2 size={12} className="text-signal-blue" />
        </span>
        <p className="text-xs font-medium text-graphite">Brief approved</p>
      </div>
    </div>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-16 pt-28 lg:pb-20 lg:pt-36">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(182,203,253,0.55) 0%, rgba(240,244,254,0.6) 45%, rgba(252,252,252,0) 75%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <Link
          href={isAuthed ? dash : "/register"}
          className="mb-6 inline-flex items-center gap-2 rounded-pill border border-steel/15 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-custom backdrop-blur-sm transition-colors hover:border-signal-blue/40 hover:text-signal-blue"
        >
          <Sparkles size={12} className="text-signal-blue" />
          The brand to creator marketplace
          <ArrowUpRight size={12} />
        </Link>

        <h1 className="mx-auto mb-5 max-w-3xl text-display text-midnight-ink">
          The right creator for <span className="text-signal-blue">every campaign</span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-body text-graphite/80">
          Post a brief, get scored matches, and run the whole collaboration in one workspace.
        </p>

        <div className="mb-14 flex flex-wrap items-center justify-center gap-4">
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

        <MatchPreview />

        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { icon: ShieldCheck, label: "Verified profiles" },
            { icon: Sparkles, label: "Scored matching" },
            { icon: MessagesSquare, label: "Chat in context" },
          ].map((t) => (
            <span key={t.label} className="inline-flex items-center gap-2 text-sm text-ash">
              <t.icon size={15} className="text-signal-blue" />
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- marquee --------------------------------- */

const NICHES = ["Fashion", "Tech", "Food", "Travel", "Fitness", "Gaming", "Beauty", "Education", "Finance"];

function NicheMarquee() {
  const row = [...NICHES, ...NICHES];
  return (
    <section aria-label="Creator niches" className="overflow-hidden border-y border-steel/10 bg-white py-5">
      <div className="animate-marquee-x flex w-max items-center gap-10 pr-10">
        {row.map((n, i) => (
          <span key={`${n}-${i}`} className="flex items-center gap-10 whitespace-nowrap text-sm font-medium text-ash">
            {n}
            <span className="h-1 w-1 rounded-full bg-signal-blue/40" />
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- bento ---------------------------------- */

const SCORE_BARS = [
  { label: "Niche fit", value: 40, note: "40 pts" },
  { label: "Location", value: 20, note: "20 pts" },
  { label: "Audience", value: 15, note: "15 pts" },
  { label: "Track record", value: 12, note: "12 pts" },
];

function Platform() {
  return (
    <section id="platform" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mx-auto mb-4 max-w-2xl text-center text-heading-lg text-midnight-ink">
          One workspace, from brief to payout
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-body text-ash">
          Everything a collaboration needs lives inside Byparsathy. No scattered DMs, no lost files.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-cards-lg border border-steel/10 bg-white p-7 shadow-product-card md:col-span-2 md:row-span-2">
            <h3 className="mb-1 text-heading-sm text-graphite">Matching you can inspect</h3>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-ash">
              Every promoter gets a score out of 100 with the breakdown shown. You see exactly why someone fits.
            </p>
            <div className="flex flex-col gap-4">
              {SCORE_BARS.map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-graphite">{b.label}</span>
                    <span className="font-roboto-mono text-ash">{b.note}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sky-wash">
                    <div className="h-full rounded-full bg-signal-blue" style={{ width: `${(b.value / 40) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-badges bg-sky-wash px-3 py-1.5">
              <span className="text-xs text-ash">Total</span>
              <span className="font-roboto-mono text-sm font-medium text-signal-blue">87 / 100 · Strong match</span>
            </div>
          </div>

          <div className="rounded-cards-lg border border-steel/10 bg-sky-wash/60 p-7">
            <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-buttons bg-white shadow-product-card">
              <ShieldCheck size={18} className="text-emerald-status" />
            </span>
            <h3 className="mb-2 text-heading-sm text-graphite">Verified creators</h3>
            <p className="text-sm leading-relaxed text-ash">
              Identity and audience checks before anyone can apply to your campaign.
            </p>
          </div>

          <div className="rounded-cards-lg border border-steel/10 bg-white p-7 shadow-product-card">
            <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-buttons bg-sky-wash">
              <ClipboardList size={18} className="text-signal-blue" />
            </span>
            <h3 className="mb-2 text-heading-sm text-graphite">Structured delivery</h3>
            <ul className="flex flex-col gap-2 text-sm text-ash">
              {["Briefs with clear requirements", "Deliverables with approvals", "Reviews that build reputation"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-status" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-cards-lg border border-steel/10 bg-midnight-ink p-7 md:col-span-3">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex-1">
                <h3 className="mb-2 text-heading-sm text-white">Chat lives inside the work</h3>
                <p className="max-w-lg text-sm leading-relaxed text-white/70">
                  Every conversation is tied to its collaboration. Full context on both sides, nothing lost between apps.
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {[
                  { who: "Anita", text: "First cut is ready for review", time: "2m" },
                  { who: "You", text: "Approved, please publish Friday", time: "1m", mine: true },
                ].map((m) => (
                  <div key={m.text} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-cards px-3.5 py-2.5 ${m.mine ? "bg-signal-blue text-white" : "bg-white/10 text-white"}`}>
                      <p className="text-xs leading-relaxed">{m.text}</p>
                      <p className={`mt-1 text-[10px] ${m.mine ? "text-white/70" : "text-white/50"}`}>{m.who} · {m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- audience tabs ------------------------------ */

type Audience = "business" | "creator";

const AUDIENCES: Record<Audience, { title: string; body: string; points: string[]; cta: string; icon: typeof Store }> = {
  business: {
    title: "Run campaigns that convert",
    body: "Define goals and budget once. Get a ranked shortlist instead of a spreadsheet of maybes.",
    points: ["Campaigns live in minutes", "Applicants arrive pre-scored", "Approve work without chasing"],
    cta: "Start a campaign",
    icon: Megaphone,
  },
  creator: {
    title: "Turn audience into income",
    body: "One strong profile puts you in front of brands already looking for your niche.",
    points: ["Get discovered on fit, not followers", "Verified badge builds trust", "Set your own rates"],
    cta: "Join as a creator",
    icon: Store,
  },
};

function Audiences() {
  const [tab, setTab] = useState<Audience>("business");
  const a = AUDIENCES[tab];
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-heading-lg text-midnight-ink">Built for both sides</h2>
            <div className="mb-6 inline-flex gap-1 rounded-pill bg-sky-wash/70 p-1">
              {(["business", "creator"] as Audience[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-pill px-5 py-2 text-sm font-medium transition-all ${
                    tab === t ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
                  }`}
                >
                  {t === "business" ? "Business" : "Creator"}
                </button>
              ))}
            </div>
            <p className="max-w-md text-body leading-relaxed text-steel">{a.body}</p>
            <Link href="/register" className="mt-6 inline-block">
              <Button>
                <span className="flex items-center gap-2">
                  {a.cta}
                  <ArrowRight size={16} />
                </span>
              </Button>
            </Link>
          </div>
          <div key={tab} className="animate-fade-slide-in rounded-cards-lg border border-steel/10 bg-linen-canvas p-7 shadow-product-card lg:col-span-3">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-buttons bg-sky-wash">
                <a.icon size={18} className="text-signal-blue" />
              </span>
              <h3 className="text-heading-sm text-graphite">{a.title}</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {a.points.map((p, i) => (
                <li key={p} className="flex items-center gap-4 rounded-cards border border-steel/10 bg-white p-4">
                  <span className="font-roboto-mono text-xs text-ash">0{i + 1}</span>
                  <span className="text-sm font-medium text-graphite">{p}</span>
                  <Check size={15} className="ml-auto flex-shrink-0 text-emerald-status" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- steps ---------------------------------- */

const STEPS = [
  { title: "Create your profile", desc: "Sign up and add your details in minutes." },
  { title: "Match or browse", desc: "Post a campaign or explore the marketplace." },
  { title: "Collaborate", desc: "Deliver, review, and approve in one place." },
  { title: "Grow reputation", desc: "Reviews unlock better partnerships." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-sky-wash/40 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mx-auto mb-12 max-w-xl text-center text-heading-lg text-midnight-ink">
          Four steps to a launched campaign
        </h2>
        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-5 hidden border-t border-dashed border-steel/25 md:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="font-roboto-mono relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-steel/15 bg-white text-sm text-signal-blue shadow-product-card">
                {i + 1}
              </span>
              <h3 className="mb-1.5 text-heading-sm text-graphite">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------- CTA ----------------------------------- */

function CTA({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="rounded-cards-lg border border-steel/10 bg-linen-canvas p-12 text-center shadow-feature-section lg:p-16">
          <h2 className="mx-auto mb-4 max-w-xl text-heading-lg text-midnight-ink">
            Your next partnership starts here
          </h2>
          <p className="mx-auto mb-8 max-w-md text-body text-ash">
            Join the brands and creators running campaigns on Byparsathy.
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
          <p className="mt-1 text-sm text-ash">Brand to promoter collaborations, made in Nepal.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#platform" className="text-sm text-ash transition-colors hover:text-signal-blue">Platform</a>
          <a href="#how" className="text-sm text-ash transition-colors hover:text-signal-blue">How it works</a>
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
        <NicheMarquee />
        <div id="business" />
        <Platform />
        <div id="creators" />
        <Audiences />
        <HowItWorks />
        <CTA isAuthed={isAuthed} role={user?.role} />
      </main>
      <Footer />
    </div>
  );
}
