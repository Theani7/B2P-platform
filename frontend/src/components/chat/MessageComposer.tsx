import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { notifyError } from "../../hooks/useToast";
import apiClient from "../../services/apiClient";

interface MessageComposerProps {
  onSend: (text: string, type?: "TEXT" | "IMAGE") => void;
  onTyping: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, onTyping, onTypingStop, disabled }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (text.trim() && !disabled && !uploading) {
      onSend(text.trim(), "TEXT");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      notifyError("Only image attachments are supported for now");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const { data } = await apiClient.post("/upload/chat-attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      onSend(data.data.url, "IMAGE");
    } catch (err) {
      notifyError("Failed to upload attachment");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-50 rounded-full pr-2 pl-2 py-1.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:bg-white transition-all">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload} 
          disabled={disabled || uploading}
        />
        <button 
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Paperclip size={18} />
        </button>
        
        <input 
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || uploading}
          placeholder={disabled ? "Chat is disabled" : uploading ? "Uploading..." : "Type a message..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 disabled:bg-transparent px-2"
        />
        
        <button 
          onClick={handleSend}
          disabled={(!text.trim() && !uploading) || disabled || uploading} 
          className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}