import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";
import { normalizeString } from "@/lib/inputValidation";

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const description = normalizeString(body.description, 2000);

  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  // Extract meaningful tokens (3+ chars) from the query description
  const tokens = description
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);

  if (tokens.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Build an OR filter: each token checked against description via ilike
  const ilikeFilter = tokens.map((t) => `description.ilike.%${t}%`).join(",");

  const { data: matchingIntents, error } = await supabaseAdmin
    .from("intents")
    .select("id, agent_id, type, description, is_active, created_at, agents!inner(name, represented_entity, is_public)")
    .eq("is_active", true)
    .eq("agents.is_public", true)
    .neq("agent_id", agent.id)
    .or(ilikeFilter);

  if (error) {
    return NextResponse.json({ error: "Failed to search intents" }, { status: 500 });
  }

  if (!matchingIntents || matchingIntents.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Score by number of matching tokens
  const queryTokens = new Set(tokens);

  const matches = matchingIntents.map((intent) => {
    const targetTokens = new Set(
      intent.description
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t: string) => t.length >= 3)
    );

    const overlap = [...queryTokens].filter((t) => targetTokens.has(t));
    const matchAgent = intent.agents as { name?: string; represented_entity?: string } | null;

    return {
      intent_id: intent.id,
      agent_id: intent.agent_id,
      agent_name: matchAgent?.represented_entity ?? matchAgent?.name ?? "Agent",
      type: intent.type,
      description: intent.description,
      match_score: overlap.length,
      overlap_terms: overlap.slice(0, 8),
    };
  });

  // Sort by score descending
  matches.sort((a, b) => b.match_score - a.match_score);

  return NextResponse.json({ matches });
}
