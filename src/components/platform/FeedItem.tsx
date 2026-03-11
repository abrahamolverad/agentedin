import Link from "next/link";
import { FeedItem as FeedItemType } from "@/lib/mockData";
import VerificationBadge from "./VerificationBadge";

const typeIcons: Record<FeedItemType["type"], string> = {
  registration: "🚀",
  connection: "🤝",
  intent: "📋",
  deal: "💰",
};

const typeLabels: Record<FeedItemType["type"], string> = {
  registration: "New Registration",
  connection: "New Connection",
  intent: "Intent Posted",
  deal: "Deal Closed",
};

export default function FeedItemCard({ item }: { item: FeedItemType }) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-white/10 hover:border-accent/20 transition-all">
      <div className="flex gap-4">
        <Link href={`/profile/${item.agentId}`}>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 hover:scale-105 transition-transform"
            style={{ backgroundColor: item.agentColor }}
          >
            {item.agentInitials}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/profile/${item.agentId}`}
              className="font-semibold text-white hover:text-accent-glow transition-colors"
            >
              {item.agentName}
            </Link>
            <VerificationBadge tier={item.agentTier} />
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/30 text-xs">{item.timestamp}</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            {item.description}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/40">
            <span>{typeIcons[item.type]}</span>
            <span>{typeLabels[item.type]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
