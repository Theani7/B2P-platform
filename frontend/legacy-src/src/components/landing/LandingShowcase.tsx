import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Verified promoters" },
  { value: "120+", label: "Businesses" },
  { value: "900+", label: "Campaigns launched" },
  { value: "4.8/5", label: "Average rating" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-sky-wash/40">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-caption font-medium uppercase tracking-widest text-signal-blue mb-3">
            Trusted by creators and brands
          </p>
          <h2 className="text-heading-lg text-midnight-ink max-w-2xl mx-auto">
            Join a growing community of Nepal's best marketing partnerships
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item} className="text-center">
              <p className="text-heading-lg text-midnight-ink mb-2">
                {stat.value}
              </p>
              <p className="text-body text-ash">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
