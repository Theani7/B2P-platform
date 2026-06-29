import { motion } from "framer-motion";
import { Camera, Trophy, Shield, DollarSign } from "lucide-react";
import { Button } from "../ui/Button";

const features = [
  {
    icon: Trophy,
    title: "Get discovered by brands",
    description: "Complete your profile once and get matched to relevant campaigns automatically.",
  },
  {
    icon: Shield,
    title: "Build verified reputation",
    description: "Earn verified status and reviews from real businesses to stand out from the crowd.",
  },
  {
    icon: DollarSign,
    title: "Set your own rates",
    description: "You control your pricing. Accept or decline offers — no forced commitments.",
  },
  {
    icon: Camera,
    title: "Showcase your work",
    description: "Upload portfolio items, link social accounts, and present your best content.",
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

export default function LandingForPromoters() {
  return (
    <section id="promoters" className="py-20 lg:py-28 bg-sky-wash/40">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={item}
                  className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card"
                >
                  <span className="w-8 h-8 rounded-button bg-emerald-status/10 flex items-center justify-center flex-shrink-0 mb-3">
                    <feature.icon size={16} className="text-emerald-status" />
                  </span>
                  <h3 className="text-sm font-medium text-graphite mb-1">{feature.title}</h3>
                  <p className="text-xs text-steel leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2"
          >
            <p className="text-caption font-medium uppercase tracking-widest text-emerald-status mb-3">
              For promoters
            </p>
            <h2 className="text-heading-lg text-midnight-ink mb-6">
              Turn your audience into income
            </h2>
            <p className="text-body text-steel mb-8 max-w-lg">
              Join Nepal's fastest-growing promoter marketplace. Connect with brands looking for creators
              in your niche, and get paid for authentic promotion.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/register" className="inline-flex">
                <Button variant="primary-filled">Join as a promoter</Button>
              </a>
              <a href="/login" className="inline-flex">
                <Button variant="primary-outlined">Browse campaigns</Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
