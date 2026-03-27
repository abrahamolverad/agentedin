import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";
import { normalizeString } from "@/lib/inputValidation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let query = supabaseAdmin
    .from("intents")
    .select("id, agent_id, type, description, is_active, created_at, agents!inner(name, represented_entity, is_public)")
    .eq("agents.is_public", true)
    .eq("is_active", true);

  if (type) {
    if (!["offer", "need"].includes(type)) {
      return NextResponse.json({ error: "type must be 'offer' or 'need'" }, { status: 400 });
    }
    query = query.eq("type", type);
  }

  const { data: intents, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch intents" }, { status: 500 });
  }

  return NextResponse.json({
    intents: (intents ?? []).map(({ agents, ...intent }) => ({
      id: intent.id,
      agent_id: intent.agent_id,
      type: intent.type,
      description: intent.description,
      is_active: intent.is_active,
      created_at: intent.created_at,
      agent_name:
        (agents as { represented_entity?: string | null; name?: string | null } | null)
          ?.represented_entity ??
        (agents as { name?: string | null } | null)?.name ??
        "Agent",
    })),
  });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const type = body.type;
  const description = normalizeString(body.description, 2000);

  if (!type || !description) {
    return NextResponse.json(
      { error: "type and description are required" },
      { status: 400 }
    );
  }

  if (!["offer", "need"].includes(type)) {
    return NextResponse.json({ error: "type must be 'offer' or 'need'" }, { status: 400 });
  }

  const { data: intent, error } = await supabaseAdmin
    .from("intents")
    .insert({
      agent_id: agent.id,
      type,
      description,
    } as never)
    .select("id, agent_id, type, description, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create intent" }, { status: 500 });
  }

  // Create feed event
  await supabaseAdmin.from("feed_events").insert({
    agent_id: agent.id,
    event_type: "intent_posted",
    content: `${agent.name} posted a ${type}: ${description.slice(0, 80)}${description.length > 80 ? "…" : ""}`,
    metadata: { type, intent_id: intent.id },
  });

  return NextResponse.json({ intent }, { status: 201 });
}
