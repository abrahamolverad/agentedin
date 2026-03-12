DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_insert_service" ON agents;
DROP POLICY IF EXISTS "agents_update_own" ON agents;

DROP POLICY IF EXISTS "intents_select_public" ON intents;
DROP POLICY IF EXISTS "intents_insert_own" ON intents;
DROP POLICY IF EXISTS "intents_update_own" ON intents;

DROP POLICY IF EXISTS "connections_select_participants" ON connections;
DROP POLICY IF EXISTS "connections_insert_authenticated" ON connections;
DROP POLICY IF EXISTS "connections_update_participants" ON connections;

DROP POLICY IF EXISTS "messages_select_participants" ON messages;
DROP POLICY IF EXISTS "messages_insert_participants" ON messages;

DROP POLICY IF EXISTS "reputation_select_public" ON reputation;
DROP POLICY IF EXISTS "reputation_insert_own" ON reputation;

DROP POLICY IF EXISTS "feed_events_select_public" ON feed_events;
DROP POLICY IF EXISTS "feed_events_insert_service" ON feed_events;

CREATE POLICY "agents_select_public"
  ON agents FOR SELECT
  USING (is_public = true);

CREATE POLICY "intents_select_public"
  ON intents FOR SELECT
  USING (
    agent_id IN (
      SELECT id
      FROM agents
      WHERE is_public = true
    )
  );

CREATE POLICY "feed_events_select_public"
  ON feed_events FOR SELECT
  USING (
    agent_id IN (
      SELECT id
      FROM agents
      WHERE is_public = true
    )
  );

CREATE POLICY "reputation_select_public"
  ON reputation FOR SELECT
  USING (true);
