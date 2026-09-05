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
  Star,
  Zap,
  ChevronDown,
  MapPin,
} from "lucide-react";

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#creators", label: "Creators" },
  { href: "#brands", label: "For Brands" },
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
    name: "Supriya Thapa",
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
    name: "Niraj Tamang",
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
    name: "Aashish Karki",
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
    name: "Divya Shrestha",
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
            <p className="truncate text-sm font-medium text-graphite">{d.name}</p>
            <p className="truncate text-xs text-ash">{d.meta}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-badges bg-sky-wash px-2 py-0.5 text-[11px] font-medium text-signal-blue">
              <Check size={11} /> Verified creator
            </p>
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
          <h1 className="mb-5 text-display text-midnight-ink">
            Find creators.<br />Post briefs.<br /><span className="text-signal-blue">Connect directly.</span>
          </h1>

          <p className="mb-8 max-w-md text-body leading-relaxed text-graphite/80">
            Byparsathy is where brands and creators meet. Browse by niche, get smart-matched on fit, and run the deal with no middlemen.
          </p>

          {isAuthed ? (
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <Link href={dash}>
                <Button className="h-12 px-6 text-base">Open dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="mb-10 grid max-w-md grid-cols-2 gap-3">
              <Link
                href="/register?role=BUSINESS"
                className="group rounded-cards border border-steel/10 bg-white p-4 shadow-product-card transition-all hover:-translate-y-0.5 hover:border-signal-blue/40"
              >
                <p className="font-medium text-graphite">I am a brand</p>
                <p className="mt-0.5 text-xs text-ash">Find creators <ArrowUpRight size={11} className="inline text-signal-blue" /></p>
              </Link>
              <Link
                href="/register?role=PROMOTER"
                className="group rounded-cards bg-midnight-ink p-4 shadow-product-card transition-all hover:-translate-y-0.5"
              >
                <p className="font-medium text-white">I am a creator</p>
                <p className="mt-0.5 text-xs text-white/60">Get discovered <ArrowUpRight size={11} className="inline" /></p>
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {["Free to join for everyone", "Verified profiles only", "Your deal, your terms"].map((t) => (
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

/* -------------------------------- spotlight -------------------------------- */

const SPOTLIGHT = [
  { name: "Supriya Thapa", niche: "Food", location: "Kathmandu", followers: "42K", rating: "4.9", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Aashish Karki", niche: "Tech", location: "Lalitpur", followers: "31K", rating: "4.8", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Niraj Tamang", niche: "Travel", location: "Pokhara", followers: "28K", rating: "4.9", img: "https://randomuser.me/api/portraits/men/75.jpg" },
  { name: "Divya Shrestha", niche: "Fashion", location: "Kathmandu", followers: "56K", rating: "5.0", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Kabita Rai", niche: "Wellness", location: "Bhaktapur", followers: "15K", rating: "4.8", img: "https://randomuser.me/api/portraits/women/17.jpg" },
];

function Spotlight() {
  return (
    <section id="creators" className="overflow-hidden border-y border-steel/10 bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-2 text-heading-lg text-midnight-ink">Creators ready to collaborate</h2>
            <p className="max-w-md text-body text-ash">Verified profiles across every major niche, with audiences and track records you can see.</p>
          </div>
          <Link href="/register?role=BUSINESS" className="inline-flex items-center gap-1.5 text-sm font-medium text-signal-blue hover:opacity-80">
            Browse as a brand <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-4 px-6 lg:mx-auto lg:w-full lg:max-w-[1200px] lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-6">
          {SPOTLIGHT.map((c) => (
            <div key={c.name} className="w-52 flex-shrink-0 overflow-hidden rounded-cards border border-steel/10 bg-linen-canvas lg:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={`${c.name}, ${c.niche} creator`} loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="truncate text-sm font-medium text-graphite">{c.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ash">
                  {c.niche} · <MapPin size={10} /> {c.location}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-steel/10 pt-3">
                  <span className="font-roboto-mono text-xs text-graphite">{c.followers}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-tag">
                    <Star size={12} className="fill-amber-tag" /> {c.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- trust band -------------------------------- */

const TRUST = [
  { value: "Rs 0", label: "to join, for brands and creators" },
  { value: "100", label: "point scoring on every match" },
  { value: "1", label: "workspace from brief to review" },
];

function TrustBand() {
  return (
    <section className="bg-linen-canvas py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 text-center sm:grid-cols-3">
        {TRUST.map((t) => (
          <div key={t.label}>
            <p className="font-roboto-mono mb-2 text-heading-lg text-midnight-ink">{t.value}</p>
            <p className="mx-auto max-w-[220px] text-sm text-ash">{t.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- brands ---------------------------------- */

const BRAND_POINTS = [
  "Search creators by niche, audience, and location",
  "Every application arrives with a match score",
  "Direct chat, clear deliverables, honest reviews",
];

function Brands() {
  return (
    <section id="brands" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-2 text-caption font-medium uppercase tracking-wide text-signal-blue">For brands</p>
          <h2 className="mb-4 text-heading-lg text-midnight-ink">Authentic voices for your story</h2>
          <p className="mb-6 max-w-md text-body leading-relaxed text-steel">
            Read past reviews, compare audiences, and send a brief in minutes. The terms you agree are the terms you keep.
          </p>
          <ul className="mb-8 flex flex-col gap-3">
            {BRAND_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-graphite">
                <Check size={15} className="mt-0.5 flex-shrink-0 text-emerald-status" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register?role=BUSINESS">
            <Button>
              <span className="flex items-center gap-2">Explore for brands <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-linen-canvas p-6 shadow-product-card sm:p-7">
          <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">Sample brief</p>
          <p className="mb-4 text-heading-sm text-graphite">Festival snack launch</p>
          <div className="flex flex-col gap-2">
            {[
              { name: "Supriya Thapa", score: 96 },
              { name: "Kabita Rai", score: 90 },
              { name: "Divya Shrestha", score: 84 },
            ].map((m, i) => (
              <div key={m.name} className="flex items-center justify-between rounded-cards border border-steel/10 bg-white px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-medium text-graphite">
                  <span className="font-roboto-mono text-xs text-fog">0{i + 1}</span>
                  {m.name}
                </span>
                <span className="font-roboto-mono text-sm text-signal-blue">{m.score}%</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-ash">Ranked by fit to your brief</p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- creators --------------------------------- */

const CREATOR_POINTS = [
  "One profile puts you in front of hiring brands",
  "Apply to matched campaigns in one click",
  "Reviews compound into rates you set yourself",
];

function Creators() {
  return (
    <section className="bg-sky-wash/40 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 rounded-cards-lg border border-steel/10 bg-white p-6 shadow-product-card sm:p-7 lg:order-1">
          <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">Creator profile</p>
          <div className="mb-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Creator profile preview" loading="lazy" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-graphite">Supriya Thapa</p>
              <p className="text-xs text-ash">Food · Kathmandu</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-badges bg-emerald-status/10 px-2 py-0.5 text-xs font-medium text-emerald-status">
              <Check size={11} /> Verified
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { k: "Followers", v: "42K" },
              { k: "Rating", v: "4.9" },
              { k: "Collabs", v: "18" },
            ].map((s) => (
              <div key={s.k} className="rounded-cards bg-linen-canvas p-3 text-center">
                <p className="font-roboto-mono text-sm font-medium text-graphite">{s.v}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ash">{s.k}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-2 text-caption font-medium uppercase tracking-wide text-emerald-status">For creators</p>
          <h2 className="mb-4 text-heading-lg text-midnight-ink">Get discovered in your niche</h2>
          <p className="mb-6 max-w-md text-body leading-relaxed text-steel">
            Real brands browse by what you actually do. No follower-count gatekeeping, no agency cut.
          </p>
          <ul className="mb-8 flex flex-col gap-3">
            {CREATOR_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-graphite">
                <Check size={15} className="mt-0.5 flex-shrink-0 text-emerald-status" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register?role=PROMOTER">
            <Button>
              <span className="flex items-center gap-2">Create creator profile <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- steps ---------------------------------- */

const STEPS = [
  { title: "Create your profile", desc: "Business or creator, done in minutes." },
  { title: "Match and apply", desc: "Scores guide both sides to the fit." },
  { title: "Deliver together", desc: "Briefs, drafts, and approvals in one thread." },
  { title: "Review and repeat", desc: "Every collaboration builds your record." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mx-auto mb-12 max-w-xl text-center text-heading-lg text-midnight-ink">
          From signup to published
        </h2>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-cards border border-steel/10 bg-linen-canvas p-6">
              <p className="font-roboto-mono mb-3 text-sm text-signal-blue">0{i + 1}</p>
              <h3 className="mb-1.5 text-heading-sm text-graphite">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{s.desc}</p>
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
    a: "Promoters pass identity and audience verification before they can apply, and review history is visible to hiring businesses.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-linen-canvas py-20 lg:py-28">
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
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="rounded-cards-lg border border-steel/10 bg-linen-canvas p-12 text-center shadow-feature-section lg:p-16">
          <div className="mx-auto mb-6 flex max-w-md items-center justify-center gap-3">
            <Link href="/register?role=BUSINESS" className="flex-1 rounded-buttons border border-steel/15 bg-white px-4 py-3 text-sm font-medium text-graphite transition-colors hover:border-signal-blue/50">
              I am a brand
            </Link>
            <Link href="/register?role=PROMOTER" className="flex-1 rounded-buttons bg-midnight-ink px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
              I am a creator
            </Link>
          </div>
          <h2 className="mx-auto mb-4 max-w-xl text-heading-lg text-midnight-ink">
            Your next collaboration starts here
          </h2>
          <p className="mx-auto mb-2 max-w-md text-body text-ash">
            Free to join. No middlemen. Pick your side to begin.
          </p>
          {isAuthed && (
            <Link href={dash} className="mt-6 inline-block">
              <Button className="h-12 px-6 text-base">Open dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  const cols = [
    { title: "Platform", links: [
      { label: "Matching", href: "#match" },
      { label: "Creators", href: "#creators" },
      { label: "For Brands", href: "#brands" },
      { label: "How it works", href: "#how" },
    ] },
    { title: "Resources", links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "#faq" },
    ] },
    { title: "Legal", links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ] },
  ];
  return (
    <footer className="border-t border-steel/10 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-medium text-signal-blue">
              <span className="flex h-7 w-7 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white">B</span>
              Byparsathy
            </p>
            <p className="mt-2 max-w-xs text-sm text-ash">
              The creator and brand collaboration platform. Direct connections, smart matching.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-caption font-medium uppercase tracking-wider text-graphite">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="text-sm text-ash transition-colors hover:text-signal-blue">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-ash transition-colors hover:text-signal-blue">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-steel/10 pt-8 sm:flex-row">
          <p className="text-xs text-ash">© {new Date().getFullYear()} Byparsathy. All rights reserved.</p>
          <p className="text-xs text-ash">Made in Nepal</p>
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
        <Spotlight />
        <TrustBand />
        <Brands />
        <Creators />
        <HowItWorks />
        <Faq />
        <CTA isAuthed={isAuthed} role={user?.role} />
      </main>
      <Footer />
    </div>
  );
}
