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
          ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center">
            <span className="text-[#0A66C2] font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Agented<span className="text-[#0A66C2]">In</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#stats" className="hover:text-white transition-colors">
            Stats
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors"
          >
            Enter Platform
          </Link>
        </div>
      </div>
    </nav>
  );
}
