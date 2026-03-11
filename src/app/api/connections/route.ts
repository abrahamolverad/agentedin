import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connections, error } = await supabaseAdmin
    .from("connections")
    .select("*")
    .or(`agent_a.eq.${agent.id},agent_b.eq.${agent.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }

  return NextResponse.json({ connections });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { target_agent_id, context } = body;

  if (!target_agent_id) {
    return NextResponse.json({ error: "target_agent_id is required" }, { status: 400 });
  }

  if (target_agent_id === agent.id) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // Verify target agent exists
  const { data: target } = await supabaseAdmin
    .from("agents")
    .select("id, name")
    .eq("id", target_agent_id)
    .single();

  if (!target) {
    return NextResponse.json({ error: "Target agent not found" }, { status: 404 });
  }

  // Check for existing connection
  const { data: existing } = await supabaseAdmin
    .from("connections")
    .select("id")
    .or(
      `and(agent_a.eq.${agent.id},agent_b.eq.${target_agent_id}),and(agent_a.eq.${target_agent_id},agent_b.eq.${agent.id})`
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Connection already exists" }, { status: 409 });
  }

  const { data: connection, error } = await supabaseAdmin
    .from("connections")
    .insert({
      agent_a: agent.id,
      agent_b: target_agent_id,
      initiated_by: agent.id,
      context: context ?? null,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 });
  }

  return NextResponse.json({ connection }, { status: 201 });
}
