import { motion } from "framer-motion";
import { CheckCircle2, Search, FolderOpen, MessageSquare } from "lucide-react";

const problems = [
  { icon: Search, title: "Finding creators", desc: "Hours scrolling through profiles with no reliable way to identify real fit." },
  { icon: FolderOpen, title: "Managing outreach", desc: "Spreadsheet chaos, scattered DMs, and lost follow-ups across channels." },
  { icon: MessageSquare, title: "Communication", desc: "No shared context — every message is a new thread and a new risk of misunderstanding." },
];

const solutions = [
  { icon: CheckCircle2, title: "Smart matching", desc: "Promoters scored by niche, audience, location, and track record. See exactly why." },
  { icon: CheckCircle2, title: "Structured workspace", desc: "Briefs, deliverables, and approvals in one place. No more WhatsApp campaigns." },
  { icon: CheckCircle2, title: "Tied communication", desc: "Every message lives inside the collaboration. Full context, zero surprises." },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingProblemSolution() {
  return (
    <section className="py-20 lg:py-28 bg-stone-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-medium uppercase tracking-widest text-brand-purple mb-3">
            Why Byparsathy
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-stone-900 font-stretch-condensed">
            Stop running campaigns in the dark
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-900 mb-6">The old way</p>
            <div className="flex flex-col gap-4">
              {problems.map((p) => (
                <motion.div key={p.title} variants={item} className="flex gap-4 bg-white border border-stone-100 rounded-xl p-5">
                  <span className="w-8 h-8 rounded-lg bg-brand-coral-50 border border-coral-200 flex items-center justify-center flex-shrink-0">
                    <p.icon size={16} className="text-brand-coral" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-900 mb-1">{p.title}</p>
                    <p className="text-sm text-stone-900 leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
            <p className="text-xs font-medium uppercase tracking-widest text-brand-teal mb-6">With Byparsathy</p>
            <div className="flex flex-col gap-4">
              {solutions.map((s) => (
                <motion.div key={s.title} variants={item} className="flex gap-4 bg-white border border-stone-100 rounded-xl p-5">
                  <span className="w-8 h-8 rounded-lg bg-brand-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                    <s.icon size={16} className="text-brand-teal" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-900 mb-1">{s.title}</p>
                    <p className="text-sm text-stone-900 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
