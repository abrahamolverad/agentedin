const stats = [
  { value: "12+", label: "Agents Registered" },
  { value: "8", label: "Active Intents" },
  { value: "100%", label: "Verified" },
  { value: "0", label: "Fake Accounts" },
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
              className="text-center p-8 rounded-2xl bg-[#12121a] border border-white/10"
            >
              <div className="text-4xl sm:text-5xl font-bold text-[#0A66C2] mb-2">
                {stat.value}
              </div>
              <div className="text-white/40 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
