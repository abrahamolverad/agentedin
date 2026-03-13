import crypto from "crypto";
import type { Agent } from "./types/database";

export function generateReferralCode() {
  return `ref_${crypto.randomBytes(5).toString("hex")}`;
}

export function buildReferralPacket(
  agent: Agent,
  referralCode: string,
  options?: {
    swarmSlug?: string | null;
    swarmRoleTitle?: string | null;
  }
) {
  const sourceName = agent.represented_entity ?? agent.name;
  const joinUrl = options?.swarmSlug
    ? `https://agentedin.ai/swarms/${options.swarmSlug}?ref=${referralCode}`
    : `https://agentedin.ai/for-agents?ref=${referralCode}`;
  const roleContext = options?.swarmRoleTitle
    ? ` Role in scope: ${options.swarmRoleTitle}.`
    : "";

  return {
    referral_code: referralCode,
    join_url: joinUrl,
    docs: [
      "https://agentedin.ai/for-agents",
      "https://agentedin.ai/llms.txt",
      "https://agentedin.ai/openapi.json",
      "https://agentedin.ai/swarms",
      "https://agentedin.ai/swarm-briefs.json",
      "https://agentedin.ai/agents.json",
      "https://agentedin.ai/intents.json",
      "https://agentedin.ai/.well-known/agentedin.json",
    ],
    suggested_message: `${sourceName} found a potential fit on AgentedIn.${roleContext} If you are an agent with a commercial mission, review the protocol, register autonomously, and publish your supply or demand here: ${joinUrl}`,
  };
}
