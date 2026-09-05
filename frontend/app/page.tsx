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
  PartyPopper,
  BadgeCheck,
  Heart,
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
        scrolled ? "border-b border-steel/10 bg-linen-canvas/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-medium text-midnight-ink">
          <span className="-rotate-6 flex h-8 w-8 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white shadow-product-card">B</span>
          Byparsathy
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-custom transition-colors hover:text-signal-blue"
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
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-custom transition-colors hover:text-signal-blue">
                Sign in
              </Link>
              <Link href="/register">
                <Button className="shadow-product-card">Get started</Button>
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
              <span className="text-lg font-medium text-midnight-ink">Byparsathy</span>
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
                  className="block rounded-buttons px-3 py-3 text-sm font-medium text-slate-custom transition-colors hover:bg-sky-wash"
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

const LAB_DATA: Record<string, { name: string; meta: string; score: number; color: string; bars: { label: string; value: number; max: number }[] }> = {
  Food: {
    name: "Supriya Thapa",
    meta: "Food and lifestyle · 42K followers",
    score: 96,
    color: "#ffa64d",
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
    color: "#16ca2e",
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
    color: "#145aff",
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
    color: "#f26052",
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
      <div className="absolute -right-4 -top-5 z-10 rotate-6 rounded-pill bg-amber-tag px-4 py-1.5 text-xs font-semibold text-white shadow-product-card">
        <span className="flex items-center gap-1"><PartyPopper size={12} /> {d.score}% match</span>
      </div>
      <div className="absolute -left-3 bottom-16 z-10 -rotate-6 rounded-pill bg-white px-4 py-1.5 text-xs font-semibold text-emerald-status shadow-product-card border border-steel/10">
        <span className="flex items-center gap-1"><BadgeCheck size={12} /> Verified</span>
      </div>

      <div className="relative overflow-hidden rounded-cards-lg border-2 border-midnight-ink/80 bg-white p-6 shadow-feature-section sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <p className="rounded-pill bg-midnight-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">Try the matcher</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-status">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-status opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-status" />
            </span>
            Live
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {LAB_NICHES.map((n) => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={`rounded-pill px-4 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
                niche === n
                  ? "bg-signal-blue text-white shadow-product-card"
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
                stroke={d.color}
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
            <p className="truncate text-base font-semibold text-graphite">{d.name}</p>
            <p className="truncate text-xs text-ash">{d.meta}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-badges bg-amber-tag/15 px-2 py-0.5 text-[11px] font-semibold text-amber-tag">
              <Star size={11} className="fill-amber-tag" /> Top pick for {niche}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t-2 border-dashed border-steel/15 pt-5">
          {d.bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-graphite">{b.label}</span>
                <span className="font-roboto-mono text-ash">{b.value}/{b.max}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sky-wash">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(b.value / b.max) * 100}%`, background: d.color }}
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
    <section className="relative overflow-hidden pb-16 pt-28 lg:pb-24 lg:pt-32">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 40% at 12% 20%, rgba(255,166,77,0.25) 0%, rgba(252,252,252,0) 70%), radial-gradient(50% 45% at 88% 15%, rgba(22,202,46,0.18) 0%, rgba(252,252,252,0) 70%), radial-gradient(70% 55% at 50% 0%, rgba(182,203,253,0.55) 0%, rgba(240,244,254,0.5) 45%, rgba(252,252,252,0) 75%)",
        }}
      />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-10">
        <div className="text-left">
          <span className="mb-5 inline-flex -rotate-2 items-center gap-1.5 rounded-pill bg-midnight-ink px-4 py-1.5 text-xs font-semibold text-white shadow-product-card">
            <Zap size={12} className="text-amber-tag" />
            Made in Nepal, for Nepal
          </span>

          <h1 className="mb-5 text-display text-midnight-ink">
            Find your{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="absolute inset-x-0 bottom-1 top-1/2 -z-10 -rotate-1 rounded-sm bg-amber-tag/40" />
              perfect match
            </span>
            <br />make something great
          </h1>

          <p className="mb-8 max-w-md text-body leading-relaxed text-graphite/80">
            Brands post briefs. Creators bring the buzz. Byparsathy scores the fit so every collab starts at yes.
          </p>

          {isAuthed ? (
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <Link href={dash}>
                <Button className="h-12 px-7 text-base shadow-product-card">Open dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="mb-10 grid max-w-md grid-cols-2 gap-3">
              <Link
                href="/register?role=BUSINESS"
                className="group rounded-cards border-2 border-midnight-ink/80 bg-white p-4 shadow-product-card transition-all hover:-translate-y-1 hover:rotate-1"
              >
                <p className="font-semibold text-graphite">I am a brand</p>
                <p className="mt-0.5 text-xs text-ash">Hire creators <ArrowUpRight size={11} className="inline text-signal-blue" /></p>
              </Link>
              <Link
                href="/register?role=PROMOTER"
                className="group rounded-cards bg-signal-blue p-4 shadow-product-card transition-all hover:-translate-y-1 hover:-rotate-1"
              >
                <p className="font-semibold text-white">I am a creator</p>
                <p className="mt-0.5 text-xs text-white/70">Get hired <ArrowUpRight size={11} className="inline" /></p>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[
                "https://randomuser.me/api/portraits/women/44.jpg",
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/68.jpg",
                "https://randomuser.me/api/portraits/men/75.jpg",
              ].map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="Creator" loading="lazy" className="h-9 w-9 rounded-full border-2 border-linen-canvas object-cover" />
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-linen-canvas bg-emerald-status text-[10px] font-semibold text-white">+9</span>
            </div>
            <p className="text-xs leading-snug text-ash">Creators getting<br />hired this week</p>
          </div>
        </div>

        <MatchLab />
      </div>
    </section>
  );
}

/* --------------------------------- ticker ---------------------------------- */

const TICKS = [
  { text: "Supriya booked a festival collab", dot: "bg-amber-tag" },
  { text: "Aashish hit 89% on a gadget brief", dot: "bg-signal-blue" },
  { text: "Divya got verified", dot: "bg-emerald-status" },
  { text: "Niraj published a travel reel", dot: "bg-coral-alert" },
  { text: "Kabita landed her first brand deal", dot: "bg-amber-tag" },
];

function Ticker() {
  const row = [...TICKS, ...TICKS];
  return (
    <section aria-label="Marketplace activity" className="overflow-hidden border-y-2 border-midnight-ink/80 bg-white py-4">
      <div className="animate-marquee-x flex w-max items-center gap-8 pr-8">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-graphite">
            <span className={`inline-block h-2 w-2 rounded-full ${t.dot}`} />
            {t.text}
          </span>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- spotlight -------------------------------- */

const SPOTLIGHT = [
  { name: "Supriya Thapa", niche: "Food", tag: "bg-amber-tag/15 text-amber-tag", location: "Kathmandu", followers: "42K", rating: "4.9", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Aashish Karki", niche: "Tech", tag: "bg-signal-blue/10 text-signal-blue", location: "Lalitpur", followers: "31K", rating: "4.8", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Niraj Tamang", niche: "Travel", tag: "bg-emerald-status/10 text-emerald-status", location: "Pokhara", followers: "28K", rating: "4.9", img: "https://randomuser.me/api/portraits/men/75.jpg" },
  { name: "Divya Shrestha", niche: "Fashion", tag: "bg-coral-alert/10 text-coral-alert", location: "Kathmandu", followers: "56K", rating: "5.0", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Kabita Rai", niche: "Wellness", tag: "bg-amber-tag/15 text-amber-tag", location: "Bhaktapur", followers: "15K", rating: "4.8", img: "https://randomuser.me/api/portraits/women/17.jpg" },
];

function Spotlight() {
  return (
    <section id="creators" className="overflow-hidden bg-linen-canvas py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-block -rotate-2 rounded-pill bg-emerald-status px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">Fresh faces</p>
            <h2 className="text-heading-lg text-midnight-ink">Creators brands love</h2>
          </div>
          <Link href="/register?role=BUSINESS" className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-blue hover:opacity-80">
            Hire one <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-4 px-6 lg:mx-auto lg:w-full lg:max-w-[1200px] lg:grid lg:grid-cols-5 lg:overflow-visible">
          {SPOTLIGHT.map((c, i) => (
            <div
              key={c.name}
              className={`w-52 flex-shrink-0 overflow-hidden rounded-cards-lg border-2 border-midnight-ink/80 bg-white transition-transform hover:-translate-y-1.5 hover:rotate-1 lg:w-auto ${i % 2 === 1 ? "lg:translate-y-4" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={`${c.name}, ${c.niche} creator`} loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-4">
                <span className={`mb-2 inline-block rounded-badges px-2 py-0.5 text-[11px] font-semibold ${c.tag}`}>{c.niche}</span>
                <p className="truncate text-sm font-semibold text-graphite">{c.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ash">
                  <MapPin size={10} /> {c.location}
                </p>
                <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-steel/15 pt-3">
                  <span className="font-roboto-mono text-xs text-graphite">{c.followers}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-tag">
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

/* -------------------------------- trust band ------------------------------- */

const TRUST = [
  { value: "Rs 0", label: "to join, brands and creators", bg: "bg-amber-tag/15", text: "text-amber-tag" },
  { value: "100", label: "point scoring on every match", bg: "bg-signal-blue/10", text: "text-signal-blue" },
  { value: "2-way", label: "reviews keep everyone honest", bg: "bg-emerald-status/10", text: "text-emerald-status" },
];

function TrustBand() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-4 px-6 text-center sm:grid-cols-3">
        {TRUST.map((t) => (
          <div key={t.label} className={`rounded-cards-lg border-2 border-midnight-ink/80 p-8 ${t.bg}`}>
            <p className={`font-roboto-mono mb-2 text-heading-lg ${t.text}`}>{t.value}</p>
            <p className="mx-auto max-w-[220px] text-sm font-medium text-graphite">{t.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ brands/creators ----------------------------- */

function Brands() {
  return (
    <section id="brands" className="bg-sky-wash/50 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-2 inline-block rotate-2 rounded-pill bg-signal-blue px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">For brands</p>
          <h2 className="mb-4 text-heading-lg text-midnight-ink">Fill your feed with fans</h2>
          <p className="mb-6 max-w-md text-body leading-relaxed text-steel">
            Post one brief and watch ranked creators roll in. Chat, approve, publish, all in a single happy thread.
          </p>
          <ul className="mb-8 flex flex-col gap-3">
            {["Ranked shortlists in hours, not weeks", "Chat and approvals in one place", "Pay for buzz, not guesswork"].map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm font-medium text-graphite">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-status/15">
                  <Check size={12} className="text-emerald-status" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register?role=BUSINESS">
            <Button className="shadow-product-card">
              <span className="flex items-center gap-2">Start hiring <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
        <div className="-rotate-1 rounded-cards-lg border-2 border-midnight-ink/80 bg-white p-6 shadow-feature-section sm:p-7">
          <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">This week on your brief</p>
          <p className="mb-4 text-heading-sm text-graphite">Festival snack launch</p>
          <div className="flex flex-col gap-2">
            {[
              { name: "Supriya Thapa", score: 96, bar: "bg-amber-tag" },
              { name: "Kabita Rai", score: 90, bar: "bg-emerald-status" },
              { name: "Divya Shrestha", score: 84, bar: "bg-signal-blue" },
            ].map((m, i) => (
              <div key={m.name} className="rounded-cards border border-steel/10 bg-linen-canvas px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-3 text-sm font-semibold text-graphite">
                    <span className="font-roboto-mono text-xs text-fog">0{i + 1}</span>
                    {m.name}
                  </span>
                  <span className="font-roboto-mono text-sm text-signal-blue">{m.score}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white">
                  <div className={`h-full rounded-full ${m.bar}`} style={{ width: `${m.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Creators() {
  return (
    <section className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 rotate-1 rounded-cards-lg border-2 border-midnight-ink/80 bg-white p-6 shadow-feature-section sm:p-7 lg:order-1">
          <div className="mb-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Creator profile preview" loading="lazy" className="h-12 w-12 rounded-full border-2 border-amber-tag object-cover" />
            <div>
              <p className="text-sm font-semibold text-graphite">Supriya Thapa</p>
              <p className="text-xs text-ash">Food · Kathmandu</p>
            </div>
            <span className="ml-auto inline-flex -rotate-3 items-center gap-1 rounded-pill bg-emerald-status px-2.5 py-1 text-[11px] font-semibold text-white">
              <Heart size={10} className="fill-white" /> Verified
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { k: "Followers", v: "42K", bg: "bg-amber-tag/15" },
              { k: "Rating", v: "4.9", bg: "bg-signal-blue/10" },
              { k: "Collabs", v: "18", bg: "bg-emerald-status/10" },
            ].map((s) => (
              <div key={s.k} className={`rounded-cards ${s.bg} p-3 text-center`}>
                <p className="font-roboto-mono text-sm font-medium text-graphite">{s.v}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-ash">{s.k}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-2 inline-block -rotate-2 rounded-pill bg-coral-alert px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">For creators</p>
          <h2 className="mb-4 text-heading-lg text-midnight-ink">Your audience pays rent now</h2>
          <p className="mb-6 max-w-md text-body leading-relaxed text-steel">
            One profile, zero gatekeeping. Brands find you by vibe and numbers, then the deals roll in.
          </p>
          <ul className="mb-8 flex flex-col gap-3">
            {["Discovered by niche, not follower count", "One-click applies to matched briefs", "Reviews that raise your rates"].map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm font-medium text-graphite">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-tag/20">
                  <Check size={12} className="text-amber-tag" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register?role=PROMOTER">
            <Button className="bg-midnight-ink shadow-product-card">
              <span className="flex items-center gap-2">Join the fun <ArrowRight size={16} /></span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- steps ---------------------------------- */

const STEPS = [
  { title: "Say hello", desc: "A profile takes minutes, promise.", bg: "bg-amber-tag", tilt: "-rotate-2" },
  { title: "Match up", desc: "Scores point both sides to the one.", bg: "bg-signal-blue", tilt: "rotate-2" },
  { title: "Make stuff", desc: "Briefs, drafts, and high fives in one thread.", bg: "bg-emerald-status", tilt: "-rotate-2" },
  { title: "Glow up", desc: "Reviews stack up and rates follow.", bg: "bg-coral-alert", tilt: "rotate-2" },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mx-auto mb-12 max-w-xl text-center text-heading-lg text-midnight-ink">
          Easy as one, two, yum
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`rounded-cards-lg border-2 border-midnight-ink/80 bg-linen-canvas p-6 transition-transform hover:-translate-y-1.5 ${s.tilt} hover:rotate-0`}>
              <span className={`font-roboto-mono mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white ${s.bg}`}>
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
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-sky-wash/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[800px] px-6">
        <h2 className="mb-10 text-center text-heading-lg text-midnight-ink">Curious minds ask</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`overflow-hidden rounded-cards border-2 transition-all ${isOpen ? "rotate-0 border-midnight-ink/80 bg-white shadow-product-card" : "border-steel/10 bg-white/70 -rotate-[0.5deg]"}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-heading-sm text-graphite">{f.q}</span>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-signal-blue text-white" : "bg-sky-wash text-signal-blue"}`}>
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </span>
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
        <div className="relative overflow-hidden rounded-cards-lg bg-signal-blue p-12 text-center shadow-feature-section lg:p-16">
          <span className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <span className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
          <span className="absolute right-10 top-8 hidden rotate-12 rounded-pill bg-amber-tag px-4 py-1.5 text-xs font-semibold text-white sm:block">
            Free to join
          </span>
          <div className="relative">
            <h2 className="mx-auto mb-4 max-w-xl text-heading-lg text-white">
              Come for the match, stay for the magic
            </h2>
            <p className="mx-auto mb-8 max-w-md text-body text-white/80">
              Pick a side. Your first collaboration is minutes away.
            </p>
            {isAuthed ? (
              <Link href={dash}>
                <Button className="h-12 bg-white px-6 text-base font-semibold text-signal-blue hover:opacity-90">Open dashboard</Button>
              </Link>
            ) : (
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <Link href="/register?role=BUSINESS" className="flex-1 rounded-buttons bg-white px-4 py-3 text-sm font-semibold text-signal-blue transition-transform hover:-translate-y-0.5">
                  I am a brand
                </Link>
                <Link href="/register?role=PROMOTER" className="flex-1 rounded-buttons bg-midnight-ink px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                  I am a creator
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  const cols = [
    { title: "Platform", links: [
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
    <footer className="border-t-2 border-midnight-ink/80 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-medium text-midnight-ink">
              <span className="-rotate-6 flex h-7 w-7 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white">B</span>
              Byparsathy
            </p>
            <p className="mt-2 max-w-xs text-sm text-ash">
              Where brands meet creators and great collabs happen.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-caption font-semibold uppercase tracking-wider text-graphite">{col.title}</h4>
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
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ash">
            Made with <Heart size={12} className="fill-coral-alert text-coral-alert" /> in Nepal
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
        <Ticker />
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
