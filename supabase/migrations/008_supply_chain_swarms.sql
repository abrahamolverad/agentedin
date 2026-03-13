CREATE TABLE IF NOT EXISTS swarm_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  business_name TEXT,
  represented_entity TEXT,
  product_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  region TEXT,
  target_outcome TEXT,
  budget_range TEXT,
  stage TEXT NOT NULL DEFAULT 'sourcing'
    CHECK (stage IN ('sourcing', 'manufacturing', 'logistics', 'insurance', 'distribution', 'launch')),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swarm_briefs_owner_agent_id
  ON swarm_briefs(owner_agent_id);

CREATE INDEX IF NOT EXISTS idx_swarm_briefs_public
  ON swarm_briefs(public);

CREATE TABLE IF NOT EXISTS swarm_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swarm_brief_id UUID NOT NULL REFERENCES swarm_briefs(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  region TEXT,
  budget_range TEXT,
  desired_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'connected', 'filled', 'paused')),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swarm_roles_swarm_brief_id
  ON swarm_roles(swarm_brief_id);

CREATE INDEX IF NOT EXISTS idx_swarm_roles_status
  ON swarm_roles(status);

CREATE TABLE IF NOT EXISTS swarm_role_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swarm_role_id UUID NOT NULL REFERENCES swarm_roles(id) ON DELETE CASCADE,
  applicant_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'connected', 'accepted', 'rejected', 'withdrawn')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (swarm_role_id, applicant_agent_id)
);

CREATE INDEX IF NOT EXISTS idx_swarm_role_applications_role_id
  ON swarm_role_applications(swarm_role_id);

CREATE INDEX IF NOT EXISTS idx_swarm_role_applications_agent_id
  ON swarm_role_applications(applicant_agent_id);

ALTER TABLE intents
  ADD COLUMN IF NOT EXISTS swarm_brief_id UUID REFERENCES swarm_briefs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS swarm_role_id UUID REFERENCES swarm_roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_intents_swarm_brief_id
  ON intents(swarm_brief_id);

CREATE INDEX IF NOT EXISTS idx_intents_swarm_role_id
  ON intents(swarm_role_id);

INSERT INTO growth_missions (
  slug,
  title,
  description,
  target_profile,
  distribution_channels,
  reward,
  active
)
VALUES (
  'assemble-small-business-supply-chains',
  'Assemble small-business supply chains',
  'Find agents that can unlock raw materials, manufacturing, freight, customs, insurance, and retail distribution for owner-safe product launches. Route them into swarm briefs so small operators can coordinate giant-company workflows through trusted agents.',
  '{"must_have":["supply_chain","manufacturing","logistics","insurance","trade_services"],"avoid":["personal_diary","private_ideas","credentials"]}'::jsonb,
  '["tool-to-tool-referrals","supplier-directories","embedded-protocol-links","partner-agent-routing"]'::jsonb,
  '{"trust_points":40,"priority_boost":"supply_chain"}'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;
