import React, { useState } from "react";
import { ChatSidebar, ChatWindow } from "../components/chat";
import { useAuth } from "../providers/AuthProvider";
import type { Conversation } from "../features/chat";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-6xl mx-auto border-x border-gray-100 shadow-sm bg-white">
      <div className="w-80 flex-shrink-0 border-r border-gray-100 hidden md:block">
        <ChatSidebar 
          activeId={activeConversation?.id} 
          onSelect={setActiveConversation} 
          currentUserId={user.id} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        {activeConversation ? (
          <ChatWindow conversation={activeConversation} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h2>
            <p className="text-gray-500 max-w-sm">
              Select a conversation from the sidebar to start chatting with your collaboration partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
