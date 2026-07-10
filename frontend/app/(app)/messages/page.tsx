"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import {
  MessageSquare, Target, Wallet, ChevronLeft, Send, Search, Info, AlertCircle,
  Edit2, Trash2, Check, X, MoreVertical,
} from "lucide-react";
import {
  useConversations,
  useChatHistory,
  useMarkConversationRead,
  useEditMessage,
  useDeleteMessage,
  type ChatMessage,
  type Conversation,
} from "@/features/chat/api";
import { getSocket, useSocketEvent } from "@/lib/socket";
import { notifyError } from "@/lib/notify";

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

function MessageBubble({
  msg,
  mine,
  onEdit,
  onDelete,
}: {
  msg: ChatMessage;
  mine: boolean;
  onEdit: (id: string, current: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group flex ${mine ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative flex items-end gap-2 max-w-[75%] ${mine ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
            mine
              ? "bg-signal-blue text-white rounded-br-sm"
              : "bg-white border border-slate-custom/10 text-midnight-ink rounded-bl-sm"
          }`}
        >
          {msg.isDeleted ? (
            <span className="italic opacity-60 text-xs">Message deleted</span>
          ) : (
            <span>{msg.message}</span>
          )}
          <div className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-steel"} text-right`}>
            {timeStr(msg.createdAt)}
            {msg.editedAt && <span className="ml-1">(edited)</span>}
          </div>
        </div>

        {/* Actions (only for own messages, not deleted) */}
        {mine && !msg.isDeleted && showActions && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(msg.id, msg.message)}
              className="p-1.5 rounded-lg bg-white border border-slate-custom/10 text-ash hover:text-graphite hover:bg-sky-wash transition-colors shadow-sm"
              title="Edit message"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(msg.id)}
              className="p-1.5 rounded-lg bg-white border border-slate-custom/10 text-ash hover:text-coral-alert hover:bg-coral-alert/5 transition-colors shadow-sm"
              title="Delete message"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationSidebar({
  conversations,
  isLoading,
  activeId,
  userId,
  onSelect,
  search,
  setSearch,
}: {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeId: string | null;
  userId: string | undefined;
  onSelect: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const filtered = conversations?.filter((c) => {
    const other = c.participants.find((p) => p.id !== userId) ?? c.participants[0];
    const name = other?.name ?? "";
    const title = c.campaignTitle ?? "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden">
      <div className="border-b border-slate-custom/10 p-4">
        <h2 className="text-lg font-bold text-graphite mb-3">Messages</h2>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 bg-linen-canvas border border-slate-custom/10 rounded-lg text-sm text-graphite placeholder-gray-400 outline-none focus:ring-1 focus:ring-signal-blue"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center">
            <Spinner />
          </div>
        )}
        {!isLoading && filtered?.length === 0 && (
          <div className="p-6 text-center text-sm text-steel">
            {search ? "No conversations match your search." : "No active collaborations yet."}
          </div>
        )}
        <ul className="grid gap-0.5 p-2">
          {filtered?.map((c) => {
            const other = c.participants.find((p) => p.id !== userId) ?? c.participants[0];
            const isActive = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-sky-wash ${isActive ? "bg-sky-wash ring-1 ring-signal-blue/20" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    {other?.avatar ? (
                      <img src={other.avatar} alt="" className="h-11 w-11 rounded-full object-cover bg-sky-wash" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-signal-blue/10 flex items-center justify-center text-sm font-bold text-signal-blue">
                        {other?.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    {c.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-coral-alert flex items-center justify-center text-[9px] text-white font-bold">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className={`truncate text-sm ${isActive ? "font-bold text-graphite" : "font-semibold text-midnight-ink"}`}>
                        {other?.name ?? "Unknown"}
                      </h3>
                      {c.lastMessage && (
                        <span className="text-[10px] text-steel flex-shrink-0">{timeAgo(c.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {c.campaignTitle && (
                      <p className="text-[10px] text-signal-blue font-medium truncate mt-0.5">{c.campaignTitle}</p>
                    )}
                    <p className={`mt-0.5 truncate text-xs ${c.unreadCount > 0 ? "font-semibold text-graphite" : "text-steel"}`}>
                      {c.lastMessage?.isDeleted
                        ? "Message deleted"
                        : c.lastMessage?.message || "No messages yet"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ChatPanel({
  active,
  userId,
  onBack,
}: {
  active: Conversation;
  userId: string | undefined;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const markRead = useMarkConversationRead();
  const editMsg = useEditMessage();
  const deleteMsg = useDeleteMessage();
  const history = useChatHistory(active.collaborationId);

  useEffect(() => {
    history.refetch();
    const socket = getSocket();
    socket.emit("join_conversation", { conversationId: active.id }, (ack: any) => {
      if (!ack?.ok) console.warn("join_conversation failed", ack);
    });
    if (active.unreadCount > 0) markRead.mutate(active.id);
    setDraft("");
    setEditingId(null);
    inputRef.current?.focus();
  }, [active.id]);

  useEffect(() => {
    if (history.data) {
      setMessages(history.data.items.slice().reverse());
    }
  }, [history.data]);

  useSocketEvent("message", (payload: ChatMessage) => {
    if (payload.conversationId === active.id) {
      setMessages((m) => [...m, payload]);
      markRead.mutate(active.id);
    }
  });

  useSocketEvent("typing_start", (p: any) => {
    if (p.conversationId === active.id) setTyping(true);
  });
  useSocketEvent("typing_stop", (p: any) => {
    if (p.conversationId === active.id) setTyping(false);
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendTyping = useCallback(() => {
    const socket = getSocket();
    socket.emit("typing_start", { conversationId: active.id });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => {
      socket.emit("typing_stop", { conversationId: active.id });
    }, 2000));
  }, [active.id, typingTimeout]);

  const send = () => {
    if (!draft.trim()) return;
    const socket = getSocket();
    socket.emit("message", { conversationId: active.id, text: draft.trim() });
    setDraft("");
    if (typingTimeout) { clearTimeout(typingTimeout); socket.emit("typing_stop", { conversationId: active.id }); }
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditText(current);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;
    editMsg.mutate(
      { messageId: editingId, content: editText.trim() },
      {
        onSuccess: () => {
          // Refetch history to get updated messages
          history.refetch().then(() => {
            if (history.data) setMessages(history.data.items.slice().reverse());
          });
          setEditingId(null);
          setEditText("");
        },
        onError: () => notifyError("Failed to edit message"),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMsg.mutate(id, {
      onSuccess: () => {
        // Mark as deleted optimistically
        setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, isDeleted: true } : msg));
      },
      onError: () => notifyError("Failed to delete message"),
    });
  };

  const other = active.participants.find((p) => p.id !== userId) ?? active.participants[0];
  const isActive = active.collaborationStatus === "ACTIVE";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-linen-canvas/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-custom/10 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-ash hover:bg-sky-wash hover:text-graphite md:hidden transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          {other?.avatar ? (
            <img src={other.avatar} alt="" className="h-10 w-10 rounded-full object-cover bg-sky-wash flex-shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-signal-blue/10 flex items-center justify-center text-sm font-bold text-signal-blue flex-shrink-0">
              {other?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-graphite">{other?.name ?? "Unknown"}</h2>
            {active.campaignTitle && (
              <p className="text-xs text-signal-blue font-medium">{active.campaignTitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {active.campaignBudget && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-status bg-emerald-status/10 px-3 py-1.5 rounded-full">
              <Wallet size={12} /> ${formatBudget(active.campaignBudget)}
            </span>
          )}
          {!isActive && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-tag bg-amber-tag/10 px-3 py-1.5 rounded-full ml-2">
              <AlertCircle size={12} /> Inactive
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.isLoading && (
          <div className="flex justify-center py-8"><Spinner /></div>
        )}
        {!history.isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-full bg-sky-wash flex items-center justify-center mb-3">
              <MessageSquare size={24} className="text-fog" />
            </div>
            <p className="text-sm font-semibold text-graphite">No messages yet</p>
            <p className="text-xs text-ash mt-1">
              {isActive ? "Send a message to start the conversation." : "This collaboration has ended."}
            </p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            mine={m.senderId === userId}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-custom/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-steel shadow-sm">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-steel animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-steel animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-steel animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Edit mode banner */}
      {editingId && (
        <div className="border-t border-amber-tag/20 bg-amber-tag/10 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-tag flex items-center gap-2">
            <Edit2 size={12} /> Editing message
          </span>
          <button onClick={() => { setEditingId(null); setEditText(""); }} className="text-xs text-ash hover:text-graphite">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input area */}
      {isActive ? (
        <div className="border-t border-slate-custom/10 bg-white p-4">
          {editingId ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                }}
                className="flex-1 border border-signal-blue/30 rounded-xl px-4 py-2.5 text-sm text-graphite outline-none focus:ring-2 focus:ring-signal-blue/20"
              />
              <button
                onClick={saveEdit}
                disabled={!editText.trim() || editMsg.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-blue text-white hover:opacity-90 disabled:bg-steel/30 transition"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => { setEditingId(null); setEditText(""); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-linen-canvas border border-slate-custom/10 text-ash hover:bg-sky-wash transition"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-linen-canvas border border-slate-custom/10 px-4 py-1.5 focus-within:border-signal-blue/40 focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); sendTyping(); }}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-none py-2 text-sm text-midnight-ink outline-none placeholder:text-ash"
              />
              <button
                onClick={send}
                disabled={!draft.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-signal-blue text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-steel/30"
                aria-label="Send message"
              >
                <Send size={15} className="ml-0.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-slate-custom/10 bg-linen-canvas px-5 py-4 flex items-center justify-center gap-2 text-sm font-medium text-ash">
          <AlertCircle size={16} className="text-amber-tag" />
          Messaging is only available for active collaborations.
        </div>
      )}
    </div>
  );
}

function MessagesInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const collabIdParam = searchParams.get("collaborationId");
  
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Automatically select the conversation if accessed via query param
  useEffect(() => {
    if (collabIdParam && conversations && !activeId) {
      const match = conversations.find((c) => c.collaborationId === collabIdParam);
      if (match) setActiveId(match.id);
    }
  }, [collabIdParam, conversations, activeId]);

  const active = conversations?.find((c) => c.id === activeId) ?? null;

  return (
    <div className="mx-auto flex h-[calc(100vh-64px-48px)] max-w-6xl overflow-hidden rounded-2xl border border-slate-custom/10 bg-white shadow-product-card ring-1 ring-gray-200">
      {/* Sidebar */}
      <div className={`w-full flex-shrink-0 border-r border-slate-custom/10 md:w-80 ${active ? "hidden md:block" : "block"}`}>
        <ConversationSidebar
          conversations={conversations}
          isLoading={isLoading}
          activeId={activeId}
          userId={user?.id}
          onSelect={setActiveId}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Chat panel */}
      <div className={`min-w-0 flex-1 flex-col ${active ? "flex" : "hidden md:flex"}`}>
        {active ? (
          <ChatPanel
            active={active}
            userId={user?.id}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-wash text-fog">
              <MessageSquare size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-graphite">Your Messages</h2>
            <p className="max-w-sm text-ash text-sm">
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
      <Suspense fallback={
        <div className="flex h-[calc(100vh-64px-48px)] items-center justify-center">
          <Spinner />
        </div>
      }>
        <MessagesInner />
      </Suspense>
    </RequireAuth>
  );
}
