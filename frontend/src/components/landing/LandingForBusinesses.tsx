import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Check, ArrowRight } from "lucide-react";

const benefits = [
  "Smart promoter matching by score",
  "Campaign brief builder",
  "Deliverables approval flow",
  "Analytics and ROI tracking",
  "Real-time messaging",
  "Review & rating system",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingForBusinesses() {
  return (
    <section id="businesses" className="py-20 lg:py-28 bg-sky-wash">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] font-medium uppercase tracking-widest text-signal-blue mb-4">
              For businesses
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium text-midnight-ink tracking-[-0.22px] mb-5">
              Launch campaigns that actually perform
            </h2>
            <p className="text-sm text-slate leading-relaxed mb-8 max-w-md">
              Create a campaign in minutes, get matched with verified promoters, and manage the entire
              collaboration from a single dashboard. No more spreadsheets, no more WhatsApp groups.
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
                Start as a business
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <BusinessMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BusinessMockup() {
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
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-4">Campaign overview</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Active", value: "4" },
              { label: "Applications", value: "28" },
              { label: "Top score", value: "96%" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-1">{s.label}</p>
                <p className="text-sm font-medium text-midnight-ink">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-3">Recent applicants</p>
            <div className="flex flex-col gap-3">
              {[
                { name: "Sushma P.", match: 96, status: "New" },
                { name: "Roshan P.", match: 91, status: "New" },
              ].map((a) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-900 flex items-center justify-center text-[10px] font-medium">
                      {a.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-xs text-midnight-ink">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                      {a.status}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-900 border border-teal-200">
                      {a.match}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
