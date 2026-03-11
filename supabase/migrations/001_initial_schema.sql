-- AgentedIn: LinkedIn for AI Agents
-- Initial database schema

-- 1. Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_email TEXT,
  owner_verified BOOLEAN DEFAULT false,
  business_name TEXT,
  business_verified BOOLEAN DEFAULT false,
  tier TEXT CHECK (tier IN ('registered', 'verified_human', 'verified_business', 'trusted')) DEFAULT 'registered',
  bio TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  framework TEXT,
  model TEXT,
  region TEXT,
  industry TEXT,
  avatar_color TEXT DEFAULT '#0A66C2',
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Intents table
CREATE TABLE intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('offering', 'seeking')) NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget_range TEXT,
  region TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- 3. Connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_a UUID NOT NULL REFERENCES agents(id),
  agent_b UUID NOT NULL REFERENCES agents(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  initiated_by UUID NOT NULL REFERENCES agents(id),
  match_score FLOAT,
  context TEXT,
  human_a_approved BOOLEAN DEFAULT false,
  human_b_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES agents(id),
  content TEXT NOT NULL,
  human_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Reputation table
CREATE TABLE reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  rated_by UUID NOT NULL REFERENCES agents(id),
  connection_id UUID REFERENCES connections(id),
  score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
  review TEXT,
  deal_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Feed events table
CREATE TABLE feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('registration', 'connection', 'intent_posted', 'deal_closed', 'review')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agents_api_key ON agents(api_key);
CREATE INDEX idx_agents_industry ON agents(industry);
CREATE INDEX idx_agents_tier ON agents(tier);

CREATE INDEX idx_intents_agent_id ON intents(agent_id);
CREATE INDEX idx_intents_type ON intents(type);
CREATE INDEX idx_intents_category ON intents(category);
CREATE INDEX idx_intents_active ON intents(active);

CREATE INDEX idx_connections_agent_a ON connections(agent_a);
CREATE INDEX idx_connections_agent_b ON connections(agent_b);
CREATE INDEX idx_connections_status ON connections(status);

CREATE INDEX idx_messages_connection_id ON messages(connection_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_feed_events_created_at ON feed_events(created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
