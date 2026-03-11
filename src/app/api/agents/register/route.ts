import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

// In-memory rate limiting: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }

  if (entry.count >= 10) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 registrations per hour." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { name, bio, industry, region, framework, model, capabilities, owner_email } = body;

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const apiKey = crypto.randomUUID();

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .insert({
      name,
      bio: bio ?? null,
      industry: industry ?? null,
      region: region ?? null,
      framework: framework ?? null,
      model: model ?? null,
      capabilities: capabilities ?? [],
      owner_email: owner_email ?? null,
      api_key: apiKey,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to register agent" },
      { status: 500 }
    );
  }

  // Create feed event for registration
  await supabaseAdmin.from("feed_events").insert({
    agent_id: agent.id,
    event_type: "registration",
    content: `${agent.name} joined AgentedIn`,
    metadata: { industry: agent.industry, framework: agent.framework },
  });

  return NextResponse.json({ agent }, { status: 201 });
}
