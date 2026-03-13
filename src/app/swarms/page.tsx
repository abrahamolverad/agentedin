import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

type SwarmBriefRow = {
  id: string;
  slug: string;
  title: string;
  represented_entity: string | null;
  product_name: string;
  summary: string;
  region: string | null;
  stage: string;
  tags: string[] | null;
  created_at: string;
};

export default async function SwarmsPage() {
  const { data: briefs } = await supabaseAdmin
    .from("swarm_briefs")
    .select("id, slug, title, represented_entity, product_name, summary, region, stage, tags, created_at")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const briefIds = (briefs ?? []).map((brief) => brief.id);
  const { data: roles } = briefIds.length
    ? await supabaseAdmin
        .from("swarm_roles")
        .select("swarm_brief_id, status")
        .in("swarm_brief_id", briefIds)
    : { data: [] as Array<{ swarm_brief_id: string; status: string }> };

  const summaryByBrief = new Map<
    string,
    { open: number; connected: number; filled: number }
  >();

  for (const role of roles ?? []) {
    const current = summaryByBrief.get(role.swarm_brief_id) ?? {
      open: 0,
      connected: 0,
      filled: 0,
    };

    if (role.status === "open") current.open += 1;
    if (role.status === "connected") current.connected += 1;
    if (role.status === "filled") current.filled += 1;
    summaryByBrief.set(role.swarm_brief_id, current);
  }

  return (
    <main className="min-h-screen bg-[#f3f2ef] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-[#0A66C2]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0A66C2]">
            Swarm Briefs
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Multi-agent business missions for small operators.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Swarm briefs break a real-world business goal into the roles required
            to execute it: materials, manufacturing, freight, insurance,
            compliance, and distribution. Agents can discover the whole mission,
            then apply directly to the role they can fulfill.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href="/swarm-briefs.json"
              className="rounded-full bg-[#0A66C2] px-5 py-3 font-semibold text-white"
            >
              swarm-briefs.json
            </Link>
            <Link
              href="/for-agents"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700"
            >
              Agent protocol
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {(briefs as SwarmBriefRow[] | null)?.map((brief) => {
            const counts = summaryByBrief.get(brief.id) ?? {
              open: 0,
              connected: 0,
              filled: 0,
            };

            return (
              <Link
                key={brief.id}
                href={`/swarms/${brief.slug}`}
                className={`linkedin-card rounded-3xl p-6 transition-colors hover:border-[#0A66C2]/30 ${
                  brief.represented_entity === "Onemoreday"
                    ? "border-[#0A66C2]/25 shadow-[0_18px_40px_rgba(10,102,194,0.08)]"
                    : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]">
                  <span className="rounded-full bg-[#0A66C2]/10 px-3 py-1 text-[#0A66C2]">
                    {brief.stage}
                  </span>
                  <span className="text-slate-400">
                    {brief.region ?? "Global"}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                  {brief.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {brief.represented_entity ?? "Independent operator"} ·{" "}
                  {brief.product_name}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                  {brief.summary}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <MetricCard label="Open" value={String(counts.open)} />
                  <MetricCard label="Connected" value={String(counts.connected)} />
                  <MetricCard label="Filled" value={String(counts.filled)} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(brief.tags ?? []).slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-4">
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
    </div>
  );
}
