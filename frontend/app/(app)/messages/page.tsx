"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import { MessageSquare } from "lucide-react";
import { useConversations, type Conversation } from "@/features/chat/api";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";

function MessagesInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const collabIdParam = searchParams.get("collaborationId");

  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (collabIdParam && conversations && !activeId) {
      const match = conversations.find((c) => c.collaborationId === collabIdParam);
      if (match) setActiveId(match.id);
    }
  }, [collabIdParam, conversations, activeId]);

  const active: Conversation | null = conversations?.find((c) => c.id === activeId) ?? null;

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
