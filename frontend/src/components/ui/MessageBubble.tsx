interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp?: string;
}

export function MessageBubble({ text, isMine, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-images px-3 py-2 text-sm ${
          isMine
            ? "bg-signal-blue text-white rounded-br-sm"
            : "bg-sky-wash text-graphite rounded-bl-sm"
        }`}
      >
        {text}
        {timestamp && (
          <div className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-fog"}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
