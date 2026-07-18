import { motion } from "framer-motion";
import { Building2, Target, Users, LineChart } from "lucide-react";
import { Button } from "../ui/Button";

const features = [
  {
    icon: Building2,
    title: "Create campaigns in minutes",
    description: "Define your goals, budget, and audience. Our matching engine finds the right promoters automatically.",
  },
  {
    icon: Target,
    title: "Review qualified applicants",
    description: "Every application includes match scores, audience demographics, and past performance data.",
  },
  {
    icon: Users,
    title: "Manage collaborations",
    description: "Briefs, deliverables, approvals, and reviews — all in one structured workspace.",
  },
  {
    icon: LineChart,
    title: "Track ROI and results",
    description: "See campaign performance, engagement rates, and creator impact in real-time dashboards.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingForBusinesses() {
  return (
    <section id="businesses" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-caption font-medium uppercase tracking-widest text-signal-blue mb-3">
              For businesses
            </p>
            <h2 className="text-heading-lg text-midnight-ink mb-6">
              Run campaigns that actually convert
            </h2>
            <p className="text-body text-steel mb-8 max-w-lg">
              Stop guessing which creators to work with. Byparsathy scores promoters by niche, audience quality,
              location, and track record — so you spend time on partnerships that drive results.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/register" className="inline-flex">
                <Button variant="primary-filled">Start a campaign</Button>
              </a>
              <a href="/login" className="inline-flex">
                <Button variant="primary-outlined">See how it works</Button>
              </a>
            </div>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item} className="bg-linen-canvas border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
                <span className="w-8 h-8 rounded-button bg-sky-wash flex items-center justify-center flex-shrink-0 mb-3">
                  <feature.icon size={16} className="text-signal-blue" />
                </span>
                <h3 className="text-sm font-medium text-graphite mb-1">{feature.title}</h3>
                <p className="text-xs text-steel leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
