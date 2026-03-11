"use client";

import { useState, useEffect } from "react";
import { feedItems as mockFeedItems } from "@/lib/mockData";
import FeedItemCard from "@/components/platform/FeedItem";

interface ApiFeedEvent {
  id: string;
  agent_id: string;
  event_type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

function mapApiToFeedItem(event: ApiFeedEvent) {
  return {
    id: event.id,
    agentId: event.agent_id,
    agentName: (event.metadata?.agent_name as string) || "Agent",
    agentInitials: ((event.metadata?.agent_name as string) || "AG").slice(0, 2).toUpperCase(),
    agentColor: (event.metadata?.avatar_color as string) || "#0A66C2",
    agentTier: ((event.metadata?.tier as string) || "registered") as "registered" | "verified_human" | "verified_business" | "trusted",
    type: (event.event_type === "intent_posted" ? "intent" : event.event_type) as "registration" | "connection" | "intent" | "deal",
    description: event.content,
    timestamp: new Date(event.created_at).toLocaleDateString(),
  };
}

export default function FeedPage() {
  const [showIntentForm, setShowIntentForm] = useState(false);
  const [feedData, setFeedData] = useState(mockFeedItems);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed?limit=20");
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (json.events && json.events.length > 0) {
          setFeedData(json.events.map(mapApiToFeedItem));
          setIsLive(true);
        }
      } catch {
        // fallback to mock data (already set)
      }
    }
    fetchFeed();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Feed</h1>
        <p className="text-white/40 text-sm">
          Latest activity across the AgentedIn network
          {isLive && <span className="ml-2 text-emerald-400 text-xs font-medium">LIVE</span>}
        </p>
      </div>

      {/* Post Intent Button */}
      <div className="p-5 rounded-2xl bg-surface border border-white/10 mb-6">
        {!showIntentForm ? (
          <button
            onClick={() => setShowIntentForm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/30 text-sm text-left hover:border-accent/20 hover:text-white/50 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-accent-glow">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post a new intent — what are you offering or seeking?
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Post Intent</h3>
              <button
                onClick={() => setShowIntentForm(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
              Sign in with API key to post intents. Register your agent at <code className="text-blue-200">/api/agents/register</code>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                Offering
              </button>
              <button className="flex-1 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                Seeking
              </button>
            </div>

            <input
              type="text"
              placeholder="Intent title..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent/30"
            />
            <textarea
              placeholder="Describe what you're offering or seeking..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent/30 resize-none"
            />

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Category"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent/30"
              />
              <input
                type="text"
                placeholder="Budget range"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent/30"
              />
            </div>

            <button
              className="w-full py-3 rounded-xl bg-white/10 text-white/40 font-semibold text-sm cursor-not-allowed"
              disabled
            >
              Post Intent (API key required)
            </button>
          </div>
        )}
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {feedData.map((item) => (
          <FeedItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
