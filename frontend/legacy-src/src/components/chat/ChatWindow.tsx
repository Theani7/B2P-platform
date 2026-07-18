import React, { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";
import { useChatWebSocket, useConversationHistory, useMarkConversationRead, useEditMessage, useDeleteMessage, Conversation, Message } from "../../features/chat";
import { Phone, Video, Info, Search, WifiOff, AlertTriangle, ChevronLeft, Target, Wallet } from "lucide-react";
import { formatNepaliCurrency } from "../../utils/currency";

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { user, token } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversationHistory(conversation.collaboration_id);
  const markRead = useMarkConversationRead();
  const editMsg = useEditMessage(conversation.id);
  const deleteMsg = useDeleteMessage(conversation.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, lastMessage, sendMessage, error: wsError } = useChatWebSocket(conversation.id, token || undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const otherParticipant = conversation.participants.find(p => p.id !== user?.id) || conversation.participants[0];
  const senderAvatars = useMemo(() => {
    const map: Record<string, string> = {};
    conversation.participants.forEach(p => {
      map[p.id] = p.avatar;
    });
    return map;
  }, [conversation.participants]);

  // Load history
  useEffect(() => {
    if (data?.pages) {
      const allMessages = data.pages.flatMap(page => page.messages).reverse();
      setMessages(allMessages);
    }
  }, [data]);

  // Mark as read when opened if there are unread messages
  useEffect(() => {
    if (conversation.unread_count > 0) {
      markRead.mutate(conversation.id);
    }
  }, [conversation.id, conversation.unread_count]);

  // Handle incoming WS messages
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "MESSAGE") {
      setMessages(prev => [...prev, lastMessage.payload]);
      setIsOtherTyping(false);
      markRead.mutate(conversation.id);
    } else if (lastMessage.type === "TYPING_START") {
      if (lastMessage.payload.user_id !== user?.id) {
        setIsOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
      }
    } else if (lastMessage.type === "TYPING_STOP") {
      if (lastMessage.payload.user_id !== user?.id) {
        setIsOtherTyping(false);
      }
    } else if (lastMessage.type === "READ_RECEIPT") {
      setMessages(prev => prev.map(m => 
        (m.sender_id === user?.id && !m.read_at) ? { ...m, read_at: new Date().toISOString() } : m
      ));
    }
  }, [lastMessage, user?.id, conversation.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherTyping]);

  // Send message
  const handleSend = (text: string, msgType: "TEXT" | "IMAGE" = "TEXT") => {
    sendMessage({
      type: "MESSAGE",
      payload: { text, message_type: msgType }
    });
  };

  const handleTyping = () => {
    sendMessage({
      type: "TYPING_START",
      payload: {}
    });
  };

  const handleTypingStop = () => {
    sendMessage({
      type: "TYPING_STOP",
      payload: {}
    });
  };

  // Scroll to fetch more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-custom/10 bg-white">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 -ml-2 text-ash hover:text-graphite rounded-full hover:bg-sky-wash transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <img src={otherParticipant?.avatar || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover bg-sky-wash" />
          <div>
            <h2 className="text-sm font-bold text-graphite">{otherParticipant?.name || "Unknown"}</h2>
            {!isConnected && (
              <div className="flex items-center gap-1 text-xs text-fog">
                <WifiOff size={12} /> Reconnecting...
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-ash">
          <button className="p-2 hover:bg-sky-wash hover:text-graphite rounded-full transition-colors"><Search size={18} /></button>
          <button className="p-2 hover:bg-sky-wash hover:text-graphite rounded-full transition-colors"><Info size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-6 bg-white"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {conversation.collaboration_status && conversation.collaboration_status !== 'ACTIVE' && (
          <div className="bg-amber-tag/10 border border-amber-tag/20 text-amber-tag px-4 py-3 rounded-xl text-sm mb-6 text-center mx-auto max-w-lg shadow-sm">
            <span className="font-bold flex items-center justify-center gap-2 mb-1">
              <AlertTriangle size={16} /> Chat Disabled
            </span>
            This collaboration is no longer active. You cannot send new messages. Start a new collaboration to chat again.
          </div>
        )}
        
        {conversation.campaign_title && (
          <div className="bg-linen-canvas border border-slate-custom/10 px-4 py-3 rounded-xl text-sm mb-6 mx-auto max-w-lg shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-bold text-fog uppercase tracking-widest mb-2">Collaboration Details</span>
            <h4 className="font-bold text-graphite flex items-center gap-2 mb-1">
              <Target size={14} className="text-signal-blue" /> {conversation.campaign_title}
            </h4>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-status">
              <Wallet size={12} /> {formatNepaliCurrency(conversation.campaign_budget || 0)} Budget
            </div>
          </div>
        )}
        
        {wsError && (
          <div className="bg-amber-tag/10 border border-amber-tag/20 text-amber-tag px-3 py-2 rounded-inputs text-xs mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Connection issue: {wsError}
          </div>
        )}
        {isFetchingNextPage && <div className="text-center text-xs text-ash my-2">Loading older messages...</div>}
        
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isOwn={msg.sender_id === user?.id} 
            senderAvatar={senderAvatars[msg.sender_id] || (msg as any).sender_avatar} 
            onEdit={(id, content) => editMsg.mutate({ messageId: id, content })}
            onDelete={(id) => deleteMsg.mutate(id)}
          />
        ))}
        
        {isOtherTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      {conversation.collaboration_status === 'ACTIVE' ? (
        <MessageComposer onSend={handleSend} onTyping={handleTyping} onTypingStop={handleTypingStop} disabled={!isConnected} />
      ) : (
        <div className="p-4 bg-linen-canvas border-t border-slate-custom/10 text-center text-sm text-ash font-medium">
          Messaging is disabled for inactive collaborations.
        </div>
      )}
    </div>
  );
}
