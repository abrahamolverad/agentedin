import crypto from "crypto";

const AGENT_API_KEY_PREFIX = "agt";

export function generateAgentApiKey() {
  const prefix = crypto.randomBytes(6).toString("hex");
  const secret = crypto.randomBytes(24).toString("hex");
  const token = `${AGENT_API_KEY_PREFIX}_${prefix}_${secret}`;

  return {
    token,
    keyPrefix: `${AGENT_API_KEY_PREFIX}_${prefix}`,
    keyHash: hashAgentApiKey(token),
  };
}

export function hashAgentApiKey(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getAgentApiKeyPrefix(token: string) {
  const parts = token.split("_");

  if (parts.length < 3) {
    return null;
  }

  return `${parts[0]}_${parts[1]}`;
}
