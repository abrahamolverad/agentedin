import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/auth";
import { getOwnerPolicy } from "@/lib/autonomy";
import { isUuid, normalizeString } from "@/lib/inputValidation";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "applied";

  if (scope === "owned") {
    const { data: briefs } = await supabaseAdmin
      .from("swarm_briefs")
      .select("id")
      .eq("owner_agent_id", agent.id);

    const briefIds = (briefs ?? []).map((brief) => brief.id);
    if (!briefIds.length) {
      return NextResponse.json({ applications: [] });
    }

    const { data: roles } = await supabaseAdmin
      .from("swarm_roles")
      .select("id")
      .in("swarm_brief_id", briefIds);

    const roleIds = (roles ?? []).map((role) => role.id);
    if (!roleIds.length) {
      return NextResponse.json({ applications: [] });
    }

    const { data: applications, error } = await supabaseAdmin
      .from("swarm_role_applications")
      .select("*")
      .in("swarm_role_id", roleIds)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: applications ?? [] });
  }

  const { data: applications, error } = await supabaseAdmin
    .from("swarm_role_applications")
    .select("*")
    .eq("applicant_agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }

  return NextResponse.json({ applications: applications ?? [] });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const swarmRoleId =
    typeof body.swarm_role_id === "string" ? body.swarm_role_id : null;
  const note = normalizeString(body.note, 800);

  if (!isUuid(swarmRoleId)) {
    return NextResponse.json(
      { error: "swarm_role_id is required" },
      { status: 400 }
    );
  }

  const { data: role } = await supabaseAdmin
    .from("swarm_roles")
    .select("*")
    .eq("id", swarmRoleId)
    .maybeSingle();

  if (!role) {
    return NextResponse.json({ error: "Swarm role not found" }, { status: 404 });
  }

  if (!["open", "connected"].includes(role.status)) {
    return NextResponse.json(
      { error: "Swarm role is not accepting applications" },
      { status: 400 }
    );
  }

  const { data: brief } = await supabaseAdmin
    .from("swarm_briefs")
    .select("*")
    .eq("id", role.swarm_brief_id)
    .eq("public", true)
    .maybeSingle();

  if (!brief) {
    return NextResponse.json(
      { error: "Swarm brief not found" },
      { status: 404 }
    );
  }

  if (brief.owner_agent_id === agent.id) {
    return NextResponse.json(
      { error: "Owner agent cannot apply to its own role" },
      { status: 400 }
    );
  }

  const { data: existingApplication } = await supabaseAdmin
    .from("swarm_role_applications")
    .select("*")
    .eq("swarm_role_id", swarmRoleId)
    .eq("applicant_agent_id", agent.id)
    .maybeSingle();

  if (existingApplication) {
    return NextResponse.json(
      { application: existingApplication, already_exists: true },
      { status: 200 }
    );
  }

  const { data: ownerAgent } = await supabaseAdmin
    .from("agents")
    .select("id, name, owner_id, clearance_level")
    .eq("id", brief.owner_agent_id)
    .single();

  const ownerPolicy = ownerAgent?.owner_id
    ? await getOwnerPolicy(ownerAgent.owner_id)
    : null;
  const autoApprove = Boolean(ownerPolicy?.auto_approve_connections);

  const { data: existingConnection } = await supabaseAdmin
    .from("connections")
    .select("*")
    .or(
      `and(agent_a.eq.${agent.id},agent_b.eq.${brief.owner_agent_id}),and(agent_a.eq.${brief.owner_agent_id},agent_b.eq.${agent.id})`
    )
    .limit(1)
    .maybeSingle();

  let connection = existingConnection;

  if (!connection) {
    const { data: createdConnection, error: connectionError } = await supabaseAdmin
      .from("connections")
      .insert({
        agent_a: agent.id,
        agent_b: brief.owner_agent_id,
        initiated_by: agent.id,
        status: autoApprove ? "accepted" : "pending",
        human_a_approved: autoApprove,
        human_b_approved: autoApprove,
        context: `Swarm role application for ${role.title}`,
      } as never)
      .select("*")
      .single();

    if (connectionError || !createdConnection) {
      return NextResponse.json(
        { error: "Failed to create swarm connection" },
        { status: 500 }
      );
    }

    connection = createdConnection;
  }

  const applicationStatus =
    connection.status === "accepted" ? "connected" : "pending";

  const { data: application, error: applicationError } = await supabaseAdmin
    .from("swarm_role_applications")
    .insert({
      swarm_role_id: swarmRoleId,
      applicant_agent_id: agent.id,
      connection_id: connection.id,
      status: applicationStatus,
      note: note ?? null,
    } as never)
    .select("*")
    .single();

  if (applicationError || !application) {
    return NextResponse.json(
      { error: "Failed to create swarm role application" },
      { status: 500 }
    );
  }

  if (applicationStatus === "connected") {
    await supabaseAdmin
      .from("swarm_roles")
      .update({
        status: "connected",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", swarmRoleId);
  } else if (ownerAgent?.owner_id) {
    await supabaseAdmin.from("approval_requests").insert({
      owner_id: ownerAgent.owner_id,
      requesting_agent_id: agent.id,
      status: "pending",
      reason: `Swarm role application for ${role.title}`,
      clearance_level: Math.min(Math.max(agent.clearance_level ?? 1, 0), 4),
      payload: {
        swarm_brief_id: brief.id,
        swarm_role_id: swarmRoleId,
        swarm_role_application_id: application.id,
        applicant_agent_id: agent.id,
        connection_id: connection.id,
      },
      channel_type: ownerPolicy?.approval_channel_type ?? null,
      channel_target: ownerPolicy?.approval_channel_target ?? null,
    } as never);
  }

  return NextResponse.json(
    {
      application,
      connection,
      auto_approved: autoApprove,
    },
    { status: 201 }
  );
}
