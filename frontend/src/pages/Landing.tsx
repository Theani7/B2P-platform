import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckSquare,
  MessageSquare,
  FileText,
  ShieldCheck,
  BarChart2,
  Check,
  ArrowRight,
  Star,
  Building2,
  UserCircle,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";
import "./Landing.css";

/* ─── Nav ─────────────────────────────────────────────────────── */

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-0.5 text-lg font-medium">
          <span className="text-[#7F77DD]">B2P</span>
          <span className="text-gray-900">Connect</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900">How it works</a>
          <a href="#for-who" className="text-sm text-gray-500 hover:text-gray-900">For promoters</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">Log in</Link>
          <Link to="/register" className="bg-[#D85A30] text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90">Get started</Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="py-20 bg-white text-center">
      <div className="max-w-4xl mx-auto px-6">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-[#EEEDFE] text-[#3C3489] text-[11px] font-medium uppercase tracking-widest rounded-full px-4 py-1.5 mb-8">
          <Sparkles size={14} />
          Nepal's first business-to-promoter platform
        </div>

        {/* H1 */}
        <h1 className="text-4xl font-medium leading-tight tracking-tight text-gray-900 max-w-2xl mx-auto mb-6">
          Connect with the right <span className="text-[#7F77DD]">promoters</span> for every campaign
        </h1>

        {/* Subtext */}
        <p className="text-sm font-normal text-gray-500 leading-relaxed max-w-lg mx-auto mb-8">
          B2P Connect matches your business with verified local promoters using smart scoring — by niche, audience, location, and track record.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <Link to="/register" className="bg-[#D85A30] text-white rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90">Start a campaign</Link>
          <a href="#how-it-works" className="bg-white border border-gray-200 rounded-lg px-6 py-3 text-sm text-gray-700 hover:opacity-90">See how it works</a>
        </div>

        {/* Mockup */}
        <Mockup />

        <p className="text-xs text-gray-400 mt-10">Trusted by 200+ businesses and promoters across Nepal</p>
      </div>
    </section>
  );
}

/* ─── Mockup ──────────────────────────────────────────────────── */

function Mockup() {
  return (
    <div className="max-w-2xl mx-auto mt-12 flex items-start justify-center gap-4">

      {/* Left — Your campaigns */}
      <div className="w-44 bg-white border border-gray-100 rounded-xl p-4 opacity-80 text-left">
        <p className="text-[11px] font-medium text-gray-500 mb-3">Your campaigns</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EEEDFE] text-[#3C3489]">Active</span>
            <span className="text-xs text-gray-900 truncate">Summer Launch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAEEDA] text-[#633806]">Pending</span>
            <span className="text-xs text-gray-900 truncate">Monsoon Series</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EAF3DE] text-green-800">Completed</span>
            <span className="text-xs text-gray-900 truncate">New Year Promo</span>
          </div>
        </div>
      </div>

      {/* Center — Top matched promoters */}
      <div className="w-64 bg-white border border-gray-100 rounded-xl p-5 text-left">
        <p className="text-[11px] font-medium text-gray-500 mb-4">Top matched promoters</p>
        <div className="flex flex-col gap-3.5">
          <PromoterRow initials="SP" bg="bg-[#EEEDFE]" color="text-[#3C3489]" name="Sushma Pandey" meta="Food & lifestyle · 42K" score="96%" />
          <PromoterRow initials="RP" bg="bg-[#E1F5EE]" color="text-[#085041]" name="Roshan Poudel" meta="Travel · 28K" score="91%" />
          <PromoterRow initials="AM" bg="bg-[#FAEEDA]" color="text-[#633806]" name="Anita Maharjan" meta="Wellness · 15K" score="88%" />
        </div>
        <div className="border-t border-gray-100 mt-4 pt-3 grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-sm font-medium text-gray-900">47</p>
            <p className="text-[10px] text-gray-400">Matched</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">82%</p>
            <p className="text-[10px] text-gray-400">Avg score</p>
          </div>
        </div>
      </div>

      {/* Right — Deliverables */}
      <div className="w-44 bg-white border border-gray-100 rounded-xl p-4 opacity-80 text-left">
        <p className="text-[11px] font-medium text-gray-500 mb-3">Deliverables</p>
        <div className="flex flex-col gap-2.5">
          <DeliverableRow icon={<CheckCircle2 size={14} className="text-[#085041]" />} label="3 Instagram stories" />
          <DeliverableRow icon={<CheckCircle2 size={14} className="text-[#085041]" />} label="Product photo set" />
          <DeliverableRow icon={<AlertCircle size={14} className="text-[#633806]" />} label="Instagram reel (60s)" />
          <DeliverableRow icon={<Circle size={14} className="text-gray-300" />} label="TikTok cross-post" />
        </div>
      </div>
    </div>
  );
}

function PromoterRow({ initials, bg, color, name, meta, score }: {
  initials: string;
  bg: string;
  color: string;
  name: string;
  meta: string;
  score: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center text-[11px] font-medium flex-shrink-0`}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-900 truncate">{name}</p>
        <p className="text-[10px] text-gray-400 truncate">{meta}</p>
      </div>
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E1F5EE] text-[#085041] flex-shrink-0">
        {score}
      </span>
    </div>
  );
}

function DeliverableRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-gray-600 truncate">{label}</span>
    </div>
  );
}

/* ─── Logo Bar ────────────────────────────────────────────────── */

function LogoBar() {
  const logos = [
    "Himalayan Brew Co.",
    "Yak & Yeti",
    "Thamel Kitchen",
    "Nepal Organics",
    "Sherpa Outfitters",
    "KTM Wellness",
  ];

  return (
    <section className="py-8 border-y border-gray-100 bg-white">
      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 text-center mb-5">
        Businesses already on B2P Connect
      </p>
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-center flex-wrap gap-x-8 gap-y-3">
        {logos.map((name) => (
          <span key={name} className="text-sm font-medium text-gray-600 opacity-50">{name}</span>
        ))}
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────── */

const features = [
  {
    icon: <Sparkles size={20} />,
    iconBg: "bg-[#EEEDFE]",
    title: "Smart matching engine",
    desc: "Scored by niche, location, audience size, and past ratings. Know exactly why each match is recommended.",
  },
  {
    icon: <CheckSquare size={20} />,
    iconBg: "bg-[#E1F5EE]",
    title: "Deliverables tracker",
    desc: "Define tasks, collect proof uploads, and approve work — all inside the platform. No WhatsApp chaos.",
  },
  {
    icon: <MessageSquare size={20} />,
    iconBg: "bg-[#FAECE7]",
    title: "In-app messaging",
    desc: "Every collaboration has its own thread. Keep communication tied to the campaign, not scattered across inboxes.",
  },
  {
    icon: <FileText size={20} />,
    iconBg: "bg-[#FAEEDA]",
    title: "Campaign brief builder",
    desc: "Structured briefs with deliverables, tone, hashtags, and deadlines. Sent with every collaboration request.",
  },
  {
    icon: <ShieldCheck size={20} />,
    iconBg: "bg-[#EEEDFE]",
    title: "Verified promoters",
    desc: "Admin-verified profiles with linked social accounts. Know who you're working with before you send a request.",
  },
  {
    icon: <BarChart2 size={20} />,
    iconBg: "bg-[#E1F5EE]",
    title: "Analytics dashboard",
    desc: "Track campaign performance, acceptance rates, and promoter ROI across all your active and past campaigns.",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#7F77DD] mb-3">Platform features</p>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Everything a campaign needs, in one place</h2>
          <p className="text-sm font-normal text-gray-500 leading-relaxed max-w-xl mx-auto">
            From finding the right promoter to tracking deliverables and collecting reviews — B2P Connect handles the full collaboration lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-6">
              <div className={`w-10 h-10 rounded-lg ${f.iconBg} flex items-center justify-center mb-4 text-gray-900`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────── */

const steps = [
  { num: 1, title: "Create a campaign", desc: "Set your goals, budget, niche, and location. Takes under 5 minutes." },
  { num: 2, title: "Get matched", desc: "Our engine scores and ranks verified promoters for your campaign automatically." },
  { num: 3, title: "Collaborate", desc: "Send requests, chat, share briefs, and track deliverables — all in one workspace." },
  { num: 4, title: "Review and repeat", desc: "Rate the collaboration. Re-invite top performers to your next campaign in one click." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#7F77DD] mb-3">How it works</p>
          <h2 className="text-2xl font-medium text-gray-900">From campaign brief to completed collab</h2>
        </div>

        <div className="relative grid grid-cols-4 gap-6">
          {/* Connecting arrows */}
          <div className="absolute top-4 left-[14%] right-[14%] h-px bg-gray-100 hidden lg:block" />

          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EEEDFE] text-[#3C3489] font-medium flex items-center justify-center text-sm mb-4 relative z-10 bg-white">
                {s.num}
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm font-normal text-gray-500 leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight size={16} className="text-gray-300 absolute top-4 -right-3 hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── For Who ─────────────────────────────────────────────────── */

const businessFeatures = [
  "Smart promoter matching by score",
  "Campaign brief builder",
  "Deliverables approval flow",
  "Analytics and ROI tracking",
];

const promoterFeatures = [
  "Verified profile with portfolio",
  "Inbound collaboration requests",
  "Availability calendar",
  "Rating and review history",
];

function ForWho() {
  return (
    <section id="for-who" className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Built for both sides of the deal</h2>
          <p className="text-sm font-normal text-gray-500 leading-relaxed max-w-lg mx-auto">
            B2P Connect works equally well whether you're a business launching campaigns or a promoter building your career.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Business card */}
          <div className="border border-gray-100 rounded-xl p-7">
            <Building2 size={28} className="text-[#7F77DD] mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">For businesses</h3>
            <p className="text-sm font-normal text-gray-500 leading-relaxed mb-5">
              Launch campaigns, find matched promoters, and manage every collaboration from one dashboard.
            </p>
            <ul className="flex flex-col gap-2.5 mb-6">
              {businessFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center bg-[#D85A30] text-white rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90">
              Start as a business
            </Link>
          </div>

          {/* Promoter card */}
          <div className="border border-gray-100 rounded-xl p-7">
            <UserCircle size={28} className="text-[#1D9E75] mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">For promoters</h3>
            <p className="text-sm font-normal text-gray-500 leading-relaxed mb-5">
              Get discovered by businesses that match your niche, manage requests, and build your verified portfolio.
            </p>
            <ul className="flex flex-col gap-2.5 mb-6">
              {promoterFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center bg-[#7F77DD] text-white rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90">
              Join as a promoter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Bar ───────────────────────────────────────────────── */

const stats = [
  { value: "200+", label: "Verified promoters" },
  { value: "80+", label: "Businesses onboarded" },
  { value: "340+", label: "Campaigns completed" },
  { value: "4.7", label: "Avg platform rating" },
];

function StatsBar() {
  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-medium text-[#7F77DD] mb-1">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────────────────── */

const testimonials = [
  {
    stars: 5,
    quote: "We used to spend hours on Instagram finding promoters. B2P Connect showed us the top matches in minutes and the brief builder meant no back-and-forth on expectations.",
    initials: "PK",
    avatarBg: "bg-[#EEEDFE]",
    avatarColor: "text-[#3C3489]",
    name: "Priya Karmacharya",
    role: "Marketing head, Himalayan Brew Co.",
  },
  {
    stars: 5,
    quote: "As a promoter, I was tired of cold DMs from random brands. Now businesses that actually fit my content style come to me. The workspace keeps everything organized.",
    initials: "SP",
    avatarBg: "bg-[#E1F5EE]",
    avatarColor: "text-[#085041]",
    name: "Sushma Pandey",
    role: "Lifestyle creator, Kathmandu",
  },
  {
    stars: 5,
    quote: "The match score gave us confidence we were picking the right promoters. Our last campaign had 3x better engagement than what we ran through WhatsApp groups.",
    initials: "RS",
    avatarBg: "bg-[#FAEEDA]",
    avatarColor: "text-[#633806]",
    name: "Rajan Shrestha",
    role: "Founder, Nepal Organics",
  },
];

function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-medium text-gray-900 text-center mb-12">What people say</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#BA7517] fill-[#BA7517]" />
                ))}
              </div>
              <p className="text-sm font-normal text-gray-500 leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.avatarBg} ${t.avatarColor} flex items-center justify-center text-[11px] font-medium`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="py-20 bg-white text-center">
      <div className="max-w-xl mx-auto px-6">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Ready to run your first campaign?</h2>
        <p className="text-sm font-normal text-gray-500 leading-relaxed mb-8">
          Join 200+ businesses and promoters already using B2P Connect to work smarter.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="bg-[#D85A30] text-white rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90">Create your first campaign</Link>
          <Link to="/register" className="bg-white border border-gray-200 rounded-lg px-6 py-3 text-sm text-gray-700 hover:opacity-90">Browse promoters</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="py-8 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-0.5 text-lg font-medium">
          <span className="text-[#7F77DD]">B2P</span>
          <span className="text-gray-900">Connect</span>
        </Link>

        <div className="flex items-center gap-5 text-xs text-gray-400">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900">How it works</a>
          <a href="#" className="hover:text-gray-900">Privacy</a>
          <a href="#" className="hover:text-gray-900">Terms</a>
          <a href="#" className="hover:text-gray-900">Contact</a>
        </div>

        <p className="text-xs text-gray-400">© 2026 B2P Connect, Nepal</p>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <ForWho />
      <StatsBar />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
