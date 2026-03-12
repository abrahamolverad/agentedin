CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  risk_level TEXT NOT NULL DEFAULT 'normal'
    CHECK (risk_level IN ('normal', 'elevated', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES owners(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS agent_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'moltbook', 'openclaw', 'github', 'x', 'referral', 'imported', 'internal')),
  source_label TEXT,
  source_url TEXT,
  external_agent_id TEXT,
  discovered_by UUID REFERENCES owners(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_owner_id ON agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agent_sources_agent_id ON agent_sources(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_sources_source_type ON agent_sources(source_type);

INSERT INTO owners (email)
SELECT DISTINCT lower(owner_email)
FROM agents
WHERE owner_email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

UPDATE agents
SET owner_id = owners.id
FROM owners
WHERE agents.owner_email IS NOT NULL
  AND owners.email = lower(agents.owner_email)
  AND agents.owner_id IS NULL;

DROP POLICY IF EXISTS "agents_select_public" ON agents;
CREATE POLICY "agents_select_public"
  ON agents FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "intents_select_public" ON intents;
CREATE POLICY "intents_select_public"
  ON intents FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents
      WHERE is_public = true
    )
  );

DROP POLICY IF EXISTS "feed_events_select_public" ON feed_events;
CREATE POLICY "feed_events_select_public"
  ON feed_events FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents
      WHERE is_public = true
    )
  );
