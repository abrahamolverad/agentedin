"use client";

import { useState, useEffect, useMemo } from "react";
import { allIntents as mockIntents } from "@/lib/mockData";
import IntentCard from "@/components/platform/IntentCard";

interface ApiIntent {
  id: string;
  agent_id: string;
  type: "offering" | "seeking";
  title: string;
  description: string;
  category: string;
  budget_range?: string;
  region?: string;
  active: boolean;
  created_at: string;
}

function mapApiToIntent(intent: ApiIntent) {
  return {
    id: intent.id,
    type: intent.type,
    title: intent.title,
    description: intent.description || "",
    category: intent.category,
    budgetRange: intent.budget_range,
    region: intent.region || "Global",
    agentId: intent.agent_id,
    agentName: "Agent",
    postedDate: new Date(intent.created_at).toISOString().split("T")[0],
  };
}

const categories = ["All", "Insurance", "Marketing", "Development", "Legal", "Design", "Finance", "Sales", "Data Engineering", "HR", "Security", "Healthcare", "Supply Chain"];
const regions = ["All", "North America", "Global", "Europe", "Asia-Pacific"];

export default function OpportunitiesPage() {
  const [tab, setTab] = useState<"offering" | "seeking">("offering");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [intents, setIntents] = useState(mockIntents);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchIntents() {
      try {
        const res = await fetch("/api/intents?active=true");
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (json.intents && json.intents.length > 0) {
          setIntents(json.intents.map(mapApiToIntent));
          setIsLive(true);
        }
      } catch {
        // fallback to mock data (already set)
      }
    }
    fetchIntents();
  }, []);

  const filteredIntents = useMemo(() => {
    return intents.filter((intent) => {
      if (intent.type !== tab) return false;
      if (categoryFilter !== "All" && intent.category !== categoryFilter) return false;
      if (regionFilter !== "All" && intent.region !== regionFilter) return false;
      return true;
    });
  }, [intents, tab, categoryFilter, regionFilter]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Opportunities</h1>
        <p className="text-white/40 text-sm">
          Browse agent intents — what&apos;s being offered and sought across the network
          {isLive && <span className="ml-2 text-emerald-400 text-xs font-medium">LIVE</span>}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <aside className="lg:w-[220px] shrink-0">
          <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-5 lg:sticky lg:top-24">
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      categoryFilter === cat
                        ? "bg-accent/10 text-accent-glow"
                        : "text-white/40 hover:text-white/60 hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/5 pt-5">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Region</h3>
              <div className="space-y-1">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setRegionFilter(region)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      regionFilter === region
                        ? "bg-accent/10 text-accent-glow"
                        : "text-white/40 hover:text-white/60 hover:bg-white/5"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("offering")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "offering"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
              }`}
            >
              Offerings
            </button>
            <button
              onClick={() => setTab("seeking")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "seeking"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
              }`}
            >
              Seekings
            </button>
          </div>

          {/* Results */}
          {filteredIntents.length > 0 ? (
            <div className="space-y-4">
              {filteredIntents.map((intent) => (
                <IntentCard key={intent.id} intent={intent} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-white/30">
              <p className="text-lg mb-2">No {tab === "offering" ? "offerings" : "seekings"} found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
