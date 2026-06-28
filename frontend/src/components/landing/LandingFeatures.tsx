import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

const features = [
  { title: "Campaign Marketplace", desc: "Create campaigns with structured briefs, budgets, and deliverables. Send invitations or let promoters apply." },
  { title: "Smart Matching", desc: "Promoters scored by niche, audience size, location, and past performance. You always know why a match is recommended." },
  { title: "Real-time Chat", desc: "Every collaboration has its own thread. Keep communication tied to the campaign, not scattered across inboxes." },
  { title: "Portfolio Management", desc: "Promoters build rich portfolios with media and social proofs. Businesses review full work history." },
  { title: "Reviews & Reputation", desc: "Dual review system builds trusted reputations on both sides. Make decisions backed by real feedback." },
  { title: "Analytics Dashboard", desc: "Track campaign performance, acceptance rates, and ROI across all active and past campaigns." },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-medium uppercase tracking-widest text-brand-purple mb-3">
            Platform features
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-stone-900 font-stretch-condensed mb-4">
            Everything a campaign needs, in one place
          </h2>
          <p className="text-sm text-stone-900 leading-relaxed max-w-xl mx-auto">
            From finding the right promoter to tracking deliverables and collecting reviews —
            Byparsathy handles the full collaboration lifecycle.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group bg-white border border-stone-100 rounded-xl p-5 hover:border-brand-purple transition-all duration-150"
            >
              <h3 className="text-sm font-medium text-stone-900 mb-2">{f.title}</h3>
              <p className="text-sm text-stone-900 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Link to="/register">
            <Button variant="secondary" size="md" className="gap-2">
              Explore the platform
              <ArrowRight size={14} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
