import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  "Discover verified creators",
  "Manage campaigns",
  "Portfolio showcase",
  "Real-time collaboration",
  "Secure messaging",
  "Analytics",
  "Reviews & reputation",
  "Notifications",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 via-brand-purple-50/30 to-brand-indigo/5" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link to="/" className="flex items-center gap-2 text-lg font-medium text-brand-purple">
            <span className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center text-white">
              <Zap size={16} />
            </span>
            Byparsathy
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl xl:text-3xl font-medium text-gray-900 tracking-tight leading-snug mb-4"
            >
              Where businesses and creators build successful partnerships.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm text-gray-500 leading-relaxed mb-10"
            >
              Byparsathy connects businesses with verified local promoters using smart
              matching. Manage campaigns, collaborate, and track results — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">
                Platform capabilities
              </p>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, idx) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                    className="flex items-center gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-teal-50 border border-brand-teal-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-xs text-gray-600">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <span>© 2026 Byparsathy</span>
            <Link to="/" className="hover:text-gray-600 transition-colors">Back to home</Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 text-lg font-medium mb-8 lg:hidden">
            <span className="w-7 h-7 rounded-lg bg-brand-purple flex items-center justify-center text-white">
              <Zap size={14} />
            </span>
            <span className="text-brand-purple">Byparsathy</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
