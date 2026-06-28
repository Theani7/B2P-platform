import { ReactNode } from "react";
import { Link } from "react-router-dom";
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
    <div className="min-h-screen bg-stone-50 flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative bg-stone-100 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link to="/" className="flex items-center gap-2 text-lg font-medium text-brand-purple">
            Byparsathy
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl xl:text-3xl font-medium text-stone-900 font-stretch-condensed leading-snug mb-4"
            >
              Where businesses and creators build successful partnerships.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm text-stone-900 leading-relaxed mb-10"
            >
              Byparsathy connects businesses with verified local promoters using smart
              matching. Manage campaigns, collaborate, and track results — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-stone-100 rounded-xl p-5"
            >
              <p className="text-[11px] font-medium uppercase tracking-widest text-stone-900 mb-4">
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
                    <span className="w-5 h-5 rounded-full bg-brand-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-xs text-stone-900">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-900">
            <span>© 2026 Byparsathy</span>
            <Link to="/" className="hover:text-brand-purple transition-colors">Back to home</Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 text-lg font-medium mb-8 lg:hidden">
            <span className="text-brand-purple">Byparsathy</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-stone-100 rounded-xl p-8"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
