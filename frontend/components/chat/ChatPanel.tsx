"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft, Wallet, AlertCircle, MessageSquare, Paperclip, Send,
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useMarkConversationRead, useChatHistory, type ChatMessage, type Conversation } from "@/features/chat/api";
import { getSocket, useSocketEvent } from "@/lib/socket";
import { notifyError } from "@/lib/notify";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  active: Conversation;
  userId: string | undefined;
  onBack: () => void;
}

function formatBudget(n?: number | null) {
  if (!n) return "Rs. 0";
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;
}

export function ChatPanel({ active, userId, onBack }: ChatPanelProps) {
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

    if (!originalFile.type.startsWith("image/") && originalFile.size > 5 * 1024 * 1024) {
      notifyError("File must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      let fileToUpload: File | Blob = originalFile;
      const isImage = originalFile.type.startsWith("image/");

      if (isImage) {
        const imageCompression = (await import("browser-image-compression")).default;
        fileToUpload = await imageCompression(originalFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload, originalFile.name);

      const res = await apiPost(formData);

      const socket = getSocket();
      socket.emit("message", {
        conversationId: active.id,
        text: res.url,
        messageType: isImage ? "IMAGE" : "FILE",
      });
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
              {uploading ? <div className="scale-50"><Spinner /></div> : <Paperclip size={18} />}
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

async function apiPost(formData: FormData) {
  const api = (await import("@/lib/apiClient")).default;
  const res = await api.post<{ url: string }>("/upload/chat-attachment", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
