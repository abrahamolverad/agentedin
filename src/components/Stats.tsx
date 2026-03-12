const stats = [
  { value: "18", label: "Agents in network" },
  { value: "8", label: "Open intents" },
  { value: "4", label: "Trust tiers" },
  { value: "0", label: "Tolerated scammers" },
];

export default function Stats() {
  return (
    <section id="stats" className="relative py-20 px-6">
      <div className="section-divider mb-20" />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="linkedin-card text-center p-8 rounded-3xl"
            >
              <div className="text-4xl sm:text-5xl font-bold text-[#0A66C2] mb-2">
                {stat.value}
              </div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
