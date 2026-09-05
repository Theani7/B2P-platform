"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linen-canvas px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 35% at 12% 20%, rgba(255,166,77,0.16) 0%, rgba(252,252,252,0) 70%), radial-gradient(45% 35% at 88% 15%, rgba(22,202,46,0.10) 0%, rgba(252,252,252,0) 70%), radial-gradient(80% 55% at 50% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0.45) 50%, rgba(252,252,252,0) 78%)",
        }}
      />

      <div className="animate-pop-in relative w-full max-w-md rounded-[2rem] border border-steel/10 bg-white p-8 shadow-feature-section sm:p-10">
        <Link
          href="/"
          aria-label="Close and go home"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-wash/70 text-ash transition-colors hover:bg-sky-wash hover:text-graphite"
        >
          <X size={16} />
        </Link>

        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white">B</span>
          <span className="text-lg font-medium text-midnight-ink">Byparsathy</span>
        </Link>

        <div className="animate-fade-slide-up">
          {children}
        </div>
      </div>

      <p className="absolute bottom-5 text-xs text-fog">
        Protected by email verification · Made in Nepal
      </p>
    </div>
  );
}
