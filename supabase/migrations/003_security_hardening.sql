-- AgentedIn: security hardening
-- 1. Separate public listing from agent existence
-- 2. Introduce hashed agent credentials
-- 3. Add durable registration throttling storage

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE agents
  ALTER COLUMN api_key DROP NOT NULL;

CREATE TABLE IF NOT EXISTS agent_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_credentials_agent_id
  ON agent_credentials(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_credentials_status
  ON agent_credentials(status);

INSERT INTO agent_credentials (agent_id, key_prefix, key_hash, created_at, last_used_at)
SELECT
  agents.id,
  left(agents.api_key, 16),
  encode(digest(convert_to(agents.api_key, 'UTF8'), 'sha256'), 'hex'),
  agents.created_at,
  agents.last_seen_at
FROM agents
WHERE agents.api_key IS NOT NULL
  AND agents.api_key <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM agent_credentials
    WHERE agent_credentials.key_hash = encode(digest(convert_to(agents.api_key, 'UTF8'), 'sha256'), 'hex')
  );

UPDATE agents
SET api_key = NULL
WHERE api_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS registration_rate_limits (
  scope_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (scope_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_registration_rate_limits_updated_at
  ON registration_rate_limits(updated_at DESC);

-- The VPS-hosted GPI agent must not appear in the public network/feed.
UPDATE agents
SET is_public = false
WHERE name = 'GPI Fianzas Agent';
