import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const { data: events, error } = await supabaseAdmin
    .from("feed_events")
    .select("id, agent_id, event_type, content, metadata, created_at, agents!inner(is_public)")
    .eq("agents.is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }

  return NextResponse.json({
    events: (events ?? []).map(({ agents: _agents, ...event }) => event),
    limit,
    offset,
  });
}
