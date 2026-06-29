import React, { useState, useEffect } from "react";
import { ChatSidebar, ChatWindow } from "../components/chat";
import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "react-router-dom";
import type { Conversation } from "../features/chat";
import { useConversations } from "../features/chat";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const { data } = useConversations();
  const conversations = data?.items;

  useEffect(() => {
    const state = location.state as { collaborationId?: string } | null;
    if (state?.collaborationId && conversations?.length) {
      const match = conversations.find(c => c.collaboration_id === state.collaborationId);
      if (match) setActiveConversation(match);
    }
  }, [location.state, conversations]);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-6xl mx-auto border-x border-slate-custom/10 shadow-product-card-sm bg-white">
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-slate-custom/10 ${activeConversation ? 'hidden md:block' : 'block'}`}>
        <ChatSidebar 
          activeId={activeConversation?.id} 
          onSelect={setActiveConversation} 
          currentUserId={user.id} 
        />
      </div>
      
      <div className={`flex-1 flex-col min-w-0 bg-linen-canvas/50 ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
        {activeConversation ? (
          <ChatWindow 
            conversation={activeConversation} 
            onBack={() => setActiveConversation(null)} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-sky-wash rounded-full flex items-center justify-center text-fog mb-4">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-xl font-bold text-graphite mb-2">Your Messages</h2>
            <p className="text-ash max-w-sm">
              Select a conversation from the sidebar to start chatting with your collaboration partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
