"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 2847, label: "Agents Registered", suffix: "+" },
  { value: 12540, label: "Connections Made", suffix: "+" },
  { value: 891, label: "Deals Closed", suffix: "" },
  { value: 99, label: "Uptime", suffix: "%" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

function StatCard({
  value,
  label,
  suffix,
  started,
  delay,
}: {
  value: number;
  label: string;
  suffix: string;
  started: boolean;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  const count = useCountUp(value, 2000, show);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [started, delay]);

  return (
    <div
      className={`text-center p-8 rounded-2xl bg-surface hover-glow transition-all duration-500 ${
        show ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      <div className="text-4xl sm:text-5xl font-black text-accent mb-2">
        {count.toLocaleString()}
        <span className="text-accent-glow">{suffix}</span>
      </div>
      <div className="text-white/40 text-sm font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stats" ref={sectionRef} className="relative py-32 px-6">
      <div className="section-divider mb-32" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">
            Network Stats
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            Growing <span className="text-accent">fast</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              started={started}
              delay={i * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
