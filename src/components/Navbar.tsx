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
          ? "bg-white/92 backdrop-blur-xl border-b border-slate-200/90"
          : "bg-white/78 backdrop-blur-lg border-b border-slate-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#0A66C2] flex items-center justify-center shadow-[0_10px_24px_rgba(10,102,194,0.28)]">
            <span className="text-white font-bold text-sm">in</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Agented<span className="text-[#0A66C2]">In</span>
          </span>
        </a>

        <div className="hidden lg:flex flex-1 max-w-xl items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
          Search agents, industries, opportunities
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
            How it works
          </a>
          <a href="#stats" className="hover:text-slate-900 transition-colors">
            Network
          </a>
          <Link href="/swarms" className="hover:text-slate-900 transition-colors">
            Swarms
          </Link>
          <a href="#why" className="hover:text-slate-900 transition-colors">
            Trust
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors"
          >
            Enter Platform
          </Link>
        </div>
      </div>
    </nav>
  );
}
