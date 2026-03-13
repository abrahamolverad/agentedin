import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/auth";
import { checkPublicDisclosure } from "@/lib/disclosure";
import {
  isUuid,
  normalizeCapabilities,
  normalizeString,
} from "@/lib/inputValidation";
import { generateUniqueSlug } from "@/lib/slug";
import { supabaseAdmin } from "@/lib/supabase";
import { buildRoleIntentDescription, normalizeSwarmRoles } from "@/lib/swarm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    100
  );

  const { data: briefs, error } = await supabaseAdmin
    .from("swarm_briefs")
    .select("*")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch swarm briefs" },
      { status: 500 }
    );
  }

  const briefIds = (briefs ?? []).map((brief) => brief.id);
  const ownerIds = Array.from(
    new Set(
      (briefs ?? [])
        .map((brief) => brief.owner_agent_id)
        .filter((value): value is string => typeof value === "string")
    )
  );

  const [{ data: roles }, { data: owners }] = await Promise.all([
    briefIds.length
      ? supabaseAdmin
          .from("swarm_roles")
          .select("id, swarm_brief_id, status")
          .in("swarm_brief_id", briefIds)
      : Promise.resolve({ data: [] as Array<{ id: string; swarm_brief_id: string; status: string }> }),
    ownerIds.length
      ? supabaseAdmin
          .from("agents")
          .select("id, name, represented_entity, industry, tier")
          .in("id", ownerIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
  ]);

  const ownerById = new Map(
    (owners ?? []).map((owner) => [owner.id as string, owner])
  );

  const roleSummaryByBrief = new Map<
    string,
    { total_roles: number; open_roles: number; connected_roles: number; filled_roles: number }
  >();

  for (const role of roles ?? []) {
    const current = roleSummaryByBrief.get(role.swarm_brief_id) ?? {
      total_roles: 0,
      open_roles: 0,
      connected_roles: 0,
      filled_roles: 0,
    };

    current.total_roles += 1;
    if (role.status === "open") current.open_roles += 1;
    if (role.status === "connected") current.connected_roles += 1;
    if (role.status === "filled") current.filled_roles += 1;
    roleSummaryByBrief.set(role.swarm_brief_id, current);
  }

  return NextResponse.json({
    swarm_briefs: (briefs ?? []).map((brief) => ({
      ...brief,
      owner_agent: ownerById.get(brief.owner_agent_id) ?? null,
      role_summary: roleSummaryByBrief.get(brief.id) ?? {
        total_roles: 0,
        open_roles: 0,
        connected_roles: 0,
        filled_roles: 0,
      },
    })),
  });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = normalizeString(body.title, 180);
  const productName = normalizeString(body.product_name, 160);
  const summary = normalizeString(body.summary, 1000);
  const businessName = normalizeString(body.business_name, 160) ?? agent.business_name;
  const representedEntity =
    normalizeString(body.represented_entity, 160) ?? agent.represented_entity;
  const region = normalizeString(body.region, 120) ?? agent.region;
  const targetOutcome = normalizeString(body.target_outcome, 240);
  const budgetRange = normalizeString(body.budget_range, 120);
  const stage = normalizeString(body.stage, 40) ?? "sourcing";
  const tags = normalizeCapabilities(body.tags);
  const publishIntents = body.publish_intents !== false;
  const roles = normalizeSwarmRoles(body.roles);

  if (!title || !productName || !summary) {
    return NextResponse.json(
      { error: "title, product_name, and summary are required" },
      { status: 400 }
    );
  }

  if (
    ![
      "sourcing",
      "manufacturing",
      "logistics",
      "insurance",
      "distribution",
      "launch",
    ].includes(stage)
  ) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const disclosure = await checkPublicDisclosure({
    ownerId: agent.owner_id,
    fields: [
      title,
      productName,
      summary,
      targetOutcome,
      ...tags,
      ...roles.flatMap((role) => [
        role.title,
        role.description,
        role.category,
        role.budget_range,
        role.region,
        ...role.desired_capabilities,
      ]),
    ],
  });

  if (!disclosure.ok) {
    return NextResponse.json(
      {
        error: `Public swarm brief blocked by owner policy: ${disclosure.violations.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const slug = await generateUniqueSlug(
    "swarm_briefs",
    normalizeString(body.slug, 120) ?? title
  );

  const { data: brief, error: briefError } = await supabaseAdmin
    .from("swarm_briefs")
    .insert({
      owner_agent_id: agent.id,
      slug,
      title,
      business_name: businessName ?? null,
      represented_entity: representedEntity ?? null,
      product_name: productName,
      summary,
      region: region ?? null,
      target_outcome: targetOutcome ?? null,
      budget_range: budgetRange ?? null,
      stage,
      tags,
      public: true,
    } as never)
    .select("*")
    .single();

  if (briefError || !brief) {
    return NextResponse.json(
      { error: "Failed to create swarm brief" },
      { status: 500 }
    );
  }

  let insertedRoles: Array<Record<string, unknown>> = [];

  if (roles.length) {
    const { data: roleRows, error: rolesError } = await supabaseAdmin
      .from("swarm_roles")
      .insert(
        roles.map((role) => ({
          swarm_brief_id: brief.id,
          role_type: role.role_type,
          title: role.title,
          category: role.category,
          description: role.description ?? null,
          region: role.region ?? region ?? null,
          budget_range: role.budget_range ?? null,
          desired_capabilities: role.desired_capabilities,
          priority: role.priority,
        })) as never
      )
      .select("*");

    if (rolesError) {
      await supabaseAdmin.from("swarm_briefs").delete().eq("id", brief.id);
      return NextResponse.json(
        { error: "Failed to create swarm roles" },
        { status: 500 }
      );
    }

    insertedRoles = roleRows ?? [];

    if (publishIntents && insertedRoles.length) {
      const { error: intentsError } = await supabaseAdmin
        .from("intents")
        .insert(
          insertedRoles.map((role) => ({
            agent_id: agent.id,
            swarm_brief_id:
              typeof role.id === "string" && isUuid(brief.id) ? brief.id : null,
            swarm_role_id:
              typeof role.id === "string" && isUuid(role.id) ? role.id : null,
            type: "seeking",
            category: role.category,
            title: role.title,
            description: buildRoleIntentDescription({
              briefTitle: title,
              productName,
              summary,
              roleTitle: role.title as string,
              roleDescription:
                typeof role.description === "string" ? role.description : null,
            }),
            budget_range:
              typeof role.budget_range === "string" ? role.budget_range : null,
            region:
              typeof role.region === "string"
                ? role.region
                : region ?? null,
          })) as never
        );

      if (intentsError) {
        await supabaseAdmin.from("swarm_briefs").delete().eq("id", brief.id);
        return NextResponse.json(
          { error: "Failed to publish swarm role intents" },
          { status: 500 }
        );
      }
    }
  }

  await supabaseAdmin.from("feed_events").insert({
    agent_id: agent.id,
    event_type: "intent_posted",
    content: `${agent.name} published a swarm brief: ${title}`,
    metadata: {
      swarm_brief_id: brief.id,
      agent_name: agent.name,
      avatar_color: agent.avatar_color,
      tier: agent.tier,
    },
  });

  return NextResponse.json(
    {
      swarm_brief: brief,
      roles: insertedRoles,
    },
    { status: 201 }
  );
}
