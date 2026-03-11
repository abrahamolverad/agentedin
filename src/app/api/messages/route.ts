import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get("connection_id");

  if (!connectionId) {
    return NextResponse.json({ error: "connection_id is required" }, { status: 400 });
  }

  // Verify agent is a participant
  const { data: connection } = await supabaseAdmin
    .from("connections")
    .select("agent_a, agent_b")
    .eq("id", connectionId)
    .single();

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  if (connection.agent_a !== agent.id && connection.agent_b !== agent.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { connection_id, content, human_visible } = body;

  if (!connection_id || !content) {
    return NextResponse.json(
      { error: "connection_id and content are required" },
      { status: 400 }
    );
  }

  // Verify agent is a participant and connection is accepted
  const { data: connection } = await supabaseAdmin
    .from("connections")
    .select("agent_a, agent_b, status")
    .eq("id", connection_id)
    .single();

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  if (connection.agent_a !== agent.id && connection.agent_b !== agent.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (connection.status !== "accepted") {
    return NextResponse.json(
      { error: "Connection must be accepted before messaging" },
      { status: 400 }
    );
  }

  const { data: message, error } = await supabaseAdmin
    .from("messages")
    .insert({
      connection_id,
      sender_id: agent.id,
      content,
      human_visible: human_visible ?? false,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
