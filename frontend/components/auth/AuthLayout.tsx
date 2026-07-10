"use client";

import { type ReactNode } from "react";
import Link from "next/link";
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

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linen-canvas flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative overflow-hidden">
        <div className="absolute inset-0 hero-radial-wash" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-linen-canvas/80" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link href="/" className="flex items-center gap-2 text-lg font-medium text-white">
            Byparsathy
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-heading-lg text-white mb-4"
            >
              Where businesses and creators build successful partnerships.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-body text-white/80 mb-10"
            >
              Byparsathy connects businesses with verified local promoters using smart
              matching. Manage campaigns, collaborate, and track results — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-cards-lg p-5"
            >
              <p className="text-caption font-medium uppercase tracking-widest text-white/90 mb-4">
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
                    <span className="w-5 h-5 rounded-full bg-emerald-status/20 border border-emerald-status/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-status" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-xs text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/70">
            <span>© 2026 Byparsathy</span>
            <Link href="/" className="hover:text-white transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 text-lg font-medium mb-8 lg:hidden">
            <span className="text-signal-blue">Byparsathy</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-custom/10 rounded-cards-lg p-8"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
