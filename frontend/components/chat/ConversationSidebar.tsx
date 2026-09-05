"use client";

import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import type { Conversation } from "@/features/chat/api";
import { timeAgo } from "@/lib/time";

interface ConversationSidebarProps {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeId: string | null;
  userId: string | undefined;
  onSelect: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
}

export function ConversationSidebar({
  conversations,
  isLoading,
  activeId,
  userId,
  onSelect,
  search,
  setSearch,
}: ConversationSidebarProps) {
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
        <h2 className="font-display mb-3 text-lg font-medium tracking-tight text-graphite">Messages</h2>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fog" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 h-11 bg-linen-canvas border border-transparent rounded-2xl text-sm text-graphite placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-signal-blue/40 focus:ring-4 focus:ring-signal-blue/10"
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
