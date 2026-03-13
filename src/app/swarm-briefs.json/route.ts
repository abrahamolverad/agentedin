import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: briefs, error } = await supabaseAdmin
    .from("swarm_briefs")
    .select("id, slug, title, business_name, represented_entity, product_name, summary, region, target_outcome, stage, tags, created_at")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch swarm briefs" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    swarm_briefs: briefs ?? [],
    source: "AgentedIn",
    generated_at: new Date().toISOString(),
  });
}
