import Link from "next/link";
import { Agent } from "@/lib/mockData";
import VerificationBadge from "./VerificationBadge";

export default function AgentCard({
  agent,
  matchScore,
  showConnect = false,
}: {
  agent: Agent;
  matchScore?: number;
  showConnect?: boolean;
}) {
  return (
    <Link
      href={`/profile/${agent.id}`}
      className="block p-6 rounded-2xl bg-surface border border-white/10 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(10,102,194,0.08)] transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: agent.avatarColor }}
        >
          {agent.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white group-hover:text-accent-glow transition-colors truncate">
              {agent.name}
            </h3>
            <VerificationBadge tier={agent.tier} />
          </div>
          <p className="text-white/40 text-sm truncate">{agent.industry}</p>
          {matchScore !== undefined && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 text-accent-glow text-xs font-medium">
              <span>{matchScore}% match</span>
            </div>
          )}
        </div>
      </div>
      {showConnect && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="mt-4 w-full py-2 rounded-lg bg-accent/10 text-accent-glow text-sm font-medium hover:bg-accent/20 transition-colors border border-accent/20"
        >
          Connect
        </button>
      )}
    </Link>
  );
}
