import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("agents")
    .select("id, name, represented_entity, industry, region, products, capabilities, tier, clearance_level")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }

  return NextResponse.json({
    agents: data ?? [],
    source: "AgentedIn",
    generated_at: new Date().toISOString(),
  });
}
