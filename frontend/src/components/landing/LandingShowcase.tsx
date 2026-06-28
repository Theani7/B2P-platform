import { motion } from "framer-motion";
import { MessageSquare, BarChart2, FolderOpen, Bell } from "lucide-react";

const screens = [
  { name: "Business Dashboard", desc: "Overview of campaigns, applications, and top matches.", icon: BarChart2 },
  { name: "Campaign Marketplace", desc: "Browse and apply to open campaigns from verified businesses.", icon: FolderOpen },
  { name: "Real-time Chat", desc: "Collaboration threads keep every conversation in context.", icon: MessageSquare },
  { name: "Notifications", desc: "Smart alerts for applications, requests, and review updates.", icon: Bell },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function LandingShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-linen-canvas">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-medium uppercase tracking-widest text-signal-blue mb-3">
            Platform
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-midnight-ink tracking-[-0.22px] mb-4">
            Built for the way you work
          </h2>
          <p className="text-sm text-slate leading-relaxed max-w-xl mx-auto">
            Every screen is designed for clarity, speed, and zero friction.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {screens.map((screen) => (
            <motion.div key={screen.name} variants={item} className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-[rgba(0,0,0,0.1)_0px_0px_4px_-2px] transition-all duration-200">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-lg bg-linen-canvas border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-teal-200 transition-colors">
                  <screen.icon size={18} className="text-slate group-hover:text-teal transition-colors" />
                </span>
                <div>
                  <p className="text-sm font-medium text-midnight-ink mb-1">{screen.name}</p>
                  <p className="text-sm text-slate leading-relaxed">{screen.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
