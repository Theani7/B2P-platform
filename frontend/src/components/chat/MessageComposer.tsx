import React, { useState, KeyboardEvent } from "react";
import { Send, Smile } from "lucide-react";

interface MessageComposerProps {
  onSend: (text: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, onTyping, disabled }: MessageComposerProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-50 rounded-full pr-2 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:bg-white transition-all">
        <input 
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Collaboration is completed." : "Type a message..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 disabled:bg-transparent"
        />
        <button disabled={disabled} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <Smile size={20} />
        </button>
        <button 
          onClick={handleSend}
          disabled={!text.trim() || disabled} 
          className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}
