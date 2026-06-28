import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-stone-50" />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-stone-100 rounded-full px-3 py-1 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal" />
              </span>
              <span className="text-[10px] font-medium text-stone-900">
                Now serving businesses across Nepal
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-stone-900 font-stretch-condensed leading-[1.1] mb-6">
              Connect with the{" "}
              <span className="text-brand-indigo">right promoters</span> for every campaign
            </h1>

            <p className="text-lg text-stone-900 leading-relaxed max-w-lg mb-8">
              Byparsathy matches your business with verified local promoters using smart
              scoring — by niche, audience, location, and track record.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/register">
                <Button size="lg" className="h-12 px-6 text-base">
                  Get started
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-brand-purple-50 rounded-3xl blur-2xl opacity-60" />
      <div className="relative bg-white border border-stone-100 rounded-xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-900 mb-1">Active campaigns</p>
            <p className="text-sm font-medium text-stone-900">Summer Launch 2026</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-teal-50 text-brand-teal-900 border border-teal-200">
            Active
          </span>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-4 mb-4">
          <p className="text-[11px] font-medium text-stone-900 uppercase tracking-wide mb-3">Top matched promoters</p>
          <div className="flex flex-col gap-3">
            {[
              { name: "Sushma Pandey", meta: "Food & lifestyle · 42K", score: 96 },
              { name: "Roshan Poudel", meta: "Travel · 28K", score: 91 },
              { name: "Anita Maharjan", meta: "Wellness · 15K", score: 88 },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-purple-50 text-brand-purple-900 flex items-center justify-center text-[10px] font-medium">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-900">{p.name}</p>
                    <p className="text-[10px] text-stone-900">{p.meta}</p>
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
            <div key={s.label} className="bg-white border border-stone-100 rounded-xl p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-900 mb-1">{s.label}</p>
              <p className="text-sm font-medium text-stone-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-brand-teal-50 text-brand-teal-900 border-teal-200"
      : score >= 70
        ? "bg-brand-amber-50 text-brand-amber-900 border-amber-200"
        : "bg-stone-100 text-stone-900 border-stone-100";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${color}`}>
      {score}%
    </span>
  );
}
