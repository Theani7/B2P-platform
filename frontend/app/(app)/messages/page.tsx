"use client";

import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import { MessageSquare, Target, Wallet, ChevronLeft, Send, Search, Info, Image as ImageIcon } from "lucide-react";
import { useConversations, useChatHistory, useMarkConversationRead, type ChatMessage } from "@/features/chat/api";
import { getSocket, useSocketEvent } from "@/lib/socket";

function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function timeStr(s: string) {
  return new Date(s).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatBudget(n?: number | null) {
  if (!n) return "0";
  return `${n.toLocaleString()}`;
}

function MessagesInner() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const markRead = useMarkConversationRead();
  const history = useChatHistory(activeId ? conversations?.find((c) => c.id === activeId)?.collaborationId ?? "" : "");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations?.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    const conv = conversations?.find((c) => c.id === activeId);
    if (!conv) return;
    history.refetch();
    const socket = getSocket();
    socket.emit("join_conversation", { conversationId: activeId }, (ack: any) => {
      if (!ack?.ok) console.warn("join failed", ack);
    });
    if (conv.unreadCount > 0) markRead.mutate(activeId);
  }, [activeId, conversations]);

  useEffect(() => {
    if (history.data) setMessages(history.data.items.slice().reverse());
  }, [history.data]);

  useSocketEvent("message", (payload: ChatMessage) => {
    if (payload.conversationId === activeId) setMessages((m) => [...m, payload]);
  });
  useSocketEvent("typing_start", (p: any) => {
    if (p.conversationId === activeId) setTyping(true);
  });
  useSocketEvent("typing_stop", (p: any) => {
    if (p.conversationId === activeId) setTyping(false);
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!draft.trim() || !activeId) return;
    const socket = getSocket();
    socket.emit("message", { conversationId: activeId, text: draft.trim() });
    setDraft("");
  };

  const other = active?.participants.find((p) => p.id !== user?.id) ?? active?.participants[0];

  return (
    <div className="mx-auto flex h-[calc(100vh-64px-48px)] max-w-6xl overflow-hidden rounded-2xl border-x border-slate-custom/10 bg-white shadow-product-card-sm ring-1 ring-gray-200">
      <div className={`w-full flex-shrink-0 border-r border-slate-custom/10 md:w-80 ${active ? "hidden md:block" : "block"}`}>
        <div className="flex h-full flex-col bg-white overflow-hidden">
          <div className="border-b border-slate-custom/10 p-4">
            <h2 className="text-lg font-bold text-graphite">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading && <div className="p-4 text-center text-sm text-steel">Loading conversations…</div>}
            {conversations && conversations.length === 0 && (
              <div className="p-4 text-center text-sm text-steel">No active collaborations.</div>
            )}
            <ul className="grid gap-1">
              {conversations?.map((c) => {
                const o = c.participants.find((p) => p.id !== user?.id) ?? c.participants[0];
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border-b border-gray-50 p-3 text-left transition-colors hover:bg-sky-wash ${isActive ? "bg-sky-wash" : ""}`}
                    >
                      <div className="relative">
                        <img src={o?.avatar || "/default-avatar.png"} alt="" className="h-10 w-10 rounded-full bg-sky-wash object-cover" />
                        {c.unreadCount > 0 && (
                          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-coral-alert" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`truncate text-sm ${isActive ? "font-bold text-graphite" : "font-semibold text-midnight-ink"}`}>
                            {o?.name ?? "Unknown"}
                          </h3>
                          {c.lastMessage && (
                            <span className="text-[10px] text-steel">{timeAgo(c.lastMessage.createdAt)}</span>
                          )}
                        </div>
                        <p className={`mt-0.5 truncate text-xs ${c.unreadCount > 0 ? "font-medium text-graphite" : "text-steel"}`}>
                          {c.lastMessage?.messageType === "IMAGE" ? <span className="flex items-center gap-1"><ImageIcon size={12} /> Image</span> : (c.lastMessage?.message || "No messages yet")}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className={`min-w-0 flex-1 flex-col bg-linen-canvas/50 ${active ? "flex" : "hidden md:flex"}`}>
        {active ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-custom/10 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                {active && (
                  <button
                    onClick={() => setActiveId(null)}
                    className="rounded-full p-2 text-ash hover:bg-sky-wash hover:text-graphite md:hidden"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <img src={other?.avatar || "/default-avatar.png"} alt="" className="h-10 w-10 rounded-full bg-sky-wash object-cover" />
                <div>
                  <h2 className="text-sm font-bold text-graphite">{other?.name ?? "Unknown"}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3 text-ash">
                <button className="rounded-full p-2 hover:bg-sky-wash hover:text-graphite transition-colors" aria-label="Search conversation">
                  <Search size={18} />
                </button>
                <button className="rounded-full p-2 hover:bg-sky-wash hover:text-graphite transition-colors" aria-label="Conversation info">
                  <Info size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto bg-white p-6">
              {active.collaborationStatus && active.collaborationStatus !== "ACTIVE" && (
                <div className="mx-auto mb-6 max-w-lg rounded-xl border border-amber-tag/20 bg-amber-tag/10 px-4 py-3 text-center text-sm text-amber-tag shadow-sm">
                  <span className="mb-1 block font-bold">Chat Disabled</span>
                  This collaboration is no longer active. You cannot send new messages. Start a new collaboration to chat again.
                </div>
              )}

              {active.campaignTitle && (
                <div className="mx-auto mb-6 flex max-w-lg flex-col items-center rounded-xl border border-slate-custom/10 bg-linen-canvas px-4 py-3 shadow-sm">
                  <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-fog">Collaboration Details</span>
                  <h4 className="mb-1 flex items-center gap-2 font-bold text-graphite">
                    <Target size={14} className="text-signal-blue" /> {active.campaignTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-status">
                    <Wallet size={12} /> {formatBudget(active.campaignBudget)} Budget
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-cards px-3 py-2 text-body ${mine ? "bg-primary text-white" : "bg-steel/10 text-midnight-ink"}`}
                    >
                      {m.isDeleted ? (
                        <span className="italic opacity-70">Message deleted</span>
                      ) : (
                        <span className={m.messageType === "IMAGE" ? "break-all" : ""}>{m.message}</span>
                      )}
                      <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-steel"}`}>
                        {timeStr(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && <p className="text-caption text-steel">typing…</p>}
              <div ref={bottomRef} />
            </div>

            {active.collaborationStatus === "ACTIVE" ? (
              <div className="border-t border-slate-custom/10 bg-white p-4">
                <div className="flex items-center gap-2 rounded-pill bg-sky-wash px-4 py-1.5 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message…"
                    className="flex-1 bg-transparent border-none py-2 text-body text-midnight-ink outline-none placeholder:text-ash"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim()}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-steel/30"
                    aria-label="Send message"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-custom/10 bg-linen-canvas p-4 text-center text-sm font-medium text-ash">
                Messaging is disabled for inactive collaborations.
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-wash text-fog">
              <MessageSquare size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-graphite">Your Messages</h2>
            <p className="max-w-sm text-ash">
              Select a conversation from the sidebar to start chatting with your collaboration partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <RequireAuth>
      <MessagesInner />
    </RequireAuth>
  );
}
