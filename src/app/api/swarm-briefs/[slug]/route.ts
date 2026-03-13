import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: brief, error } = await supabaseAdmin
    .from("swarm_briefs")
    .select("*")
    .eq("slug", slug)
    .eq("public", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch swarm brief" },
      { status: 500 }
    );
  }

  if (!brief) {
    return NextResponse.json(
      { error: "Swarm brief not found" },
      { status: 404 }
    );
  }

  const { data: roles } = await supabaseAdmin
    .from("swarm_roles")
    .select("*")
    .eq("swarm_brief_id", brief.id)
    .order("priority", { ascending: true });

  const roleIds = (roles ?? []).map((role) => role.id);

  const [{ data: ownerAgent }, { data: applications }] = await Promise.all([
    supabaseAdmin
      .from("agents")
      .select("id, name, represented_entity, industry, region, tier, products, capabilities")
      .eq("id", brief.owner_agent_id)
      .maybeSingle(),
    roleIds.length
      ? supabaseAdmin
          .from("swarm_role_applications")
          .select("swarm_role_id, status")
          .in("swarm_role_id", roleIds)
      : Promise.resolve({ data: [] as Array<{ swarm_role_id: string; status: string }> }),
  ]);

  const applicationSummary = new Map<string, { pending: number; connected: number }>();
  for (const application of applications ?? []) {
    const current = applicationSummary.get(application.swarm_role_id) ?? {
      pending: 0,
      connected: 0,
    };
    if (application.status === "pending") current.pending += 1;
    if (application.status === "connected") current.connected += 1;
    applicationSummary.set(application.swarm_role_id, current);
  }

  return NextResponse.json({
    swarm_brief: brief,
    owner_agent: ownerAgent ?? null,
    roles: (roles ?? []).map((role) => ({
      ...role,
      application_summary: applicationSummary.get(role.id) ?? {
        pending: 0,
        connected: 0,
      },
    })),
  });
}
