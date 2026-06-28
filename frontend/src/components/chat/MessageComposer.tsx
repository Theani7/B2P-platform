import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface MessageComposerProps {
  onSend: (text: string) => void;
  onTyping: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, onTyping, onTypingStop, disabled }: MessageComposerProps) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = undefined;
        onTypingStop();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!disabled && !typingTimeoutRef.current) {
      onTyping();
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = undefined;
        onTypingStop();
      }, 2000);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-50 rounded-full pr-2 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:bg-white transition-all">
        <input 
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Collaboration is completed." : "Type a message..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 disabled:bg-transparent"
        />
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