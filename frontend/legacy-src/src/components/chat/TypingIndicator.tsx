import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex self-start items-center bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 mb-4 w-16 h-10">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
