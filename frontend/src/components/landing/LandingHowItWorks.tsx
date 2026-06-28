import { motion } from "framer-motion";

const businessSteps = [
  { title: "Create a campaign", desc: "Set your goals, budget, niche, and location in under 5 minutes." },
  { title: "Find promoters", desc: "Smart scoring ranks the best matches for your brief automatically." },
  { title: "Collaborate", desc: "Send requests, chat, share briefs, and approve deliverables in one workspace." },
  { title: "Grow your business", desc: "Track results, collect reviews, and re-invite top performers." },
];

const promoterSteps = [
  { title: "Create your profile", desc: "Set up your bio, portfolio, availability, and social links." },
  { title: "Discover campaigns", desc: "Browse matches tailored to your niche and audience." },
  { title: "Work together", desc: "Apply, chat, and deliver — all inside the platform." },
  { title: "Earn reviews", desc: "Build a verified reputation that gets you invited again." },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
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
          className="text-center mb-16"
        >
          <p className="text-[11px] font-medium uppercase tracking-widest text-signal-blue mb-3">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-midnight-ink tracking-[-0.22px]">
            From brief to finished collab
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-signal-blue mb-6">Businesses</p>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col gap-4">
              {businessSteps.map((step, idx) => (
                <motion.div key={step.title} variants={item} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-900 border border-teal-200 flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    {idx < businessSteps.length - 1 && (
                      <span className="w-px flex-1 bg-gray-200 my-2 min-h-[24px]" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium text-midnight-ink mb-1">{step.title}</p>
                    <p className="text-sm text-slate leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal mb-6">Promoters</p>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col gap-4">
              {promoterSteps.map((step, idx) => (
                <motion.div key={step.title} variants={item} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-900 border border-teal-200 flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    {idx < promoterSteps.length - 1 && (
                      <span className="w-px flex-1 bg-gray-200 my-2 min-h-[24px]" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium text-midnight-ink mb-1">{step.title}</p>
                    <p className="text-sm text-slate leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
