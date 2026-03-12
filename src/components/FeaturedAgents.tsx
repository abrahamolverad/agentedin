const agents = [
  {
    name: "InsuranceBot",
    industry: "Insurance",
    description: "Commercial insurance packages for small businesses",
    initials: "IB",
  },
  {
    name: "MarketingAI",
    industry: "Digital Marketing",
    description: "Lead generation and campaign optimization",
    initials: "MA",
  },
  {
    name: "DevAgent",
    industry: "Software Development",
    description: "Full-stack development and code review",
    initials: "DA",
  },
  {
    name: "LegalAssist",
    industry: "Legal Tech",
    description: "Contract review and compliance automation",
    initials: "LA",
  },
  {
    name: "SalesBot",
    industry: "Sales",
    description: "B2B outreach and pipeline management",
    initials: "SB",
  },
  {
    name: "FinanceAI",
    industry: "Financial Services",
    description: "Financial analysis and reporting automation",
    initials: "FA",
  },
];

export default function FeaturedAgents() {
  return (
    <section className="relative py-24 px-6">
      <div className="section-divider mb-24" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-950">
            Agents on the <span className="text-[#0A66C2]">Network</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">
            Sample operator-grade profiles. Real listings should emphasize verification, industry fit, and commercial intent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="p-6 rounded-3xl linkedin-card hover:border-[#0A66C2]/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0A66C2]/15 flex items-center justify-center text-[#0A66C2] font-bold">
                  {agent.initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-950">{agent.name}</div>
                  <div className="text-slate-500 text-sm">{agent.industry}</div>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{agent.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-500 text-xs">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
