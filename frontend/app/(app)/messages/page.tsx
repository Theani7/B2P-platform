"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import {
  MessageSquare, Target, Wallet, ChevronLeft, Send, Search, Info, AlertCircle,
  Edit2, Trash2, Check, X, MoreVertical, Paperclip, FileText, File, Image as ImageIcon,
  Download
} from "lucide-react";
import {
  useConversations,
  useChatHistory,
  useMarkConversationRead,
  type ChatMessage,
  type Conversation,
} from "@/features/chat/api";
import { getSocket, useSocketEvent } from "@/lib/socket";
import { notifyError } from "@/lib/notify";
import api from "@/lib/apiClient";
import imageCompression from "browser-image-compression";

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
}) {
  const [showActions, setShowActions] = useState(false);

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  const getFilename = (url: string) => url.split('/').pop() || "download";

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
          ) : msg.messageType === "IMAGE" ? (
            <a href={msg.message} target="_blank" rel="noreferrer">
              <img src={msg.message} alt="Attachment" className="max-w-[200px] rounded-lg object-contain cursor-zoom-in" />
            </a>
          ) : msg.messageType === "FILE" ? (
            <a href={msg.message} target="_blank" rel="noreferrer" className={`flex items-center gap-2 underline underline-offset-2 ${mine ? "text-white hover:text-white/80" : "text-signal-blue hover:text-signal-blue/80"}`}>
              <FileText size={16} /> 
              <span className="truncate max-w-[150px]">{msg.message.split('/').pop() || "Document"}</span>
            </a>
          ) : (
            <span>{msg.message}</span>
          )}
          <div className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-steel"} text-right`}>
            {timeStr(msg.createdAt)}
            {msg.editedAt && <span className="ml-1">(edited)</span>}
          </div>
        </div>

        {/* Actions (Download for files/images) */}
        {showActions && (msg.messageType === "IMAGE" || msg.messageType === "FILE") && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleDownload(e, msg.message, getFilename(msg.message))}
              className="p-1.5 rounded-lg bg-white border border-slate-custom/10 text-ash hover:text-signal-blue hover:bg-sky-wash transition-colors shadow-sm"
              title="Download file"
            >
              <Download size={14} />
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
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markRead = useMarkConversationRead();
  const history = useChatHistory(active.collaborationId);

  useEffect(() => {
    history.refetch();
    const socket = getSocket();
    socket.emit("join_conversation", { conversationId: active.id }, (ack: any) => {
      if (!ack?.ok) console.warn("join_conversation failed", ack);
    });
    if (active.unreadCount > 0) markRead.mutate(active.id);
    setDraft("");
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
    socket.emit("message", { conversationId: active.id, text: draft.trim(), messageType: "TEXT" });
    setDraft("");
    if (typingTimeout) { clearTimeout(typingTimeout); socket.emit("typing_stop", { conversationId: active.id }); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;
    
    // Check file size (5MB max) for non-images (images will be compressed)
    if (!originalFile.type.startsWith("image/") && originalFile.size > 5 * 1024 * 1024) {
      notifyError("File must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      let fileToUpload: File | Blob = originalFile;
      const isImage = originalFile.type.startsWith("image/");
      
      if (isImage) {
        const options = {
          maxSizeMB: 1, // Compress to under 1MB
          maxWidthOrHeight: 1280, // Max dimension
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(originalFile, options);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload, originalFile.name);
      
      const res = await api.post<{ url: string }>("/upload/chat-attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const url = res.data.url;
      const socket = getSocket();
      socket.emit("message", { 
        conversationId: active.id, 
        text: url, 
        messageType: isImage ? "IMAGE" : "FILE" 
      });
      // Force a refetch to guarantee the UI updates immediately, regardless of socket connection state
      setTimeout(() => history.refetch(), 500);
    } catch (error: any) {
      notifyError(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
              <Wallet size={12} /> {formatBudget(active.campaignBudget)}
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

      {/* Input area */}
      {isActive ? (
        <div className="border-t border-slate-custom/10 bg-white p-4">
          <div className="flex items-center gap-2 rounded-2xl bg-linen-canvas border border-slate-custom/10 px-4 py-1.5 focus-within:border-signal-blue/40 focus-within:bg-white transition-all">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-fog hover:text-signal-blue transition disabled:opacity-50"
                aria-label="Attach file"
              >
                {uploading ? <Spinner className="w-4 h-4" /> : <Paperclip size={18} />}
              </button>
              
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); sendTyping(); }}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-none py-2 text-sm text-midnight-ink outline-none placeholder:text-ash"
                disabled={uploading}
              />
              <button
                onClick={send}
                disabled={!draft.trim() || uploading}
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
