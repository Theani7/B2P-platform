import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-linen-canvas">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-caption font-medium uppercase tracking-widest text-signal-blue mb-3">
            Features
          </p>
          <h2 className="text-heading-lg text-midnight-ink max-w-2xl mx-auto">
            Everything you need to run successful creator campaigns
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="bg-white border border-slate-custom/10 rounded-cards p-6 shadow-product-card"
            >
              <span className="w-8 h-8 rounded-button bg-sky-wash flex items-center justify-center flex-shrink-0 mb-4">
                <feature.icon size={16} className="text-signal-blue" />
              </span>
              <h3 className="text-heading-sm text-graphite mb-2">{feature.title}</h3>
              <p className="text-sm text-ash leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
