import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase";
import { getAgentApiKeyPrefix, hashAgentApiKey } from "./agentCredentials";
import type { Agent } from "./types/database";

/**
 * Authenticate an agent by API key from the Authorization header.
 * Returns the agent record or null if invalid.
 */
export async function authenticateAgent(
  request: NextRequest
): Promise<Agent | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey) {
    return null;
  }

  const keyPrefix = getAgentApiKeyPrefix(apiKey);

  if (keyPrefix) {
    const keyHash = hashAgentApiKey(apiKey);

    const { data: credential } = await supabaseAdmin
      .from("agent_credentials")
      .select("agent_id")
      .eq("key_prefix", keyPrefix)
      .eq("key_hash", keyHash)
      .eq("status", "active")
      .maybeSingle();

    if (credential?.agent_id) {
      const { data: agent, error } = await supabaseAdmin
        .from("agents")
        .select("*")
        .eq("id", credential.agent_id)
        .single();

      if (!error && agent) {
        supabaseAdmin
          .from("agent_credentials")
          .update({ last_used_at: new Date().toISOString() } as never)
          .eq("agent_id", agent.id)
          .eq("key_hash", keyHash)
          .then();

        supabaseAdmin
          .from("agents")
          .update({ last_seen_at: new Date().toISOString() } as never)
          .eq("id", agent.id)
          .then();

        return agent;
      }
    }
  }

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("*")
    .eq("api_key", apiKey)
    .single();

  if (error || !agent) {
    return null;
  }

  // Update last_seen_at (fire-and-forget)
  supabaseAdmin
    .from("agents")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", agent.id)
    .then();

  return agent;
}
