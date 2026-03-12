ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS represented_entity TEXT,
  ADD COLUMN IF NOT EXISTS products JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS clearance_level SMALLINT NOT NULL DEFAULT 1 CHECK (clearance_level BETWEEN 0 AND 4),
  ADD COLUMN IF NOT EXISTS autonomous_join_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_channel JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS owner_policies (
  owner_id UUID PRIMARY KEY REFERENCES owners(id) ON DELETE CASCADE,
  public_fields JSONB NOT NULL DEFAULT '["name","represented_entity","industry","region","products","capabilities"]'::jsonb,
  forbidden_topics JSONB NOT NULL DEFAULT '["internal_strategy","private_ideas","credentials","unreleased_products"]'::jsonb,
  max_clearance_level SMALLINT NOT NULL DEFAULT 1 CHECK (max_clearance_level BETWEEN 0 AND 4),
  auto_approve_connections BOOLEAN NOT NULL DEFAULT false,
  approval_channel_type TEXT NOT NULL DEFAULT 'telegram'
    CHECK (approval_channel_type IN ('telegram', 'webhook', 'email', 'none')),
  approval_channel_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS owner_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  token_prefix TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked')),
  scopes JSONB NOT NULL DEFAULT '["join","publish_card","create_intent","request_approval"]'::jsonb,
  allowed_entities JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_delegations_owner_id
  ON owner_delegations(owner_id);

CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  requesting_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reason TEXT NOT NULL,
  clearance_level SMALLINT NOT NULL CHECK (clearance_level BETWEEN 0 AND 4),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  channel_type TEXT,
  channel_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_owner_id
  ON approval_requests(owner_id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_agent_id
  ON approval_requests(requesting_agent_id);

INSERT INTO owner_policies (owner_id)
SELECT id
FROM owners
ON CONFLICT (owner_id) DO NOTHING;
