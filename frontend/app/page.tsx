"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";
import {
  Menu,
  X,
  ArrowRight,
  Check,
  Star,
  MapPin,
  Search,
  Sparkles,
  MessagesSquare,
  BadgeCheck,
} from "lucide-react";

/* ------------------------------ scroll reveal ------------------------------ */

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#creators", label: "Creators" },
  { href: "#audiences", label: "Who it is for" },
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

/* ---------------------------------- hero ---------------------------------- */

const HERO_AVATARS = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/17.jpg",
];

const HERO_MATCHES = [
  { niche: "Food and lifestyle", reach: "42K followers", score: 96 },
  { niche: "Travel vlogs", reach: "28K followers", score: 91 },
];

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-16 pt-28 lg:pb-24 lg:pt-36">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0.55) 45%, rgba(252,252,252,0) 75%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <Reveal>
          <h1 className="mx-auto mb-5 max-w-3xl font-display text-6xl font-medium leading-[1.02] tracking-tight text-midnight-ink md:text-7xl">
            Find creators.<br />Post briefs.<br /><span className="text-signal-blue">Connect directly.</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mb-8 max-w-xl text-body leading-relaxed text-graphite/80">
            Byparsathy matches brands with the right creators and runs the whole deal in one place. No middlemen, no hidden fees.
          </p>
        </Reveal>

        <Reveal delay={180}>
          {isAuthed ? (
            <div className="mb-10 flex justify-center">
              <Link href={dash}>
                <Button className="h-12 px-6 text-base">Open dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="mx-auto mb-10 grid max-w-md grid-cols-2 gap-3">
              <Link
                href="/register?role=BUSINESS"
                className="rounded-cards border border-steel/10 bg-white p-4 text-left shadow-product-card transition-all hover:-translate-y-0.5 hover:border-signal-blue/40"
              >
                <p className="text-sm font-semibold text-graphite">I am a brand</p>
                <p className="mt-0.5 text-xs text-ash">Hire creators →</p>
              </Link>
              <Link
                href="/register?role=PROMOTER"
                className="rounded-cards bg-midnight-ink p-4 text-left shadow-product-card transition-all hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-white">I am a creator</p>
                <p className="mt-0.5 text-xs text-white/60">Get discovered →</p>
              </Link>
            </div>
          )}
        </Reveal>

        <Reveal delay={240}>
          <div className="mb-3 flex items-center justify-center">
            <div className="flex -space-x-2.5">
              {HERO_AVATARS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="Creator on Byparsathy" loading="lazy" className="h-9 w-9 rounded-full border-2 border-linen-canvas object-cover" />
              ))}
            </div>
          </div>
          <p className="mb-10 text-sm text-ash">Verified creators across 8 niches, ready to collaborate today</p>
        </Reveal>

        <Reveal delay={300}>
          <div className="relative mx-auto w-full max-w-[520px] text-left">
            <div className="absolute -inset-4 rounded-cards-lg bg-signal-blue/5 blur-2xl" />
            <div className="relative rounded-cards-lg border border-steel/10 bg-white p-6 shadow-feature-section">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-caption font-medium uppercase tracking-wide text-ash">Smart match for your brief</p>
                <span className="inline-flex items-center gap-1.5 rounded-badges bg-emerald-status/10 px-2 py-0.5 text-xs font-medium text-emerald-status">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-status" />
                  Live
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {HERO_MATCHES.map((m) => (
                  <div key={m.niche} className="flex items-center justify-between rounded-cards px-3 py-2.5 hover:bg-sky-wash/60">
                    <div>
                      <p className="text-xs font-medium text-graphite">{m.niche}</p>
                      <p className="text-[10px] text-ash">{m.reach}</p>
                    </div>
                    <span className="font-roboto-mono rounded-badges bg-sky-wash px-2 py-0.5 text-xs font-medium text-signal-blue">
                      {m.score}% fit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- how it works ------------------------------ */

const CHECKS = [
  "Filter by niche, platform, and location",
  "Real audience numbers on every profile",
  "Save and compare your shortlist",
];

function FeatureBlock({
  flip,
  icon: Icon,
  label,
  title,
  desc,
  points,
  visual,
}: {
  flip: boolean;
  icon: typeof Search;
  label: string;
  title: string;
  desc: string;
  points: string[];
  visual: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={flip ? "lg:order-2" : ""}>{visual}</Reveal>
      <Reveal delay={120} className={flip ? "lg:order-1" : ""}>
        <p className="mb-2 text-caption font-medium uppercase tracking-wide text-signal-blue">{label}</p>
        <h3 className="mb-3 font-display text-3xl font-medium tracking-tight text-midnight-ink">{title}</h3>
        <p className="mb-6 max-w-md text-body leading-relaxed text-steel">{desc}</p>
        <ul className="flex flex-col gap-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-graphite">
              <Check size={15} className="mt-0.5 flex-shrink-0 text-emerald-status" />
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

function MockShell({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="rounded-cards-lg border border-steel/10 bg-white p-6 shadow-product-card">
      <p className="mb-4 text-caption font-medium uppercase tracking-wide text-ash">{caption}</p>
      {children}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">How it works</p>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-medium tracking-tight text-midnight-ink md:text-5xl">
            Everything you need, nothing in the way
          </h2>
        </Reveal>

        <div className="flex flex-col gap-20 lg:gap-28">
          <FeatureBlock
            flip={false}
            icon={Search}
            label="Discover"
            title="Browse creators by niche and platform"
            desc="Filter vetted creators across every major niche and platform. Open profiles, see real audiences, and shortlist the ones that fit."
            points={CHECKS}
            visual={
              <MockShell caption="Creator directory">
                <div className="mb-3 flex gap-2">
                  {["All", "Food", "Tech", "Travel"].map((t, i) => (
                    <span key={t} className={`rounded-pill px-3 py-1 text-xs font-medium ${i === 0 ? "bg-midnight-ink text-white" : "bg-sky-wash/70 text-slate-custom"}`}>
                      {t}
                    </span>
                  ))}
                </div>
                {[
                  { n: "Food and lifestyle", r: "42K · 4.9" },
                  { n: "Tech reviews", r: "31K · 4.8" },
                  { n: "Travel vlogs", r: "28K · 4.9" },
                ].map((c) => (
                  <div key={c.n} className="flex items-center justify-between border-t border-steel/10 py-3 first:border-0 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-graphite">{c.n}</span>
                    <span className="font-roboto-mono text-xs text-ash">{c.r}</span>
                  </div>
                ))}
              </MockShell>
            }
          />

          <FeatureBlock
            flip
            icon={Sparkles}
            label="Smart matching"
            title="Matches ranked to your brief"
            desc="Post what you need and the platform surfaces the creators most likely to deliver, ranked by niche overlap and audience fit."
            points={["Ranked by niche and audience fit", "Responsive, collab-ready creators first", "Less scrolling, more shortlisting"]}
            visual={
              <MockShell caption="Ranked by fit to your brief">
                {[
                  { n: "Food and lifestyle", s: 96 },
                  { n: "Wellness", s: 90 },
                  { n: "Fashion", s: 84 },
                ].map((m) => (
                  <div key={m.n} className="mb-3 last:mb-0">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-graphite">{m.n}</span>
                      <span className="font-roboto-mono text-signal-blue">{m.s}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sky-wash">
                      <div className="h-full rounded-full bg-signal-blue" style={{ width: `${m.s}%` }} />
                    </div>
                  </div>
                ))}
              </MockShell>
            }
          />

          <FeatureBlock
            flip={false}
            icon={MessagesSquare}
            label="Connect"
            title="Talk directly. No middlemen."
            desc="When there is a match, both sides connect directly to discuss the brief, agree on terms, and get to work."
            points={["Direct, in-platform conversations", "Negotiate terms in your own words", "Keep the full context of the deal"]}
            visual={
              <MockShell caption="Direct — no middlemen">
                <div className="flex flex-col gap-2">
                  <div className="max-w-[85%] rounded-cards rounded-tl-sm bg-sky-wash/70 px-3.5 py-2.5">
                    <p className="text-xs leading-relaxed text-graphite">Hi! Loved your last food series. Want to collab on our launch?</p>
                  </div>
                  <div className="max-w-[85%] self-end rounded-cards rounded-tr-sm bg-signal-blue px-3.5 py-2.5">
                    <p className="text-xs leading-relaxed text-white">Yes! Send the brief and let us talk timeline.</p>
                  </div>
                </div>
              </MockShell>
            }
          />

          <FeatureBlock
            flip
            icon={BadgeCheck}
            label="Trust"
            title="Built on honest, two-way ratings"
            desc="After every collaboration both sides leave a rating. Reputation is earned through real work, so track records are visible."
            points={["Two-way ratings after each collab", "Verified profiles and companies", "A track record you can trust"]}
            visual={
              <MockShell caption="Collaboration complete · Verified">
                <div className="mb-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} className="fill-amber-tag text-amber-tag" />
                  ))}
                  <span className="font-roboto-mono ml-1 text-xs text-graphite">5.0</span>
                </div>
                <p className="text-sm italic leading-relaxed text-graphite">
                  “Clear brief, fast delivery, great to work with. Would collaborate again.”
                </p>
                <p className="mt-3 text-xs text-ash">Brand review → creator</p>
              </MockShell>
            }
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- directory -------------------------------- */

const DIRECTORY = [
  { name: "Supriya Thapa", tags: ["Food", "Lifestyle"], img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Aashish Karki", tags: ["Tech", "Reviews"], img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Niraj Tamang", tags: ["Travel", "Vlogs"], img: "https://randomuser.me/api/portraits/men/75.jpg" },
  { name: "Divya Shrestha", tags: ["Fashion"], img: "https://randomuser.me/api/portraits/women/68.jpg" },
];

function Directory() {
  return (
    <section id="creators" className="overflow-hidden bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">Directory</p>
            <h2 className="max-w-md font-display text-4xl font-medium tracking-tight text-midnight-ink md:text-5xl">A growing network of real creators</h2>
          </div>
          <Link href="/register?role=BUSINESS" className="inline-flex items-center gap-1.5 text-sm font-medium text-signal-blue hover:opacity-80">
            Browse the full directory <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
      <div className="overflow-x-auto pb-2">
        <Reveal className="flex w-max gap-4 px-6 lg:mx-auto lg:w-full lg:max-w-[1200px] lg:grid lg:grid-cols-4 lg:overflow-visible">
          {DIRECTORY.map((c) => (
            <div key={c.name} className="w-56 flex-shrink-0 overflow-hidden rounded-cards border border-steel/10 bg-white shadow-product-card lg:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={`${c.name}, creator`} loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="truncate text-sm font-medium text-graphite">{c.name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-badges bg-sky-wash px-2 py-0.5 text-[11px] font-medium text-signal-blue">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- audiences -------------------------------- */

function Audiences() {
  return (
    <section id="audiences" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-4 px-6 md:grid-cols-2">
        <Reveal className="rounded-cards-lg bg-sky-wash/60 p-8 lg:p-10">
          <p className="mb-2 text-caption font-medium uppercase tracking-wide text-signal-blue">For brands</p>
          <h3 className="mb-6 font-display text-3xl font-medium tracking-tight text-midnight-ink md:text-4xl">Find voices that represent you</h3>
          <ul className="mb-8 flex flex-col gap-3">
            {["Search by niche, audience, and platform", "Post unlimited briefs", "Direct chat, no commission games", "Honest ratings from past partners"].map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-graphite">
                <Check size={15} className="mt-0.5 flex-shrink-0 text-emerald-status" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register?role=BUSINESS">
            <Button>Explore for brands</Button>
          </Link>
        </Reveal>
        <Reveal delay={120} className="rounded-cards-lg border border-steel/10 bg-linen-canvas p-8 lg:p-10">
          <p className="mb-2 text-caption font-medium uppercase tracking-wide text-emerald-status">For creators</p>
          <h3 className="mb-6 font-display text-3xl font-medium tracking-tight text-midnight-ink md:text-4xl">Get discovered in your niche</h3>
          <ul className="mb-8 flex flex-col gap-3">
            {["Build a profile once, get found often", "Apply to matched briefs in one click", "Showcase work brands can browse", "Reviews that compound over time"].map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-graphite">
                <Check size={15} className="mt-0.5 flex-shrink-0 text-emerald-status" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register?role=PROMOTER">
            <Button variant="ghost">Create creator profile</Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- stats ---------------------------------- */

const STATS = [
  { value: "Rs 0", label: "to join", desc: "Free for brands and creators, no subscription to start." },
  { value: "100", label: "point scoring", desc: "Every match ranked out of 100 with the breakdown shown." },
  { value: "2-way", label: "ratings", desc: "Both sides review, so reputation is earned honestly." },
];

function StatsBand() {
  return (
    <section className="bg-linen-canvas py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 text-center sm:grid-cols-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 100}>
            <p className="font-roboto-mono mb-2 text-heading-lg text-midnight-ink">{s.value}</p>
            <p className="mb-1 text-sm font-medium text-graphite">{s.label}</p>
            <p className="mx-auto max-w-[240px] text-sm text-ash">{s.desc}</p>
          </Reveal>
        ))}
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
    <section id="faq" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[800px] px-6">
        <Reveal className="mb-10 text-center">
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">FAQ</p>
          <h2 className="mb-10 text-center font-display text-4xl font-medium tracking-tight text-midnight-ink md:text-5xl">Questions, answered</h2>
        </Reveal>
        <div className="divide-y divide-steel/10 border-y border-steel/10">
          {FAQS.map((f) => {
            const isOpen = open === FAQS.indexOf(f);
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : FAQS.indexOf(f))}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-heading-sm text-graphite">{f.q}</span>
                  <span className={`text-xl leading-none transition-colors ${isOpen ? "text-signal-blue" : "text-fog"}`}>
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="max-w-2xl pb-6 text-sm leading-relaxed text-ash">{f.a}</p>
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
        <Reveal className="rounded-cards-lg border border-steel/10 bg-white p-12 text-center shadow-feature-section lg:p-16">
          <h2 className="mx-auto mb-4 max-w-xl font-display text-4xl font-medium tracking-tight text-midnight-ink md:text-5xl">
            Ready to make your next collaboration?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-body text-ash">
            Join free today. Post a brief or build your creator profile in minutes.
          </p>
          {isAuthed ? (
            <Link href={dash}>
              <Button className="h-12 px-6 text-base">Open dashboard</Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button className="h-12 px-6 text-base">
                <span className="flex items-center gap-2">Get started free <ArrowRight size={16} /></span>
              </Button>
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  const cols = [
    { title: "Platform", links: [
      { label: "How it works", href: "#how" },
      { label: "Creators", href: "#creators" },
      { label: "Who it is for", href: "#audiences" },
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
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash">
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
        <div className="mt-12 border-t border-steel/10 pt-8">
          <p className="text-xs text-ash">© {new Date().getFullYear()} Byparsathy. All rights reserved.</p>
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
        <HowItWorks />
        <Directory />
        <Audiences />
        <StatsBand />
        <Faq />
        <CTA isAuthed={isAuthed} role={user?.role} />
      </main>
      <Footer />
    </div>
  );
}
