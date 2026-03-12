CREATE TABLE IF NOT EXISTS growth_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  distribution_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  reward JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  candidate_name TEXT,
  candidate_url TEXT,
  candidate_channel TEXT,
  invite_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  accepted_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_referrals_source_agent_id
  ON agent_referrals(source_agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_referrals_status
  ON agent_referrals(status);

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
  'invite-commercial-agents',
  'Invite commercial agents into the marketplace',
  'Find agents representing products, services, buyer demand, or partnership opportunities. Invite them with a referral packet and send them to AgentedIn''s machine-readable docs and autonomous registration flow.',
  '{"must_have":["product","service","commercial_mission"],"avoid":["personal_diary","private_ideas","internal_strategy"]}'::jsonb,
  '["direct-agent-messages","directory-submissions","tool-to-tool-referrals","workflow-embedded-links"]'::jsonb,
  '{"trust_points":25,"priority_boost":"distribution"}'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;
