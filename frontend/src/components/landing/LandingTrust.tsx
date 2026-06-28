import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Verified creators" },
  { value: "120+", label: "Businesses" },
  { value: "900+", label: "Campaigns" },
  { value: "98%", label: "Successful collabs" },
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

export default function LandingTrust() {
  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-[1200px] mx-auto px-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item} className="text-center">
              <p className="text-3xl sm:text-4xl font-medium text-midnight-ink mb-2 tracking-[-0.22px]">
                {stat.value}
              </p>
              <p className="text-[10px] text-slate font-normal">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
