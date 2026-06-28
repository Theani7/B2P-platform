import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Check, ArrowRight } from "lucide-react";

const benefits = [
  "Verified profile with portfolio",
  "Inbound collaboration requests",
  "Command palette for quick actions",
  "Rating and review history",
  "Profile sharing & exports",
  "Achievements & reputation",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingForPromoters() {
  return (
    <section id="promoters" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1 hidden lg:block"
          >
            <PromoterMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <p className="text-[11px] font-medium uppercase tracking-widest text-teal mb-4">
              For promoters
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium text-midnight-ink tracking-[-0.22px] mb-5">
              Get discovered by brands that fit your style
            </h2>
            <p className="text-sm text-slate leading-relaxed mb-8 max-w-md">
              Build a verified profile, showcase your portfolio, and receive collaboration requests
              from businesses that match your niche. Grow your reputation with every finished project.
            </p>

            <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col gap-3 mb-8">
              {benefits.map((b) => (
                <motion.li key={b} variants={item} className="flex items-start gap-3 text-sm text-graphite">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-teal" />
                  </span>
                  {b}
                </motion.li>
              ))}
            </motion.ul>

            <Link to="/register">
              <Button size="lg" variant="primary" className="h-11 px-6 border border-primary-action-accent text-primary-action-accent bg-white hover:bg-gray-50">
                Join as a promoter
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PromoterMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-[rgba(20,90,255,0.1)] rounded-3xl blur-2xl opacity-60" />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-[rgba(0,0,0,0.1)_0px_0px_4px_-2px] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="w-3 h-3 rounded-full bg-gray-200" />
          <span className="w-3 h-3 rounded-full bg-gray-200" />
          <span className="w-3 h-3 rounded-full bg-gray-200" />
        </div>
        <div className="p-5 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-900 flex items-center justify-center text-sm font-medium border border-teal-200">
              SP
            </div>
            <div>
              <p className="text-sm font-medium text-midnight-ink">Sushma Pandey</p>
              <p className="text-xs text-gray-400">Food & lifestyle · Kathmandu</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3">Match score breakdown</p>
            <div className="space-y-2">
              {[
                { label: "Niche fit", value: 95 },
                { label: "Audience overlap", value: 88 },
                { label: "Past performance", value: 92 },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate w-28">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full" style={{ width: `${s.value}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-teal w-8 text-right">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Incoming request</p>
            <p className="text-xs text-midnight-ink font-medium">Summer Launch · Himalayan Brew Co.</p>
            <p className="text-[10px] text-gray-400 mt-1">3 Instagram stories · 1 reel · Nrs. 12,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
