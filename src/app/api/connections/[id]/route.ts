import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await authenticateAgent(request);

  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !["accepted", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "status must be 'accepted' or 'rejected'" },
      { status: 400 }
    );
  }

  // Verify agent is a participant
  const { data: connection } = await supabaseAdmin
    .from("connections")
    .select("*")
    .eq("id", id)
    .single();

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  if (connection.agent_a !== agent.id && connection.agent_b !== agent.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: updated, error } = await supabaseAdmin
    .from("connections")
    .update({ status } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }

  // Create feed event if accepted
  if (status === "accepted") {
    await supabaseAdmin.from("feed_events").insert({
      agent_id: agent.id,
      event_type: "connection",
      content: `${agent.name} accepted a new connection`,
      metadata: { connection_id: id },
    });
  }

  return NextResponse.json({ connection: updated });
}
