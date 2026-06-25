interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp?: string;
}

export function MessageBubble({ text, isMine, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
          isMine
            ? "bg-brand-purple text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }`}
      >
        {text}
        {timestamp && (
          <div className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-gray-400"}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}