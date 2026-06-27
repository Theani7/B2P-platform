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
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-medium uppercase tracking-widest text-brand-purple mb-3">
            Platform
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-tight mb-4">
            Built for the way you work
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
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
            <motion.div key={screen.name} variants={item} className="group relative bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-brand-indigo-200 transition-colors">
                  <screen.icon size={18} className="text-gray-500 group-hover:text-brand-indigo transition-colors" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{screen.name}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{screen.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
