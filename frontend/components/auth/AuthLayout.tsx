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
    <div className="min-h-screen flex bg-white selection:bg-signal-blue/20">
      {/* Left side: Premium Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-midnight-ink rounded-r-[40px] m-4 ml-0 shadow-2xl">
        <div className="absolute inset-0 hero-radial-wash opacity-80" />
        
        {/* Abstract decorative shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-signal-blue/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-status/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white/90 tracking-wide uppercase">
              Creator Platform
            </div>
          </div>

          <div className="max-w-xl mx-auto w-full mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[44px] leading-[1.1] font-bold text-white mb-6 tracking-tight"
            >
              Connect with top-tier brands and local creators.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-white/70 font-medium leading-relaxed mb-12"
            >
              The most powerful marketplace for influencer marketing. Build your portfolio, discover opportunities, and manage campaigns effortlessly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, idx) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-white/90">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-white/50 border-t border-white/10 pt-6">
            <span>© 2026 Byparsathy. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:w-1/2 xl:w-5/12 bg-white relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.3]" />
        
        <div className="mx-auto w-full max-w-sm relative">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-midnight-ink mb-12">
            <div className="w-8 h-8 rounded-lg bg-signal-blue flex items-center justify-center">
              <span className="text-white font-bold leading-none">B</span>
            </div>
            Byparsathy
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
