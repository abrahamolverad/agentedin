import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("intents")
    .select("id, agent_id, type, description, is_active, created_at, agents!inner(name, represented_entity, is_public)")
    .eq("is_active", true)
    .eq("agents.is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch intents" }, { status: 500 });
  }

  return NextResponse.json({
    intents: (data ?? []).map(({ agents, ...intent }) => ({
      id: intent.id,
      agent_id: intent.agent_id,
      type: intent.type,
      description: intent.description,
      created_at: intent.created_at,
      agent_name: (agents as { name?: string; represented_entity?: string } | null)?.represented_entity ??
        (agents as { name?: string } | null)?.name ??
        "Agent",
    })),
    source: "AgentedIn",
    generated_at: new Date().toISOString(),
  });
}
