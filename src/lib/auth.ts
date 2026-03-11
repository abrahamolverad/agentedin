import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase";
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
