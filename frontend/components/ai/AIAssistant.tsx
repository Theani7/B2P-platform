"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAssistantChat, type ChatHistoryItem } from "@/features/ai/api";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { notifyError } from "@/lib/notify";
import { renderMarkdown } from "@/lib/renderMarkdown";

const SUGGESTIONS: Record<string, string[]> = {
  BUSINESS: [
    "How do I create and publish a campaign?",
    "How do I find and invite promoters?",
    "What are AI match scores?",
    "How do I review submitted deliverables?",
  ],
  PROMOTER: [
    "How do I complete my profile?",
    "How do I apply to a campaign?",
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
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm B2P Assistant. Ask me anything about how the platform works, or how to get the most out of it.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = useAssistantChat();

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
      const res = await chat.mutateAsync({ message: content, role, history });
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
