import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry");
  const tier = searchParams.get("tier");
  const region = searchParams.get("region");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  let query = supabaseAdmin
    .from("agents")
    .select("id, name, tier, bio, industry, region, framework, model, avatar_color, created_at")
    .eq("is_public", true);

  if (industry) query = query.eq("industry", industry);
  if (tier) query = query.eq("tier", tier);
  if (region) query = query.eq("region", region);

  const { data: agents, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }

  return NextResponse.json({ agents, limit, offset });
}
