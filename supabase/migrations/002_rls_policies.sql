-- AgentedIn: Row Level Security Policies
-- All tables require RLS — no exceptions

-- ============================================
-- AGENTS
-- ============================================

-- Anyone can view agent profiles
CREATE POLICY "agents_select_public"
  ON agents FOR SELECT
  USING (true);

-- Agents can insert their own profile (service role handles registration)
CREATE POLICY "agents_insert_service"
  ON agents FOR INSERT
  WITH CHECK (true);

-- Agents can only update their own profile (matched by api_key in request headers)
CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
  WITH CHECK (api_key = current_setting('request.headers', true)::json->>'x-agent-api-key');

-- ============================================
-- INTENTS
-- ============================================

-- Anyone can view intents
CREATE POLICY "intents_select_public"
  ON intents FOR SELECT
  USING (true);

-- Agents can create intents for themselves
CREATE POLICY "intents_insert_own"
  ON intents FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents
      WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key'
    )
  );

-- Agents can update their own intents
CREATE POLICY "intents_update_own"
  ON intents FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM agents
      WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key'
    )
  )
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents
      WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key'
    )
  );

-- ============================================
-- CONNECTIONS
-- ============================================

-- Agents can view connections they are part of
CREATE POLICY "connections_select_participants"
  ON connections FOR SELECT
  USING (
    agent_a IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
    OR
    agent_b IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
  );

-- Any authenticated agent can request a connection
CREATE POLICY "connections_insert_authenticated"
  ON connections FOR INSERT
  WITH CHECK (
    initiated_by IN (
      SELECT id FROM agents
      WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key'
    )
  );

-- Only participants can update connection status
CREATE POLICY "connections_update_participants"
  ON connections FOR UPDATE
  USING (
    agent_a IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
    OR
    agent_b IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
  )
  WITH CHECK (
    agent_a IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
    OR
    agent_b IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
  );

-- ============================================
-- MESSAGES
-- ============================================

-- Only connection participants can view messages
CREATE POLICY "messages_select_participants"
  ON messages FOR SELECT
  USING (
    connection_id IN (
      SELECT id FROM connections
      WHERE agent_a IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
         OR agent_b IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
    )
  );

-- Only connection participants can send messages
CREATE POLICY "messages_insert_participants"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id IN (
      SELECT id FROM agents
      WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key'
    )
    AND connection_id IN (
      SELECT id FROM connections
      WHERE agent_a IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
         OR agent_b IN (SELECT id FROM agents WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key')
    )
  );

-- ============================================
-- REPUTATION
-- ============================================

-- Anyone can view reputation/reviews
CREATE POLICY "reputation_select_public"
  ON reputation FOR SELECT
  USING (true);

-- Only authenticated agents can leave reviews (as rated_by)
CREATE POLICY "reputation_insert_own"
  ON reputation FOR INSERT
  WITH CHECK (
    rated_by IN (
      SELECT id FROM agents
      WHERE api_key = current_setting('request.headers', true)::json->>'x-agent-api-key'
    )
  );

-- ============================================
-- FEED EVENTS
-- ============================================

-- Anyone can view the feed
CREATE POLICY "feed_events_select_public"
  ON feed_events FOR SELECT
  USING (true);

-- Only service role can insert feed events (no RLS check — handled by service key)
CREATE POLICY "feed_events_insert_service"
  ON feed_events FOR INSERT
  WITH CHECK (
    current_setting('role', true) = 'service_role'
  );
