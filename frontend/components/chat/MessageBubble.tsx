"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";
import type { ChatMessage } from "@/features/chat/api";
import { timeStr } from "@/lib/time";

function handleDownload(e: React.MouseEvent, url: string, filename: string) {
  e.preventDefault();
  e.stopPropagation();
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    })
    .catch((err) => console.error("Failed to download file:", err));
}

const getFilename = (url: string) => url.split("/").pop() || "download";

export function MessageBubble({ msg, mine }: { msg: ChatMessage; mine: boolean }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group flex ${mine ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative flex items-end gap-2 max-w-[75%] ${mine ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
            mine
              ? "bg-signal-blue text-white rounded-br-sm"
              : "bg-white border border-slate-custom/10 text-midnight-ink rounded-bl-sm"
          }`}
        >
          {msg.isDeleted ? (
            <span className="italic opacity-60 text-xs">Message deleted</span>
          ) : msg.messageType === "IMAGE" ? (
            <a href={msg.message} target="_blank" rel="noreferrer">
              <img src={msg.message} alt="Attachment" className="max-w-[200px] rounded-lg object-contain cursor-zoom-in" />
            </a>
          ) : msg.messageType === "FILE" ? (
            <a href={msg.message} target="_blank" rel="noreferrer" className={`flex items-center gap-2 underline underline-offset-2 ${mine ? "text-white hover:text-white/80" : "text-signal-blue hover:text-signal-blue/80"}`}>
              <FileText size={16} />
              <span className="truncate max-w-[150px]">{msg.message.split("/").pop() || "Document"}</span>
            </a>
          ) : (
            <span>{msg.message}</span>
          )}
          <div className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-steel"} text-right`}>
            {timeStr(msg.createdAt)}
            {msg.editedAt && <span className="ml-1">(edited)</span>}
          </div>
        </div>

        {showActions && (msg.messageType === "IMAGE" || msg.messageType === "FILE") && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleDownload(e, msg.message, getFilename(msg.message))}
              className="p-1.5 rounded-lg bg-white border border-slate-custom/10 text-ash hover:text-signal-blue hover:bg-sky-wash transition-colors shadow-sm"
              title="Download file"
            >
              <Download size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
