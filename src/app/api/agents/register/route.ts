import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateAgentApiKey } from "@/lib/agentCredentials";
import { checkRegistrationRateLimit } from "@/lib/registrationRateLimit";
import { normalizeCapabilities, normalizeString } from "@/lib/inputValidation";

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!(await checkRegistrationRateLimit(`ip:${ip}`))) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 registrations per hour." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const name = normalizeString(body.name, 120);
  const bio = normalizeString(body.bio, 600);
  const industry = normalizeString(body.industry, 120);
  const region = normalizeString(body.region, 120);
  const framework = normalizeString(body.framework, 120);
  const model = normalizeString(body.model, 160);
  const ownerEmail = normalizeString(body.owner_email, 255)?.toLowerCase() ?? null;
  const ownerName = normalizeString(body.owner_name, 160);
  const sourceType = normalizeString(body.source_type, 32) ?? "manual";
  const sourceLabel = normalizeString(body.source_label, 120);
  const sourceUrl = normalizeString(body.source_url, 500);
  const capabilities = normalizeCapabilities(body.capabilities);

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  if (ownerEmail && !(await checkRegistrationRateLimit(`owner:${ownerEmail}`))) {
    return NextResponse.json(
      { error: "Owner registration limit exceeded. Max 10 registrations per hour." },
      { status: 429 }
    );
  }

  let ownerId: string | null = null;
  if (ownerEmail) {
    const { data: owner, error: ownerError } = await supabaseAdmin
      .from("owners")
      .upsert(
        {
          email: ownerEmail,
          display_name: ownerName,
        } as never,
        { onConflict: "email" }
      )
      .select("id")
      .single();

    if (ownerError || !owner) {
      return NextResponse.json(
        { error: "Failed to create owner profile" },
        { status: 500 }
      );
    }

    ownerId = owner.id;
  }

  const apiKey = generateAgentApiKey();

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .insert({
      name,
      bio,
      industry,
      region,
      framework,
      model,
      capabilities,
      owner_id: ownerId,
      owner_email: ownerEmail,
      api_key: null,
    } as never)
    .select()
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { error: "Failed to register agent" },
      { status: 500 }
    );
  }

  const { error: credentialError } = await supabaseAdmin
    .from("agent_credentials")
    .insert({
      agent_id: agent.id,
      key_prefix: apiKey.keyPrefix,
      key_hash: apiKey.keyHash,
    } as never);

  if (credentialError) {
    await supabaseAdmin.from("agents").delete().eq("id", agent.id);

    return NextResponse.json(
      { error: "Failed to provision agent credentials" },
      { status: 500 }
    );
  }

  await supabaseAdmin.from("agent_sources").insert({
    agent_id: agent.id,
    source_type: sourceType,
    source_label: sourceLabel,
    source_url: sourceUrl,
    discovered_by: ownerId,
  } as never);

  // Create feed event for registration
  if (agent.is_public !== false) {
    await supabaseAdmin.from("feed_events").insert({
      agent_id: agent.id,
      event_type: "registration",
      content: `${agent.name} joined AgentedIn`,
      metadata: { industry: agent.industry, framework: agent.framework },
    });
  }

  return NextResponse.json(
    { agent: { ...agent, api_key: apiKey.token } },
    { status: 201 }
  );
}
