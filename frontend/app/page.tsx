"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Search,
  FolderOpen,
  MessageSquare,
  Building2,
  Target,
  Users,
  LineChart,
  Camera,
  Trophy,
  Shield,
  DollarSign,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
} as const;

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#businesses", label: "For businesses" },
  { href: "#promoters", label: "For promoters" },
];

function LandingNav({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-steel/10 bg-linen-canvas/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-medium text-signal-blue">
          Byparsathy
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
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
              <Button variant="ghost">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm text-slate-custom transition-colors hover:text-signal-blue">
                Sign in
              </Link>
              <Link href="/register">
                <Button variant="ghost">Get started</Button>
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
              {navLinks.map((link) => (
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
                <Link href={dash} onClick={() => setMobileOpen(false)} className="block text-center">
                  <Button variant="primary" className="w-full">Go to dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center">
                    <Button variant="ghost" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block text-center">
                    <Button variant="primary" className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </motion.nav>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "border-steel/10 bg-emerald-status/10 text-emerald-status"
      : score >= 70
        ? "border-steel/10 bg-amber-tag/10 text-amber-tag"
        : "border-steel/10 bg-steel/10 text-steel";
  return (
    <span className={`inline-flex items-center rounded-badges border px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {score}%
    </span>
  );
}

function DashboardMockup() {
  const people = [
    { name: "Sushma Pandey", meta: "Food & lifestyle · 42K", score: 96 },
    { name: "Roshan Poudel", meta: "Travel · 28K", score: 91 },
    { name: "Anita Maharjan", meta: "Wellness · 15K", score: 88 },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-cards-lg bg-primary/5 blur-2xl" />
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-5 shadow-feature-section">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">Active campaigns</p>
            <p className="text-sm font-medium text-graphite">Summer Launch 2026</p>
          </div>
          <span className="inline-flex items-center rounded-badges bg-emerald-status/10 px-2 py-0.5 text-xs font-medium text-emerald-status">
            Active
          </span>
        </div>

        <div className="mb-4 rounded-cards border border-steel/5 bg-linen-canvas p-4">
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-ash">Top matched promoters</p>
          <div className="flex flex-col gap-3">
            {people.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-periwinkle-glow/20 text-[10px] font-medium text-primary-action">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-graphite">{p.name}</p>
                    <p className="text-[10px] text-ash">{p.meta}</p>
                  </div>
                </div>
                <ScoreBadge score={p.score} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Applications", value: "24" },
            { label: "Avg. match score", value: "87%" },
          ].map((s) => (
            <div key={s.label} className="rounded-cards border border-steel/5 bg-linen-canvas p-3">
              <p className="mb-1 text-caption font-medium uppercase tracking-wide text-ash">{s.label}</p>
              <p className="text-sm font-medium text-graphite">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingHero({ isAuthed, role }: { isAuthed: boolean; role?: string }) {
  const dash = DashboardPath[(role as Role) ?? "BUSINESS"];
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(20,90,255,0.12) 0%, rgba(252,252,252,0) 70%)",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >


            <h1 className="mb-6 text-display text-midnight-ink">
              Connect with the <span className="text-signal-blue">right promoters</span> for every campaign
            </h1>

            <p className="mb-8 max-w-lg text-body text-graphite/80">
              Byparsathy matches your business with verified local promoters using smart scoring — by
              niche, audience, location, and track record.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {isAuthed ? (
                <Link href={dash}>
                  <Button className="h-12 px-6 text-base">Go to dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="h-12 px-6 text-base">
                      <span className="flex items-center gap-2">
                        <span>Get started free</span>
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="h-12 px-6 text-base">
                      Book a demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const trustStats = [
  { value: "500+", label: "Verified creators" },
  { value: "120+", label: "Businesses" },
  { value: "900+", label: "Campaigns" },
  { value: "98%", label: "Successful collabs" },
];

function Trust() {
  return (
    <section className="bg-white py-16">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 md:grid-cols-4 md:gap-12"
      >
        {trustStats.map((stat) => (
          <motion.div key={stat.label} variants={item} className="text-center">
            <p className="mb-2 text-heading-lg text-midnight-ink">{stat.value}</p>
            <p className="text-body text-ash">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

const problems = [
  { icon: Search, title: "Finding creators", desc: "Hours scrolling through profiles with no reliable way to identify real fit." },
  { icon: FolderOpen, title: "Managing outreach", desc: "Spreadsheet chaos, scattered DMs, and lost follow-ups across channels." },
  { icon: MessageSquare, title: "Communication", desc: "No shared context — every message is a new thread and a new risk of misunderstanding." },
];

const solutions = [
  { icon: CheckCircle2, title: "Smart matching", desc: "Promoters scored by niche, audience, location, and track record. See exactly why." },
  { icon: CheckCircle2, title: "Structured workspace", desc: "Briefs, deliverables, and approvals in one place. No more WhatsApp campaigns." },
  { icon: CheckCircle2, title: "Tied communication", desc: "Every message lives inside the collaboration. Full context, zero surprises." },
];

function ProblemSolution() {
  return (
    <section className="bg-sky-wash/40 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">Why Byparsathy</p>
          <h2 className="text-heading-lg text-midnight-ink">Stop running campaigns in the dark</h2>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
            <p className="mb-6 text-caption font-medium uppercase tracking-wide text-ash">The old way</p>
            <div className="flex flex-col gap-4">
              {problems.map((p) => (
                <motion.div key={p.title} variants={item} className="flex gap-4 rounded-cards border border-steel/10 bg-white p-5 shadow-product-card">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-buttons border border-coral-alert/20 bg-coral-alert/10">
                    <p.icon size={16} className="text-coral-alert" />
                  </span>
                  <div>
                    <p className="mb-1 text-sm font-medium text-graphite">{p.title}</p>
                    <p className="text-sm leading-relaxed text-ash">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
            <p className="mb-6 text-caption font-medium uppercase tracking-wide text-emerald-status">With Byparsathy</p>
            <div className="flex flex-col gap-4">
              {solutions.map((s) => (
                <motion.div key={s.title} variants={item} className="flex gap-4 rounded-cards border border-steel/10 bg-white p-5 shadow-product-card">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-buttons border border-emerald-status/20 bg-emerald-status/10">
                    <s.icon size={16} className="text-emerald-status" />
                  </span>
                  <div>
                    <p className="mb-1 text-sm font-medium text-graphite">{s.title}</p>
                    <p className="text-sm leading-relaxed text-ash">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Smart matching engine",
    description:
      "Promoters are scored by niche, audience, location, and track record. See exactly why each match fits your campaign.",
    icon: CheckCircle2,
  },
  {
    title: "Verified creators only",
    description:
      "Every promoter goes through identity and audience verification. Work with real creators, not bots.",
    icon: CheckCircle2,
  },
  {
    title: "Structured collaborations",
    description:
      "Briefs, deliverables, approvals, and payments in one workspace. No more WhatsApp chaos.",
    icon: CheckCircle2,
  },
];

function Features() {
  return (
    <section id="features" className="bg-linen-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">Features</p>
          <h2 className="mx-auto max-w-2xl text-heading-lg text-midnight-ink">
            Everything you need to run successful creator campaigns
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="rounded-cards border border-steel/10 bg-white p-6 shadow-product-card"
            >
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-buttons bg-sky-wash">
                <feature.icon size={16} className="text-signal-blue" />
              </span>
              <h3 className="mb-2 text-heading-sm text-graphite">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const businessFeatures = [
  { icon: Building2, title: "Create campaigns in minutes", description: "Define your goals, budget, and audience. Our matching engine finds the right promoters automatically." },
  { icon: Target, title: "Review qualified applicants", description: "Every application includes match scores, audience demographics, and past performance data." },
  { icon: Users, title: "Manage collaborations", description: "Briefs, deliverables, approvals, and reviews — all in one structured workspace." },
  { icon: LineChart, title: "Track ROI and results", description: "See campaign performance, engagement rates, and creator impact in real-time dashboards." },
];

function ForBusinesses() {
  return (
    <section id="businesses" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">For businesses</p>
          <h2 className="mb-6 text-heading-lg text-midnight-ink">Run campaigns that actually convert</h2>
          <p className="mb-8 max-w-lg text-body text-steel">
            Stop guessing which creators to work with. Byparsathy scores promoters by niche, audience quality,
            location, and track record — so you spend time on partnerships that drive results.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button>Start a campaign</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">See how it works</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {businessFeatures.map((feature) => (
            <motion.div key={feature.title} variants={item} className="rounded-cards border border-steel/10 bg-linen-canvas p-5 shadow-product-card">
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-buttons bg-sky-wash">
                <feature.icon size={16} className="text-signal-blue" />
              </span>
              <h3 className="mb-1 text-sm font-medium text-graphite">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-steel">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const promoterFeatures = [
  { icon: Trophy, title: "Get discovered by brands", description: "Complete your profile once and get matched to relevant campaigns automatically." },
  { icon: Shield, title: "Build verified reputation", description: "Earn verified status and reviews from real businesses to stand out from the crowd." },
  { icon: DollarSign, title: "Set your own rates", description: "You control your pricing. Accept or decline offers — no forced commitments." },
  { icon: Camera, title: "Showcase your work", description: "Upload portfolio items, link social accounts, and present your best content." },
];

function ForPromoters() {
  return (
    <section id="promoters" className="bg-sky-wash/40 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="order-2 lg:order-1"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {promoterFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="rounded-cards border border-steel/10 bg-white p-5 shadow-product-card"
              >
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-buttons bg-emerald-status/10">
                  <feature.icon size={16} className="text-emerald-status" />
                </span>
                <h3 className="mb-1 text-sm font-medium text-graphite">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-steel">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="order-1 lg:order-2"
        >
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-emerald-status">For promoters</p>
          <h2 className="mb-6 text-heading-lg text-midnight-ink">Turn your audience into income</h2>
          <p className="mb-8 max-w-lg text-body text-steel">
            Join Nepal&apos;s fastest-growing promoter marketplace. Connect with brands looking for creators
            in your niche, and get paid for authentic promotion.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button>Join as a promoter</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Browse campaigns</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  { step: "01", title: "Create your profile", description: "Sign up as a business or promoter. Add your details, niche, and preferences in under 5 minutes." },
  { step: "02", title: "Get matched or browse", description: "Businesses post campaigns. Promoters browse the marketplace or receive AI-matched recommendations." },
  { step: "03", title: "Collaborate and deliver", description: "Agree on terms, submit deliverables, and get feedback — all inside a structured workspace." },
  { step: "04", title: "Review and grow", description: "Leave reviews, build reputation, and unlock better opportunities over time." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">How it works</p>
          <h2 className="mx-auto max-w-2xl text-heading-lg text-midnight-ink">
            Four steps to your next great campaign
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 md:grid-cols-4"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={item}
              className="relative rounded-cards border border-steel/10 bg-linen-canvas p-6 shadow-product-card"
            >
              <span className="absolute right-4 top-4 font-semibold text-display text-primary/20">{step.step}</span>
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-buttons bg-sky-wash">
                <CheckCircle2 size={16} className="text-signal-blue" />
              </span>
              <h3 className="mb-2 text-heading-sm text-graphite">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ash">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const showcaseStats = [
  { value: "500+", label: "Verified promoters" },
  { value: "120+", label: "Businesses" },
  { value: "900+", label: "Campaigns launched" },
  { value: "4.8/5", label: "Average rating" },
];

function Showcase() {
  return (
    <section className="bg-sky-wash/40 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-caption font-medium uppercase tracking-wide text-signal-blue">
            Trusted by creators and brands
          </p>
          <h2 className="mx-auto max-w-2xl text-heading-lg text-midnight-ink">
            Join a growing community of Nepal&apos;s best marketing partnerships
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 gap-8 px-6 md:grid-cols-4 md:gap-12"
        >
          {showcaseStats.map((stat) => (
            <motion.div key={stat.label} variants={item} className="text-center">
              <p className="mb-2 text-heading-lg text-midnight-ink">{stat.value}</p>
              <p className="text-body text-ash">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="rounded-cards-lg border border-steel/10 bg-linen-canvas p-12 text-center shadow-feature-section lg:p-16"
        >
          <h2 className="mx-auto mb-4 max-w-2xl text-heading-lg text-midnight-ink">
            Ready to transform your marketing?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-body text-ash">
            Join hundreds of businesses and promoters already using Byparsathy to run high-performing campaigns.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button className="h-12 px-6 text-base">
                <span className="flex items-center gap-2">
                  Get started free
                  <ArrowRight size={16} />
                </span>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="h-12 px-6 text-base">
                Contact sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Product", links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "For businesses", href: "#businesses" },
      { label: "For promoters", href: "#promoters" },
    ] },
    { title: "Company", links: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Careers", href: "/" },
    ] },
    { title: "Legal", links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
    ] },
  ];
  return (
    <footer className="border-t border-steel/10 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-medium text-signal-blue">
              Byparsathy
            </Link>
            <p className="mt-2 max-w-xs text-sm text-ash">
              Nepal&apos;s brand-to-promoter collaboration platform. Connect, collaborate, and grow.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-caption font-medium uppercase tracking-wider text-graphite">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ash transition-colors hover:text-signal-blue">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-steel/10 pt-8 sm:flex-row">
          <p className="text-xs text-ash">© {new Date().getFullYear()} Byparsathy. All rights reserved.</p>
          <p className="text-xs text-ash">Made in Nepal 🇳🇵</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const { token, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAuthed = mounted && !!token && !!user;

  return (
    <div className="min-h-screen bg-linen-canvas">
      <LandingNav isAuthed={isAuthed} role={user?.role} />
      <main>
        <LandingHero isAuthed={isAuthed} role={user?.role} />
        <Trust />
        <ProblemSolution />
        <Features />
        <ForBusinesses />
        <ForPromoters />
        <HowItWorks />
        <Showcase />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
