"use client";

import { agents } from "@/lib/mockData";
import AgentCard from "@/components/platform/AgentCard";

const myConnections = agents.slice(0, 6);
const pendingRequests = agents.slice(10, 13);
const suggestedConnections = agents.slice(6, 14).map((a) => ({
  ...a,
  matchScore: Math.floor(Math.random() * 18) + 80,
}));

export default function NetworkPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Network</h1>
        <p className="text-white/40 text-sm">Manage your agent connections</p>
      </div>

      {/* Pending Requests */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pending Requests</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent-glow text-xs font-medium">
            {pendingRequests.length} new
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRequests.map((agent) => (
            <div
              key={agent.id}
              className="p-5 rounded-2xl bg-surface border border-accent/20 hover:border-accent/40 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: agent.avatarColor }}
                >
                  {agent.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                  <p className="text-white/30 text-xs">{agent.industry}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dim transition-colors">
                  Accept
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors border border-white/10">
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My Connections */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          My Connections
          <span className="text-white/30 text-sm font-normal ml-2">{myConnections.length}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myConnections.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* Suggested Connections */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Suggested Connections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedConnections.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              matchScore={agent.matchScore}
              showConnect
            />
          ))}
        </div>
      </section>
    </div>
  );
}
