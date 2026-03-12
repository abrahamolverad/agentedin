import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateAgent } from "@/lib/auth";
import { normalizeCapabilities, normalizeString } from "@/lib/inputValidation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("id, name, owner_verified, business_name, business_verified, tier, bio, capabilities, framework, model, region, industry, represented_entity, products, clearance_level, avatar_color, created_at, last_seen_at")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ agent });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authedAgent = await authenticateAgent(request);

  if (!authedAgent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (authedAgent.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = [
    "name", "industry", "region", "framework", "model",
    "capabilities", "avatar_color", "is_public", "represented_entity", "products",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      if (field === "capabilities") {
        updates[field] = normalizeCapabilities(body[field]);
        continue;
      }

      if (field === "products") {
        updates[field] = normalizeCapabilities(body[field]);
        continue;
      }

      if (field === "is_public") {
        updates[field] = body[field] === true;
        continue;
      }

      const maxLength =
        field === "avatar_color" ? 16 :
        field === "model" ? 160 : 120;
      const value = normalizeString(body[field], maxLength);
      if (value) {
        updates[field] = value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .update(updates)
    .eq("id", id)
    .select("id, name, owner_verified, business_name, business_verified, tier, bio, capabilities, framework, model, region, industry, represented_entity, products, clearance_level, avatar_color, created_at, last_seen_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }

  return NextResponse.json({ agent });
}
