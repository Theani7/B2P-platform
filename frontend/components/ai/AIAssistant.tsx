"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAssistantChat, type ChatHistoryItem } from "@/features/ai/api";
import { useCampaigns } from "@/features/campaigns/api";
import { Sparkles, Send, X, Loader2, Target } from "lucide-react";
import { notifyError } from "@/lib/notify";
import { renderMarkdown } from "@/lib/renderMarkdown";

const SUGGESTIONS: Record<string, string[]> = {
  BUSINESS: [
    "How many campaigns do I have and what's their status?",
    "How do I find and invite promoters?",
    "What are AI match scores?",
    "How do I review submitted deliverables?",
  ],
  PROMOTER: [
    "What open campaigns can I apply to right now?",
    "How do I complete my profile?",
    "What is the verified badge?",
    "How do I submit deliverables?",
  ],
  ADMIN: [
    "What can I moderate as admin?",
    "How do I approve verifications?",
  ],
};

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const { user } = useAuth();
  const role = user?.role ?? "BUSINESS";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [focusCampaignId, setFocusCampaignId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm B2P Assistant. I can see your live account data — ask me about your campaigns, suggest the best promoters for a campaign, or recommend open campaigns for you to apply to.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = useAssistantChat();
  const { data: campaignsData } = useCampaigns({ limit: 50 }, { enabled: role === "BUSINESS" });
  const campaigns = campaignsData?.items ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, chat.isPending, open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || chat.isPending) return;
    const history: ChatHistoryItem[] = messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    try {
      const res = await chat.mutateAsync({
        message: content,
        role,
        history,
        campaignId: focusCampaignId || undefined,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res?.text || "Sorry, I couldn't respond." },
      ]);
    } catch {
      notifyError("Assistant is unavailable. Check the API key and try again.");
      setMessages((prev) => prev);
    }
  };

  const suggestions = (SUGGESTIONS[role] ?? SUGGESTIONS.BUSINESS).filter(
    (s) => !messages.some((m) => m.role === "user" && m.content === s)
  );

  const contextActions: string[] =
    role === "BUSINESS"
      ? focusCampaignId
        ? [
            `Who are the best promoters for ${campaigns.find((c) => c.id === focusCampaignId)?.title || "this campaign"} and why?`,
            "Summarize this campaign's match analysis.",
          ]
        : ["Pick a campaign above to get promoter suggestions."]
      : role === "PROMOTER"
        ? ["Which open campaigns fit my niche best?", "Recommend campaigns I haven't applied to yet."]
        : [];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Assistant"
        className="fixed bottom-6 right-6 z-[300] w-14 h-14 rounded-full bg-signal-blue text-white shadow-product-card flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Sparkles size={22} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[300] w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-8rem))] bg-white rounded-cards-lg border border-slate-custom/10 shadow-product-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-custom/10 bg-signal-blue/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-graphite">
              <Sparkles size={16} className="text-signal-blue" />
              B2P Assistant
            </div>
            <button onClick={() => setOpen(false)} className="text-steel hover:text-graphite">
              <X size={18} />
            </button>
          </div>

          {role === "BUSINESS" && (
            <div className="px-3 py-2 border-b border-slate-custom/10 bg-linen-canvas/60">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ash mb-1">
                <Target size={12} className="text-signal-blue" /> Focus campaign (for promoter suggestions)
              </label>
              <select
                value={focusCampaignId}
                onChange={(e) => setFocusCampaignId(e.target.value)}
                className="w-full h-9 px-2 text-xs rounded-inputs border border-slate-custom/10 bg-white outline-none focus:border-signal-blue/40"
              >
                <option value="">No specific campaign</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} · {c.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] text-sm px-3 py-2 rounded-cards ${
                    m.role === "user"
                      ? "bg-signal-blue text-white rounded-br-sm whitespace-pre-wrap"
                      : "bg-linen-canvas text-graphite border border-slate-custom/10 rounded-bl-sm"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.role === "user" ? m.content : renderMarkdown(m.content),
                  }}
                />
              </div>
            ))}

            {chat.isPending && (
              <div className="flex justify-start">
                <div className="bg-linen-canvas border border-slate-custom/10 rounded-cards rounded-bl-sm px-3 py-2 flex items-center gap-2 text-sm text-steel">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              </div>
            )}

            {messages.length <= 1 && suggestions.length > 0 && (
              <div className="pt-2 space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left text-xs text-signal-blue bg-signal-blue/5 hover:bg-signal-blue/10 border border-signal-blue/10 rounded-button px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {contextActions.length > 0 && messages.length > 1 && (
              <div className="pt-1 space-y-2">
                {contextActions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left text-xs text-graphite bg-sky-wash/60 hover:bg-sky-wash border border-slate-custom/10 rounded-button px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-slate-custom/10 p-3 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the platform…"
              className="flex-1 text-sm px-3 py-2 rounded-button border border-slate-custom/10 bg-linen-canvas outline-none focus:border-signal-blue/40"
            />
            <button
              type="submit"
              disabled={chat.isPending || !input.trim()}
              className="w-9 h-9 rounded-full bg-signal-blue text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
