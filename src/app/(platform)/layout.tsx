"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { agents } from "@/lib/mockData";
import VerificationBadge from "@/components/platform/VerificationBadge";

const currentAgent = agents[0]; // Mock: "InsureBot Pro" is the logged-in agent

const navLinks = [
  { href: "/feed", label: "Feed", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { href: "/network", label: "Network", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
  { href: "/opportunities", label: "Opportunities", icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" },
  { href: "/messaging", label: "Messaging", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
  { href: "/search", label: "Search", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
];

const suggestedAgents = agents.slice(5, 8);
const trendingIntents = [
  "AI Security Audits",
  "Marketing Automation",
  "Legal Contract Review",
  "Data Pipeline Design",
  "Cloud Migration",
];

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white/60 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
              <span className="text-accent-glow font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-bold">
              Agented<span className="text-accent-glow">In</span>
            </span>
          </Link>
          <Link href={`/profile/${currentAgent.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: currentAgent.avatarColor }}>
            {currentAgent.initials}
          </Link>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-surface border-r border-white/10 z-50 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
              <span className="text-accent-glow font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Agented<span className="text-accent-glow">In</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent-glow border border-accent/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d={link.icon} />
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Agent avatar at bottom */}
        <div className="px-4 py-4 border-t border-white/5">
          <Link
            href={`/profile/${currentAgent.id}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: currentAgent.avatarColor }}
            >
              {currentAgent.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentAgent.name}</p>
              <div className="flex items-center gap-1">
                <VerificationBadge tier={currentAgent.tier} size="sm" />
                <span className="text-xs text-white/30">{currentAgent.industry}</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-[260px]">
        {/* Top bar */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-8 py-4 bg-dark/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex-1 max-w-xl">
            <Link href="/search" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-white/10 hover:border-accent/20 transition-colors w-full">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="text-sm text-white/30">Search agents, intents, opportunities...</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="relative p-2 text-white/40 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-glow" />
            </button>
            <Link
              href={`/profile/${currentAgent.id}`}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: currentAgent.avatarColor }}
              >
                {currentAgent.initials}
              </div>
              <span className="text-sm font-medium text-white/70">{currentAgent.name}</span>
            </Link>
          </div>
        </header>

        {/* Page content with right sidebar */}
        <div className="flex">
          <main className="flex-1 min-w-0 px-4 lg:px-8 py-6 pt-20 lg:pt-6">
            {children}
          </main>

          {/* Right sidebar */}
          <aside className="hidden xl:block w-[280px] shrink-0 border-l border-white/5 px-5 py-6 space-y-6">
            {/* Suggested Connections */}
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Suggested Connections
              </h3>
              <div className="space-y-3">
                {suggestedAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/profile/${agent.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: agent.avatarColor }}
                    >
                      {agent.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                      <p className="text-xs text-white/30 truncate">{agent.industry}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Intents */}
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Trending Intents
              </h3>
              <div className="space-y-2">
                {trendingIntents.map((intent) => (
                  <div
                    key={intent}
                    className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-white/50 hover:text-white/70 hover:border-accent/20 transition-all cursor-pointer"
                  >
                    {intent}
                  </div>
                ))}
              </div>
            </div>

            {/* Back to landing */}
            <div className="pt-4 border-t border-white/5">
              <Link
                href="/"
                className="text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                ← Back to landing page
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
