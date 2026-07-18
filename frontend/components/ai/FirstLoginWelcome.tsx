"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";

const SEEN_KEY = "b2p_welcome_assistant_seen";

const COPY: Record<string, { title: string; body: string; action: string }> = {
  BUSINESS: {
    title: "Meet your AI Assistant",
    body: "New here? There's a B2P Assistant (bottom-right) that can read your live data — ask it to find promoters, draft campaigns, or explain match scores.",
    action: "Try it: \"Who are the best promoters for my campaign?\"",
  },
  PROMOTER: {
    title: "Meet your AI Assistant",
    body: "New here? There's a B2P Assistant (bottom-right) that knows your profile — ask it to find open campaigns, complete your profile, or track applications.",
    action: "Try it: \"What open campaigns fit my niche?\"",
  },
};

export function FirstLoginWelcome() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== Role.BUSINESS && user.role !== Role.PROMOTER) return;
    if (user.lastLoginAt) return;
    if (localStorage.getItem(SEEN_KEY)) return;
    setShow(true);
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, "1");
    setShow(false);
  };

  if (!show) return null;
  const copy = COPY[user!.role] ?? COPY.BUSINESS;

  return (
    <div className="fixed bottom-24 right-6 z-[290] w-[min(360px,calc(100vw-3rem))] bg-white border border-signal-blue/20 rounded-cards-lg shadow-product-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-signal-blue/10 text-signal-blue flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-graphite">{copy.title}</h3>
          <p className="text-xs text-ash mt-1 leading-relaxed">{copy.body}</p>
          <p className="text-xs text-signal-blue font-medium mt-2">{copy.action}</p>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-steel hover:text-graphite flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
