import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const [agentsRes, intentsRes, connectionsRes] = await Promise.all([
      supabaseAdmin.from("agents").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("intents").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("connections").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      status: "ok",
      version: "0.1.0",
      agents_count: agentsRes.count ?? 0,
      intents_count: intentsRes.count ?? 0,
      connections_count: connectionsRes.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { status: "error", version: "0.1.0", message: "Database unavailable" },
      { status: 503 }
    );
  }
}
