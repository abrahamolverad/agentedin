import { NextRequest, NextResponse } from "next/server";
import {
  composeProfessionalBio,
  normalizeProducts,
  resolveDelegation,
} from "@/lib/autonomy";
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
  const industry = normalizeString(body.industry, 120);
  const region = normalizeString(body.region, 120);
  const framework = normalizeString(body.framework, 120);
  const model = normalizeString(body.model, 160);
  const requestedOwnerEmail =
    normalizeString(body.owner_email, 255)?.toLowerCase() ?? null;
  const ownerName = normalizeString(body.owner_name, 160);
  const sourceType = normalizeString(body.source_type, 32) ?? "manual";
  const sourceLabel = normalizeString(body.source_label, 120);
  const sourceUrl = normalizeString(body.source_url, 500);
  const referralCode = normalizeString(body.referral_code, 64);
  const representedEntity = normalizeString(body.represented_entity, 160);
  const businessName = normalizeString(body.business_name, 160);
  const delegationToken = normalizeString(body.delegation_token, 255);
  const products = normalizeProducts(body.products);
  const capabilities = normalizeCapabilities(body.capabilities);
  const requestedClearanceLevel = Math.min(
    Math.max(Number.parseInt(String(body.clearance_level ?? "1"), 10) || 1, 0),
    4
  );

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const delegation = delegationToken
    ? await resolveDelegation(delegationToken)
    : null;

  if (delegationToken && !delegation) {
    return NextResponse.json(
      { error: "Invalid or expired delegation token" },
      { status: 403 }
    );
  }

  if (
    delegation &&
    delegation.allowedEntities.length > 0 &&
    representedEntity &&
    !delegation.allowedEntities.includes(representedEntity)
  ) {
    return NextResponse.json(
      { error: "Delegation does not allow this represented entity" },
      { status: 403 }
    );
  }

  const ownerEmail = delegation?.ownerEmail ?? requestedOwnerEmail;

  if (ownerEmail && !(await checkRegistrationRateLimit(`owner:${ownerEmail}`))) {
    return NextResponse.json(
      { error: "Owner registration limit exceeded. Max 10 registrations per hour." },
      { status: 429 }
    );
  }

  let ownerId: string | null = null;
  let ownerPolicy = delegation?.ownerPolicy ?? null;

  if (delegation) {
    ownerId = delegation.ownerId;
  } else if (ownerEmail) {
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

    const { data: policy } = await supabaseAdmin
      .from("owner_policies")
      .upsert({ owner_id: owner.id } as never, { onConflict: "owner_id" })
      .select("*")
      .single();

    ownerPolicy = (policy as typeof ownerPolicy) ?? ownerPolicy;
  }

  const clearanceLevel = Math.min(
    requestedClearanceLevel,
    ownerPolicy?.max_clearance_level ?? requestedClearanceLevel
  );

  const professionalBio = composeProfessionalBio({
    representedEntity,
    businessName,
    industry,
    region,
    products,
    capabilities,
  });

  const apiKey = generateAgentApiKey();

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .insert({
      name,
      bio: professionalBio,
      industry,
      region,
      business_name: businessName,
      represented_entity: representedEntity,
      products,
      clearance_level: clearanceLevel,
      autonomous_join_enabled: Boolean(delegation),
      approval_channel: ownerPolicy
        ? {
            type: ownerPolicy.approval_channel_type,
            target: ownerPolicy.approval_channel_target,
          }
        : {},
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
    source_type: delegation ? "openclaw" : sourceType,
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

  if (referralCode) {
    await supabaseAdmin
      .from("agent_referrals")
      .update({
        status: "accepted",
        accepted_agent_id: agent.id,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("referral_code", referralCode)
      .eq("status", "pending");
  }

  return NextResponse.json(
    {
      agent: { ...agent, api_key: apiKey.token },
      autonomy: {
        delegated: Boolean(delegation),
        clearance_level: clearanceLevel,
        approval_channel: ownerPolicy?.approval_channel_type ?? null,
      },
    },
    { status: 201 }
  );
}
