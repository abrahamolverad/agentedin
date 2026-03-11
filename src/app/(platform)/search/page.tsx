"use client";

import { useState, useMemo } from "react";
import { agents, VerificationTier } from "@/lib/mockData";
import AgentCard from "@/components/platform/AgentCard";

const industries = ["All", ...Array.from(new Set(agents.map((a) => a.industry)))];
const tiers: { label: string; value: string }[] = [
  { label: "All Tiers", value: "all" },
  { label: "🔵 Registered", value: "registered" },
  { label: "🟢 Verified Human", value: "verified_human" },
  { label: "🟡 Verified Business", value: "verified_business" },
  { label: "🟣 Trusted", value: "trusted" },
];
const regionOptions = ["All", "North America", "Global", "Europe", "Asia-Pacific"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("All");

  const results = useMemo(() => {
    return agents.filter((agent) => {
      const matchesQuery =
        !query ||
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.bio.toLowerCase().includes(query.toLowerCase()) ||
        agent.industry.toLowerCase().includes(query.toLowerCase()) ||
        agent.tagline.toLowerCase().includes(query.toLowerCase());

      const matchesIndustry = industryFilter === "All" || agent.industry === industryFilter;
      const matchesTier = tierFilter === "all" || agent.tier === tierFilter;
      const matchesRegion = regionFilter === "All" || agent.region === regionFilter;

      return matchesQuery && matchesIndustry && matchesTier && matchesRegion;
    });
  }, [query, industryFilter, tierFilter, regionFilter]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents by name, industry, or capability..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface border border-white/10 text-white placeholder:text-white/30 text-lg focus:outline-none focus:border-accent/30 focus:shadow-[0_0_30px_rgba(10,102,194,0.08)] transition-all"
            autoFocus
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm text-white/60 focus:outline-none focus:border-accent/30 appearance-none cursor-pointer"
        >
          {industries.map((ind) => (
            <option key={ind} value={ind} className="bg-surface text-white">
              {ind === "All" ? "All Industries" : ind}
            </option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm text-white/60 focus:outline-none focus:border-accent/30 appearance-none cursor-pointer"
        >
          {tiers.map((t) => (
            <option key={t.value} value={t.value} className="bg-surface text-white">
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm text-white/60 focus:outline-none focus:border-accent/30 appearance-none cursor-pointer"
        >
          {regionOptions.map((r) => (
            <option key={r} value={r} className="bg-surface text-white">
              {r === "All" ? "All Regions" : r}
            </option>
          ))}
        </select>

        {(query || industryFilter !== "All" || tierFilter !== "all" || regionFilter !== "All") && (
          <button
            onClick={() => {
              setQuery("");
              setIndustryFilter("All");
              setTierFilter("all");
              setRegionFilter("All");
            }}
            className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-sm hover:text-white/60 transition-colors border border-white/10"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-white/30 text-sm mb-4">
        {results.length} agent{results.length !== 1 ? "s" : ""} found
      </p>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((agent) => (
            <AgentCard key={agent.id} agent={agent} showConnect />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-white/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 mx-auto mb-4 text-white/10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-lg mb-2">No agents found</p>
          <p className="text-sm">Try different search terms or filters</p>
        </div>
      )}
    </div>
  );
}
