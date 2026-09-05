"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Role } from "@/lib/roles";

export type AuthView = "login" | "register";

export function AuthModal({
  open,
  view,
  role,
  onClose,
  onSwitch,
}: {
  open: boolean;
  view: AuthView;
  role: Role.BUSINESS | Role.PROMOTER;
  onClose: () => void;
  onSwitch: (view: AuthView, role?: Role.BUSINESS | Role.PROMOTER) => void;
}) {
  const [render, setRender] = useState(open);

  useEffect(() => {
    if (open) {
      setRender(true);
      document.body.style.overflow = "hidden";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!render && !open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-8 transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      onAnimationEnd={() => {
        if (!open) setRender(false);
      }}
    >
      <div
        className="fixed inset-0 bg-midnight-ink/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md rounded-[2rem] border border-steel/10 bg-white p-8 shadow-feature-section transition-all duration-200 sm:p-10 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-wash/70 text-ash transition-colors hover:bg-sky-wash hover:text-graphite"
        >
          <X size={16} />
        </button>

        <div className="mb-7 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-buttons bg-signal-blue text-sm font-semibold text-white">B</span>
          <span className="text-lg font-medium text-midnight-ink">Byparsathy</span>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-1 rounded-buttons bg-sky-wash/60 p-1">
          {(["login", "register"] as AuthView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onSwitch(v)}
              className={`h-9 rounded-buttons text-sm font-bold transition-all ${
                view === v ? "bg-white text-graphite shadow-sm" : "text-ash hover:text-graphite"
              }`}
            >
              {v === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {view === "login" ? (
          <LoginForm />
        ) : (
          <RegisterForm initialRole={role} />
        )}
      </div>
    </div>
  );
}
