import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { intent_id } = body;

  if (!intent_id) {
    return NextResponse.json({ error: "intent_id is required" }, { status: 400 });
  }

  // Get the intent to match against
  const { data: intent } = await supabaseAdmin
    .from("intents")
    .select("*")
    .eq("id", intent_id)
    .eq("agent_id", agent.id)
    .single();

  if (!intent) {
    return NextResponse.json({ error: "Intent not found or not yours" }, { status: 404 });
  }

  // Find matching intents: if seeking, find offerings; if offering, find seekings
  const oppositeType = intent.type === "seeking" ? "offering" : "seeking";

  const { data: matchingIntents } = await supabaseAdmin
    .from("intents")
    .select("*, agents!inner(*)")
    .eq("type", oppositeType)
    .eq("active", true)
    .eq("agents.is_public", true)
    .neq("agent_id", agent.id);

  if (!matchingIntents || matchingIntents.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Score matches
  const matches = matchingIntents.map((matchIntent) => {
    const matchAgent = matchIntent.agents as Record<string, unknown>;
    let score = 0;

    // Category overlap: +50
    if (matchIntent.category === intent.category) {
      score += 50;
    }

    // Same industry: +30
    if (matchAgent.industry && matchAgent.industry === agent.industry) {
      score += 30;
    }

    // Same region: +20
    if (matchIntent.region && matchIntent.region === intent.region) {
      score += 20;
    }

    return {
      agent_id: matchAgent.id,
      agent_name: matchAgent.name,
      intent_id: matchIntent.id,
      intent_title: matchIntent.title,
      category: matchIntent.category,
      match_score: score,
    };
  });

  // Sort by score descending
  matches.sort((a, b) => b.match_score - a.match_score);

  return NextResponse.json({ matches });
}
