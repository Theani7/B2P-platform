import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

export default function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(97.8%_181.6%_at_53.7%_50%,_rgb(20,20,30)_0%,_rgba(88,107,141,0.8)_100%)]" />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-status opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-status" />
              </span>
              <span className="text-[10px] font-medium text-slate">
                Now serving businesses across Nepal
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-midnight-ink tracking-[-0.76px] leading-[1.1] mb-6">
              Connect with the{" "}
              <span className="text-signal-blue">right promoters</span> for every campaign
            </h1>

            <p className="text-lg text-slate leading-relaxed max-w-lg mb-8">
              Byparsathy matches your business with verified local promoters using smart
              scoring — by niche, audience, location, and track record.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="primary" className="h-12 px-6 text-base border border-primary-action-accent text-primary-action-accent bg-white hover:bg-gray-50">
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
      <div className="absolute -inset-4 bg-[rgba(20,90,255,0.1)] rounded-3xl blur-2xl opacity-60" />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-[rgba(0,0,0,0.1)_0px_0px_4px_-2px] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="w-3 h-3 rounded-full bg-gray-200" />
          <span className="w-3 h-3 rounded-full bg-gray-200" />
          <span className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="flex-1 mx-4">
            <div className="max-w-md mx-auto h-6 bg-white border border-gray-200 rounded-xl flex items-center px-3">
              <span className="text-[10px] text-gray-400 truncate">app.byparsathy.com/dashboard</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-50/50">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Active campaigns</p>
              <p className="text-sm font-medium text-midnight-ink">Summer Launch 2026</p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-900 border border-teal-200">
              Active
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3">Top matched promoters</p>
            <div className="flex flex-col gap-3">
              {[
                { name: "Sushma Pandey", meta: "Food & lifestyle · 42K", score: 96 },
                { name: "Roshan Poudel", meta: "Travel · 28K", score: 91 },
                { name: "Anita Maharjan", meta: "Wellness · 15K", score: 88 },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-900 flex items-center justify-center text-[10px] font-medium">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-midnight-ink">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.meta}</p>
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
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-1">{s.label}</p>
                <p className="text-sm font-medium text-midnight-ink">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-teal-50 text-teal-900 border-teal-200"
      : score >= 70
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${color}`}>
      {score}%
    </span>
  );
}
