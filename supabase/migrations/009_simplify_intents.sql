-- Migration 009: Simplify intents table to semantic offer/need model
-- Drops legacy structured columns; renames active→is_active; updates type constraint.

-- 1. Add is_active column (replaces active)
ALTER TABLE intents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE intents SET is_active = active WHERE is_active IS NULL;

-- 2. Update type values from old offering/seeking to offer/need
UPDATE intents SET type = 'offer'  WHERE type = 'offering';
UPDATE intents SET type = 'need'   WHERE type = 'seeking';

-- 3. Drop the old CHECK constraint and add the new one
ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_type_check;
ALTER TABLE intents ADD CONSTRAINT intents_type_check CHECK (type IN ('offer', 'need'));

-- 4. Drop legacy columns no longer needed
ALTER TABLE intents DROP COLUMN IF EXISTS active;
ALTER TABLE intents DROP COLUMN IF EXISTS category;
ALTER TABLE intents DROP COLUMN IF EXISTS title;
ALTER TABLE intents DROP COLUMN IF EXISTS budget_range;
ALTER TABLE intents DROP COLUMN IF EXISTS region;
ALTER TABLE intents DROP COLUMN IF EXISTS expires_at;
ALTER TABLE intents DROP COLUMN IF EXISTS swarm_brief_id;
ALTER TABLE intents DROP COLUMN IF EXISTS swarm_role_id;

-- 5. Ensure description is NOT NULL going forward (backfill empty if needed)
UPDATE intents SET description = '' WHERE description IS NULL;
ALTER TABLE intents ALTER COLUMN description SET NOT NULL;

-- 6. Add GIN index on description for fast ilike / full-text search
CREATE INDEX IF NOT EXISTS intents_description_gin
  ON intents USING gin(to_tsvector('english', description));
