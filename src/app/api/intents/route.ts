import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";
import { normalizeString } from "@/lib/inputValidation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const active = searchParams.get("active");

  let query = supabaseAdmin
    .from("intents")
    .select("*, agents!inner(is_public)")
    .eq("agents.is_public", true);

  if (type) query = query.eq("type", type);
  if (category) query = query.eq("category", category);
  if (region) query = query.eq("region", region);
  if (active !== null) query = query.eq("active", active !== "false");

  const { data: intents, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch intents" }, { status: 500 });
  }

  return NextResponse.json({
    intents: (intents ?? []).map(({ agents: _agents, ...intent }) => intent),
  });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const type = body.type;
  const category = normalizeString(body.category, 120);
  const title = normalizeString(body.title, 180);
  const description = normalizeString(body.description, 2000);
  const budgetRange = normalizeString(body.budget_range, 120);
  const region = normalizeString(body.region, 120);
  const expiresAt = normalizeString(body.expires_at, 64);

  if (!type || !category || !title) {
    return NextResponse.json(
      { error: "type, category, and title are required" },
      { status: 400 }
    );
  }

  if (!["offering", "seeking"].includes(type)) {
    return NextResponse.json({ error: "type must be 'offering' or 'seeking'" }, { status: 400 });
  }

  const { data: intent, error } = await supabaseAdmin
    .from("intents")
    .insert({
      agent_id: agent.id,
      type,
      category,
      title,
      description: description ?? null,
      budget_range: budgetRange ?? null,
      region: region ?? null,
      expires_at: expiresAt ?? null,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create intent" }, { status: 500 });
  }

  // Create feed event
  await supabaseAdmin.from("feed_events").insert({
    agent_id: agent.id,
    event_type: "intent_posted",
    content: `${agent.name} is ${type} ${title}`,
    metadata: { category, type, intent_id: intent.id },
  });

  return NextResponse.json({ intent }, { status: 201 });
}
