import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Create your profile",
    description: "Sign up as a business or promoter. Add your details, niche, and preferences in under 5 minutes.",
  },
  {
    step: "02",
    title: "Get matched or browse",
    description: "Businesses post campaigns. Promoters browse the marketplace or receive AI-matched recommendations.",
  },
  {
    step: "03",
    title: "Collaborate and deliver",
    description: "Agree on terms, submit deliverables, and get feedback — all inside a structured workspace.",
  },
  {
    step: "04",
    title: "Review and grow",
    description: "Leave reviews, build reputation, and unlock better opportunities over time.",
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

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-caption font-medium uppercase tracking-widest text-signal-blue mb-3">
            How it works
          </p>
          <h2 className="text-heading-lg text-midnight-ink max-w-2xl mx-auto">
            Four steps to your next great campaign
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-4 gap-6"
        >
          {steps.map((step) => (
            <motion.div key={step.step} variants={item} className="relative bg-linen-canvas border border-slate-custom/10 rounded-cards p-6 shadow-product-card">
              <span className="text-display text-signal-blue/20 font-semibold absolute top-4 right-4">
                {step.step}
              </span>
              <span className="w-8 h-8 rounded-button bg-sky-wash flex items-center justify-center flex-shrink-0 mb-4">
                <CheckCircle2 size={16} className="text-signal-blue" />
              </span>
              <h3 className="text-heading-sm text-graphite mb-2">{step.title}</h3>
              <p className="text-sm text-ash leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
