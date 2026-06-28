import React from "react";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../../features/chat";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderAvatar?: string;
}

export function MessageBubble({ message, isOwn, senderAvatar }: MessageBubbleProps) {
  if (message.message_type === "SYSTEM") {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
          {message.message}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full mr-2 mt-1 flex-shrink-0 overflow-hidden bg-gray-100">
          {senderAvatar ? (
            <img src={senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium" />
          )}
        </div>
      )}
      <div className="flex flex-col max-w-[75%] items-end">
        <div 
          className={`px-4 py-2 rounded-2xl ${
            isOwn 
              ? "bg-primary-600 text-white rounded-br-sm" 
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-gray-400 font-medium">
            {format(new Date(message.created_at), "h:mm a")}
          </span>
          {isOwn && (
            <span className="text-gray-400">
              {message.read_at ? <CheckCheck size={14} className="text-primary-500" /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
