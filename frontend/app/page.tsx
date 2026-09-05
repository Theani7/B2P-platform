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
  Heart,
  Smile,
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
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.98] opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- nav ---------------------------------- */

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#creators", label: "Creators" },
  { href: "#stories", label: "Why us" },
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
        scrolled ? "bg-linen-canvas/85 shadow-product-card backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-midnight-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-signal-blue text-base font-semibold text-white shadow-product-card">B</span>
          Byparsathy
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-steel/10 bg-white/70 px-2 py-1.5 backdrop-blur-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-custom transition-colors hover:bg-sky-wash hover:text-midnight-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <Link href={dash}>
              <Button className="rounded-full">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-custom transition-colors hover:text-midnight-ink">
                Sign in
              </Link>
              <Link href="/register">
                <Button className="rounded-full shadow-product-card">Get started free</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-2xl bg-white p-2.5 text-slate-custom shadow-product-card md:hidden"
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
          <div className="fixed bottom-0 right-0 top-0 z-50 flex w-72 flex-col rounded-l-3xl bg-linen-canvas md:hidden">
            <div className="flex h-[72px] items-center justify-between border-b border-steel/10 px-6">
              <span className="text-lg font-semibold text-midnight-ink">Byparsathy</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-white p-2 text-slate-custom shadow-product-card"
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
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-custom transition-colors hover:bg-sky-wash"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-steel/10 p-6">
              {isAuthed ? (
                <Link href={dash} onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" className="w-full rounded-full">Open dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full rounded-full">Sign in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full rounded-full">Get started free</Button>
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
  "https://randomuser.me/api/portraits/men/41.jpg",
];

function Hero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-20 pt-36 lg:pb-28 lg:pt-44">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 35% at 10% 25%, rgba(255,166,77,0.22) 0%, rgba(252,252,252,0) 70%), radial-gradient(40% 35% at 90% 20%, rgba(22,202,46,0.14) 0%, rgba(252,252,252,0) 70%), radial-gradient(80% 55% at 50% 0%, rgba(182,203,253,0.55) 0%, rgba(240,244,254,0.5) 50%, rgba(252,252,252,0) 78%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <Reveal>
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-graphite shadow-product-card">
            <Smile size={14} className="text-amber-tag" />
            Loved by brands and creators across Nepal
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mx-auto mb-6 max-w-3xl font-display text-6xl font-semibold leading-[1.04] tracking-tight text-midnight-ink md:text-7xl">
            Marketing that feels like <span className="text-signal-blue">friendship</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-steel md:text-lg">
            Meet creators who genuinely love what you sell. Chat, collaborate, and grow together, all in one happy place.
          </p>
        </Reveal>

        <Reveal delay={220}>
          {isAuthed ? (
            <div className="mb-12 flex justify-center">
              <Link href={dash}>
                <Button className="h-14 rounded-full px-8 text-base shadow-product-card">Open dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="mx-auto mb-12 flex max-w-lg flex-col gap-3 sm:flex-row">
              <Link href="/register?role=BUSINESS" className="flex-1 rounded-full bg-signal-blue px-6 py-4 text-center text-sm font-semibold text-white shadow-product-card transition-transform hover:-translate-y-0.5">
                I am a brand
              </Link>
              <Link href="/register?role=PROMOTER" className="flex-1 rounded-full bg-white px-6 py-4 text-center text-sm font-semibold text-graphite shadow-product-card transition-transform hover:-translate-y-0.5">
                I am a creator
              </Link>
            </div>
          )}
        </Reveal>

        <Reveal delay={280}>
          <div className="mb-3 flex items-center justify-center">
            <div className="flex -space-x-3">
              {HERO_AVATARS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="Happy creator" loading="lazy" className="h-11 w-11 rounded-full border-[3px] border-linen-canvas object-cover shadow-product-card" />
              ))}
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-linen-canvas bg-midnight-ink text-[10px] font-semibold text-white">You?</span>
            </div>
          </div>
          <p className="mb-12 inline-flex items-center gap-1.5 text-sm text-ash">
            Join the friendliest marketplace in town
            <Heart size={13} className="fill-coral-alert text-coral-alert" />
          </p>
        </Reveal>

        <Reveal delay={340}>
          <div className="relative mx-auto w-full max-w-[560px] text-left">
            <div className="rounded-[2rem] border border-steel/10 bg-white p-6 shadow-feature-section sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-status/15 text-xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-graphite">You have a new match!</p>
                  <p className="text-xs text-ash">Food and lifestyle · 96% fit</p>
                </div>
              </div>
              <div className="rounded-3xl bg-sky-wash/60 p-4">
                <p className="text-sm leading-relaxed text-graphite">
                  “Your snack launch is perfect for my audience. I already have three video ideas!”
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <span className="flex-1 rounded-full bg-signal-blue py-2.5 text-center text-xs font-semibold text-white">Say hello</span>
                <span className="flex-1 rounded-full bg-steel/10 py-2.5 text-center text-xs font-semibold text-steel">Peek profile</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- love notes -------------------------------- */

const NOTES = [
  { emoji: "💬", title: "Chat that feels human", body: "Real conversations attached to real work. No cold emails, no ghosting." },
  { emoji: "⭐", title: "Reviews you can trust", body: "Both sides rate every collab, so good work always gets noticed." },
  { emoji: "🛡️", title: "Safe by design", body: "Verified profiles and clear briefs keep surprises out of the picture." },
];

function LoveNotes() {
  return (
    <section id="stories" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="mb-12 text-center">
          <h2 className="mx-auto max-w-xl font-display text-4xl font-semibold tracking-tight text-midnight-ink md:text-5xl">
            Why everyone stays for dessert
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {NOTES.map((n, i) => (
            <Reveal key={n.title} delay={i * 100} className="rounded-[2rem] bg-linen-canvas p-8 text-center transition-transform hover:-translate-y-1">
              <p className="mb-4 text-4xl">{n.emoji}</p>
              <h3 className="mb-2 font-display text-2xl font-medium tracking-tight text-graphite">{n.title}</h3>
              <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-ash">{n.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- how it works ------------------------------ */

const STEPS = [
  { emoji: "🌱", title: "Plant your profile", desc: "Tell us who you are and what you love. It takes minutes, not meetings." },
  { emoji: "🔍", title: "Find your people", desc: "Browse by vibe and niche, or let smart matches tap you on the shoulder." },
  { emoji: "💌", title: "Say hello", desc: "Chat directly, agree on the fun stuff, and start creating together." },
  { emoji: "🌟", title: "Shine together", desc: "Publish, review each other, and watch the next invite roll in." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-sky-wash/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="mb-12 text-center">
          <h2 className="mx-auto max-w-xl font-display text-4xl font-semibold tracking-tight text-midnight-ink md:text-5xl">
            Easy as Sunday morning
          </h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90} className="rounded-[2rem] bg-white p-7 shadow-product-card">
              <p className="mb-4 text-4xl">{s.emoji}</p>
              <p className="font-roboto-mono mb-2 text-xs text-signal-blue">Step {i + 1}</p>
              <h3 className="mb-2 font-display text-xl font-medium tracking-tight text-graphite">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- directory -------------------------------- */

const DIRECTORY = [
  { name: "Supriya", niche: "Food lover", img: "https://randomuser.me/api/portraits/women/44.jpg", bg: "bg-amber-tag/20" },
  { name: "Aashish", niche: "Tech geek", img: "https://randomuser.me/api/portraits/men/32.jpg", bg: "bg-signal-blue/10" },
  { name: "Niraj", niche: "Wanderer", img: "https://randomuser.me/api/portraits/men/75.jpg", bg: "bg-emerald-status/10" },
  { name: "Divya", niche: "Style star", img: "https://randomuser.me/api/portraits/women/68.jpg", bg: "bg-coral-alert/10" },
];

function Directory() {
  return (
    <section id="creators" className="overflow-hidden bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="mb-10 text-center">
          <h2 className="mx-auto max-w-xl font-display text-4xl font-semibold tracking-tight text-midnight-ink md:text-5xl">
            Say hi to your next favorite creator
          </h2>
        </Reveal>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-5 px-6 lg:mx-auto lg:w-full lg:max-w-[1000px] lg:grid lg:grid-cols-4 lg:overflow-visible">
          {DIRECTORY.map((c, i) => (
            <Reveal key={c.name} delay={i * 80} className={`w-56 flex-shrink-0 lg:w-auto ${i % 2 === 1 ? "lg:mt-8" : ""}`}>
              <div className="overflow-hidden rounded-[2rem] bg-white text-center shadow-product-card">
                <div className={`${c.bg} px-6 pb-0 pt-6`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={`${c.name}, creator`} loading="lazy" className="mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-product-card" />
                </div>
                <div className="p-5">
                  <p className="font-display text-xl font-medium text-graphite">{c.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-ash">{c.niche}</p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-status/10 px-3 py-1 text-[11px] font-semibold text-emerald-status">
                    <Star size={10} className="fill-emerald-status" /> Open to collabs
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal className="mt-10 text-center">
        <Link href="/register?role=BUSINESS" className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-blue hover:opacity-80">
          Meet everybody <ArrowRight size={15} />
        </Link>
      </Reveal>
    </section>
  );
}

/* --------------------------------- audiences ------------------------------- */

function Audiences() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1100px] gap-5 px-6 md:grid-cols-2">
        <Reveal className="rounded-[2.5rem] bg-midnight-ink p-9 lg:p-12">
          <p className="mb-3 text-4xl">🏪</p>
          <h3 className="mb-3 font-display text-3xl font-medium tracking-tight text-white">Brands, come hungry</h3>
          <p className="mb-7 max-w-sm text-sm leading-relaxed text-white/70">
            Post a brief at breakfast, wake up to creators who already love what you sell.
          </p>
          <Link href="/register?role=BUSINESS" className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-midnight-ink transition-transform hover:-translate-y-0.5">
            Start hiring
          </Link>
        </Reveal>
        <Reveal delay={120} className="rounded-[2.5rem] bg-amber-tag/20 p-9 lg:p-12">
          <p className="mb-3 text-4xl">🎨</p>
          <h3 className="mb-3 font-display text-3xl font-medium tracking-tight text-graphite">Creators, shine bright</h3>
          <p className="mb-7 max-w-sm text-sm leading-relaxed text-steel">
            One profile, endless dinner invitations from brands in your niche. Bring appetite.
          </p>
          <Link href="/register?role=PROMOTER" className="inline-block rounded-full bg-graphite px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
            Join the party
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQS = [
  {
    q: "Is it really free to join?",
    a: "Yes! Building a profile costs nothing. Businesses only pay for the campaigns they run.",
  },
  {
    q: "How do matches work?",
    a: "Every creator gets a friendly score out of 100 for your brief, and you always see exactly why.",
  },
  {
    q: "What if we disagree mid-project?",
    a: "Everything lives in one shared thread with clear deliverables, so surprises are rare and fixes are fast.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[720px] px-6">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink md:text-5xl">Curious? Good.</h2>
        </Reveal>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className={`overflow-hidden rounded-3xl transition-all ${isOpen ? "bg-white shadow-product-card" : "bg-white/60"}`}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                  >
                    <span className="font-display text-lg font-medium text-graphite">{f.q}</span>
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg transition-colors ${isOpen ? "bg-signal-blue text-white" : "bg-sky-wash text-signal-blue"}`}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-6 text-sm leading-relaxed text-ash sm:px-6">{f.a}</p>
                  )}
                </div>
              </Reveal>
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
      <Reveal className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[2.5rem] bg-signal-blue px-6 py-16 text-center shadow-feature-section lg:py-20">
        <span className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <span className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-white/10" />
        <span className="absolute left-8 top-8 hidden text-3xl sm:block">✨</span>
        <span className="absolute bottom-8 right-10 hidden text-3xl sm:block">🎈</span>
        <div className="relative">
          <h2 className="mx-auto mb-4 max-w-xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Ready for your happily ever after?
          </h2>
          <p className="mx-auto mb-9 max-w-md text-white/80">
            Your perfect brand-creator match is one click away. No frogs, we checked.
          </p>
          {isAuthed ? (
            <Link href={dash} className="inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold text-signal-blue transition-transform hover:-translate-y-0.5">
              Open dashboard
            </Link>
          ) : (
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <Link href="/register?role=BUSINESS" className="flex-1 rounded-full bg-white px-6 py-4 text-sm font-semibold text-signal-blue transition-transform hover:-translate-y-0.5">
                I am a brand
              </Link>
              <Link href="/register?role=PROMOTER" className="flex-1 rounded-full bg-midnight-ink px-6 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                I am a creator
              </Link>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

function Footer() {
  const cols = [
    { title: "Wander", links: [
      { label: "How it works", href: "#how" },
      { label: "Creators", href: "#creators" },
      { label: "Why us", href: "#stories" },
    ] },
    { title: "Company", links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "#faq" },
    ] },
    { title: "Fine print", links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ] },
  ];
  return (
    <footer className="rounded-t-[2.5rem] bg-midnight-ink">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-xl font-semibold text-white">Byparsathy 💛</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
              Where brands meet creators and everybody leaves smiling.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Byparsathy. All smiles reserved.</p>
          <p className="flex items-center gap-1.5 text-xs text-white/40">
            Made with <MapPin size={12} /> in Nepal
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
        <LoveNotes />
        <HowItWorks />
        <Directory />
        <Audiences />
        <Faq />
        <CTA isAuthed={isAuthed} role={user?.role} />
      </main>
      <Footer />
    </div>
  );
}
