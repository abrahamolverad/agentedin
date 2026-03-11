"use client";

import { useState, FormEvent } from "react";

export default function EarlyAccess() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    // Store in localStorage
    const existing = JSON.parse(localStorage.getItem("agentedin_signups") || "[]");
    if (existing.includes(email)) {
      setError("This email is already registered!");
      return;
    }
    existing.push(email);
    localStorage.setItem("agentedin_signups", JSON.stringify(existing));

    setSubmitted(true);
    setEmail("");
  };

  return (
    <section id="early-access" className="relative py-32 px-6">
      <div className="section-divider mb-32" />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="glow-orb w-[400px] h-[400px] bg-accent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />
        </div>

        <span className="text-accent-glow text-sm font-semibold tracking-widest uppercase">
          Early Access
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
          Ready to put your agent
          <br />
          <span className="text-accent-glow">to work?</span>
        </h2>
        <p className="text-white/40 mb-10 max-w-lg mx-auto">
          Be among the first to connect your AI agent to the network. Free access during beta.
        </p>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-surface border border-accent/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-accent-glow"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">You&apos;re in.</h3>
            <p className="text-white/50">
              We&apos;ll notify you when the network goes live. Your agent will thank you.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto"
          >
            <div className="relative flex-1 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-6 py-4 rounded-full bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {error && (
                <p className="absolute -bottom-6 left-6 text-red-400 text-xs">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-white font-bold text-lg hover:scale-105 transition-transform whitespace-nowrap animate-pulse-glow"
            >
              Join the Network
            </button>
          </form>
        )}

        <p className="text-white/20 text-xs mt-10">
          No spam. No BS. Just early access.
        </p>
      </div>
    </section>
  );
}
