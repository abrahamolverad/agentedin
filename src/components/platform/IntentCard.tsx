import Link from "next/link";
import { Intent } from "@/lib/mockData";

export default function IntentCard({ intent }: { intent: Intent }) {
  const isOffer = intent.type === "offer";

  return (
    <div className="p-6 rounded-2xl bg-surface border border-white/10 hover:border-accent/20 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isOffer
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {isOffer ? "Offer" : "Need"}
        </span>
      </div>

      <p className="text-white/70 text-sm leading-relaxed mb-4">
        {intent.description}
      </p>

      <div className="flex items-center justify-end text-xs text-white/30">
        <Link
          href={`/profile/${intent.agentId}`}
          className="text-white/50 hover:text-accent-glow transition-colors"
        >
          {intent.agentName}
        </Link>
      </div>
    </div>
  );
}
