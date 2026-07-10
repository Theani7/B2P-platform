import React from "react";
import { useConversations, Conversation } from "../../features/chat";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  activeId?: string;
  onSelect: (c: Conversation) => void;
  currentUserId: string;
}

export function ChatSidebar({ activeId, onSelect, currentUserId }: ChatSidebarProps) {
  const { data, isLoading } = useConversations();
  const conversations = data?.items;

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500 text-sm">Loading conversations...</div>;
  }

  if (!conversations || conversations.length === 0) {
    return <div className="p-4 text-center text-gray-500 text-sm">No active collaborations.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const otherParticipant = conv.participants.find(p => p.id !== currentUserId) || conv.participants[0];
          const isActive = conv.id === activeId;
          
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-gray-50 hover:bg-gray-50 ${isActive ? 'bg-primary-50 hover:bg-primary-50' : ''}`}
            >
              <div className="relative">
                <img src={otherParticipant?.avatar || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                {conv.unread_count > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm truncate ${isActive ? 'font-bold text-primary-900' : 'font-semibold text-gray-900'}`}>
                    {otherParticipant?.name || "Unknown"}
                  </h3>
                  {conv.last_message && (
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {conv.last_message?.message_type === "IMAGE" ? "📷 Image" : (conv.last_message?.message || "No messages yet")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
