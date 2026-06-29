import React, { useState } from "react";
import { Check, CheckCheck, MoreVertical, Edit2, Trash2 } from "lucide-react";
import type { Message } from "../../features/chat";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderAvatar?: string;
  onEdit?: (id: string, newContent: string) => void;
  onDelete?: (id: string) => void;
}

export function MessageBubble({ message, isOwn, senderAvatar, onEdit, onDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.message);

  if (message.message_type === "SYSTEM") {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
          {message.message}
        </span>
      </div>
    );
  }
  
  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
        <div className="flex flex-col max-w-[75%] items-end">
           <div className={`px-4 py-2 rounded-2xl bg-gray-50 text-gray-400 italic text-sm ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
             This message was deleted.
           </div>
        </div>
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.message && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.message);
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <input 
            autoFocus
            className={`bg-transparent border-b border-current focus:outline-none focus:ring-0 px-1 py-0.5 text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-end gap-2 text-xs">
            <button onClick={() => { setIsEditing(false); setEditContent(message.message); }} className="opacity-70 hover:opacity-100">Cancel</button>
            <button onClick={handleSaveEdit} className="font-bold hover:opacity-80">Save</button>
          </div>
        </div>
      );
    }

    if (message.message_type === "IMAGE") {
      return (
        <div className="relative group">
          <img src={message.message} alt="Shared image" className="max-w-64 max-h-48 rounded-lg object-cover" />
          {message.edited_at && <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 text-white px-1 rounded">edited</span>}
        </div>
      );
    }

    return (
      <div className="relative">
        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        {message.edited_at && <span className={`text-[10px] opacity-70 mt-1 block ${isOwn ? 'text-right' : 'text-left'}`}>(edited)</span>}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 relative group`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full mr-2 mt-1 flex-shrink-0 overflow-hidden bg-gray-100">
          {senderAvatar ? (
            <img src={senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium" />
          )}
        </div>
      )}
      
      {isOwn && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pr-2 relative">
           <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
             <MoreVertical size={14} />
           </button>
           {showMenu && (
             <div className="absolute right-6 top-0 bg-white border border-gray-100 shadow-sm rounded-lg py-1 z-10 w-24">
               {message.message_type !== "IMAGE" && (
                 <button 
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                 >
                   <Edit2 size={12} /> Edit
                 </button>
               )}
               <button 
                onClick={() => { if(onDelete) onDelete(message.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-brand-coral hover:bg-red-50 flex items-center gap-2"
               >
                 <Trash2 size={12} /> Delete
               </button>
             </div>
           )}
        </div>
      )}

      <div className="flex flex-col max-w-[75%] items-end">
        <div 
          className={`${message.message_type === "IMAGE" ? 'px-1 py-1' : 'px-4 py-2'} rounded-2xl ${
            isOwn 
              ? "bg-primary-600 text-white rounded-br-sm" 
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          {renderContent()}
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