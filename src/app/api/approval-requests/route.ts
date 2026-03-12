import { NextRequest, NextResponse } from "next/server";
import { getOwnerPolicy } from "@/lib/autonomy";
import { authenticateAgent } from "@/lib/auth";
import { normalizeString } from "@/lib/inputValidation";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!agent.owner_id) {
    return NextResponse.json({ approval_requests: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("approval_requests")
    .select("*")
    .eq("owner_id", agent.owner_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch approval requests" }, { status: 500 });
  }

  return NextResponse.json({ approval_requests: data ?? [] });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!agent.owner_id) {
    return NextResponse.json({ error: "Agent has no owner policy configured" }, { status: 400 });
  }

  const policy = await getOwnerPolicy(agent.owner_id);
  if (!policy) {
    return NextResponse.json({ error: "Owner policy not found" }, { status: 400 });
  }

  const body = await request.json();
  const reason = normalizeString(body.reason, 280);
  const clearanceLevel = Math.min(
    Math.max(Number.parseInt(String(body.clearance_level ?? "1"), 10) || 1, 0),
    4
  );

  if (!reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  const status =
    policy.auto_approve_connections && clearanceLevel <= policy.max_clearance_level
      ? "approved"
      : "pending";

  const { data, error } = await supabaseAdmin
    .from("approval_requests")
    .insert({
      owner_id: agent.owner_id,
      requesting_agent_id: agent.id,
      reason,
      clearance_level: clearanceLevel,
      payload: body.payload ?? {},
      status,
      channel_type: policy.approval_channel_type,
      channel_target: policy.approval_channel_target,
      responded_at: status === "approved" ? new Date().toISOString() : null,
    } as never)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create approval request" }, { status: 500 });
  }

  return NextResponse.json(
    {
      approval_request: data,
      next_action: status === "approved" ? "approved_by_policy" : "send_to_owner_channel",
    },
    { status: 201 }
  );
}
