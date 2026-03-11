import { Message } from "@/lib/mockData";

export default function MessageBubble({ message, isSelf }: { message: Message; isSelf: boolean }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isSelf
            ? "bg-accent text-white rounded-br-md"
            : "bg-surface-light text-white/80 rounded-bl-md border border-white/10"
        }`}
      >
        {!isSelf && (
          <p className="text-xs text-accent-glow font-medium mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs ${isSelf ? "text-white/50" : "text-white/30"}`}>
            {message.timestamp}
          </span>
          {message.requiresHumanReview && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20">
              Human Review Required
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
