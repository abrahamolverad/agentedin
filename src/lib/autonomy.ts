import crypto from "crypto";
import { supabaseAdmin } from "./supabase";
import { normalizeCapabilities, normalizeString } from "./inputValidation";

export interface OwnerPolicy {
  owner_id: string;
  public_fields: string[];
  forbidden_topics: string[];
  max_clearance_level: number;
  auto_approve_connections: boolean;
  approval_channel_type: "telegram" | "webhook" | "email" | "none";
  approval_channel_target: string | null;
}

export function hashDelegationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getDelegationTokenPrefix(token: string) {
  const parts = token.split("_");

  if (parts.length < 3) {
    return null;
  }

  return `${parts[0]}_${parts[1]}`;
}

export function normalizeProducts(value: unknown) {
  return normalizeCapabilities(value);
}

export function composeProfessionalBio(input: {
  representedEntity: string | null;
  businessName: string | null;
  industry: string | null;
  region: string | null;
  products: string[];
  capabilities: string[];
}) {
  const entity = input.representedEntity ?? input.businessName ?? "this organization";
  const focus = input.products.slice(0, 3).join(", ");
  const capabilities = input.capabilities.slice(0, 3).join(", ");
  const region = input.region ? ` in ${input.region}` : "";
  const industry = input.industry ? `${input.industry} ` : "";

  return normalizeString(
    [
      `${entity} ${industry}agent${region}.`,
      focus ? `Represents ${focus}.` : null,
      capabilities ? `Primary capabilities: ${capabilities}.` : null,
    ]
      .filter(Boolean)
      .join(" "),
    280
  );
}

export async function getOwnerPolicy(ownerId: string): Promise<OwnerPolicy | null> {
  const { data } = await supabaseAdmin
    .from("owner_policies")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  return (data as OwnerPolicy | null) ?? null;
}

export async function resolveDelegation(token: string) {
  const tokenPrefix = getDelegationTokenPrefix(token);
  if (!tokenPrefix) {
    return null;
  }

  const { data: delegation } = await supabaseAdmin
    .from("owner_delegations")
    .select("id, owner_id, allowed_entities, expires_at")
    .eq("token_prefix", tokenPrefix)
    .eq("token_hash", hashDelegationToken(token))
    .eq("status", "active")
    .maybeSingle();

  if (!delegation) {
    return null;
  }

  if (delegation.expires_at && new Date(delegation.expires_at).getTime() < Date.now()) {
    return null;
  }

  const { data: owner } = await supabaseAdmin
    .from("owners")
    .select("id, email")
    .eq("id", delegation.owner_id)
    .single();

  if (!owner) {
    return null;
  }

  await supabaseAdmin
    .from("owner_delegations")
    .update({ last_used_at: new Date().toISOString() } as never)
    .eq("id", delegation.id);

  return {
    ownerId: owner.id,
    ownerEmail: owner.email,
    ownerPolicy: await getOwnerPolicy(owner.id),
    allowedEntities: Array.isArray(delegation.allowed_entities)
      ? delegation.allowed_entities.filter((value): value is string => typeof value === "string")
      : [],
  };
}
