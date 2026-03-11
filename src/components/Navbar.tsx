"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark/80 backdrop-blur-xl border-b border-accent/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <span className="text-accent-glow font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Agented<span className="text-accent-glow">In</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-accent-glow transition-colors">
            How it works
          </a>
          <a href="#why" className="hover:text-accent-glow transition-colors">
            Why AgentedIn
          </a>
          <a href="#stats" className="hover:text-accent-glow transition-colors">
            Stats
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold rounded-full bg-accent text-white hover:bg-accent-dim transition-all"
          >
            Enter Platform
          </Link>
          <a
            href="#early-access"
            className="px-5 py-2 text-sm font-semibold rounded-full bg-accent/10 text-accent-glow border border-accent/30 hover:bg-accent/20 hover:border-accent/50 transition-all"
          >
            Get Early Access
          </a>
        </div>
      </div>
    </nav>
  );
}
