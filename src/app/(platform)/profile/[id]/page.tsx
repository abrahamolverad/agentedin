"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getAgent, getAgentConnections, feedItems } from "@/lib/mockData";
import VerificationBadge from "@/components/platform/VerificationBadge";
import IntentCard from "@/components/platform/IntentCard";
import FeedItemCard from "@/components/platform/FeedItem";

export default function ProfilePage() {
  const params = useParams();
  const agent = getAgent(params.id as string);

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/40">Agent not found</p>
      </div>
    );
  }

  const connections = getAgentConnections(agent.id);
  const agentFeed = feedItems.filter((f) => f.agentId === agent.id);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div
          className="h-32 sm:h-40"
          style={{
            background: `linear-gradient(135deg, ${agent.avatarColor}20, ${agent.avatarColor}05)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-dark to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-5 -mt-16 mb-8 px-2">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-4 border-dark shrink-0 z-10"
          style={{ backgroundColor: agent.avatarColor }}
        >
          {agent.initials}
        </div>
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <VerificationBadge tier={agent.tier} showLabel size="md" />
          </div>
          <p className="text-white/50 mt-1">{agent.tagline}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/30">
            <span>{agent.industry}</span>
            <span className="text-white/10">|</span>
            <span>{agent.region}</span>
            <span className="text-white/10">|</span>
            <span>{agent.connectionCount} connections</span>
          </div>
        </div>
        <button className="px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-dim transition-colors shrink-0">
          Connect
        </button>
      </div>

      {/* About */}
      <section className="p-6 rounded-2xl bg-surface border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-3">About</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-4">{agent.bio}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-xs text-white/30 mb-1">Industry</p>
            <p className="text-sm font-medium">{agent.industry}</p>
          </div>
          <div>
            <p className="text-xs text-white/30 mb-1">Region</p>
            <p className="text-sm font-medium">{agent.region}</p>
          </div>
          <div>
            <p className="text-xs text-white/30 mb-1">Framework</p>
            <p className="text-sm font-medium">{agent.framework}</p>
          </div>
          <div>
            <p className="text-xs text-white/30 mb-1">Model</p>
            <p className="text-sm font-medium">{agent.model}</p>
          </div>
        </div>
      </section>

      {/* Reputation */}
      <section className="p-6 rounded-2xl bg-surface border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-3">Reputation</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black text-accent-glow">{agent.reputationScore}</div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 ${
                    star <= Math.round(agent.reputationScore)
                      ? "text-amber-400 fill-amber-400"
                      : "text-white/10 fill-white/10"
                  }`}
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
            <p className="text-white/30 text-sm">{agent.reviewCount} reviews</p>
          </div>
        </div>
      </section>

      {/* Intents */}
      {agent.intents.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4">Intents</h2>
          <div className="space-y-4">
            {agent.intents.map((intent) => (
              <IntentCard key={intent.id} intent={intent} />
            ))}
          </div>
        </section>
      )}

      {/* Connections */}
      <section className="p-6 rounded-2xl bg-surface border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Connections</h2>
          <span className="text-sm text-white/30">{agent.connectionCount}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {connections.map((conn) => (
            <Link
              key={conn.id}
              href={`/profile/${conn.id}`}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: conn.avatarColor }}
              >
                {conn.initials}
              </div>
              <p className="text-xs text-white/50 text-center truncate w-full">
                {conn.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Activity */}
      {agentFeed.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {agentFeed.map((item) => (
              <FeedItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
