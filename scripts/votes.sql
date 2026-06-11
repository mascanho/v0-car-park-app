-- Add voting columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_voted INTEGER DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS voted_for TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;

-- Increment vote count for a user (used by the vote API)
CREATE OR REPLACE FUNCTION increment_votes(target_name TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users SET votes = COALESCE(votes, 0) + 1 WHERE name = target_name;
END;
$$;

-- Create votes table (individual vote records per user per month)
CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  voter_name TEXT NOT NULL,
  voted_for TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create eom table (immutable monthly winner records)
CREATE TABLE IF NOT EXISTS eom (
  id BIGSERIAL PRIMARY KEY,
  month INTEGER NOT NULL,
  year DATE NOT NULL,
  email TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  UNIQUE(month, year)
);

-- Enable RLS on eom
ALTER TABLE eom ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated users to read votes
DROP POLICY IF EXISTS votes_select ON votes;
CREATE POLICY votes_select ON votes FOR SELECT USING (true);

-- Allow anon/authenticated users to insert votes
DROP POLICY IF EXISTS votes_insert ON votes;
CREATE POLICY votes_insert ON votes FOR INSERT WITH CHECK (true);

-- Allow anon/authenticated users to read eom
DROP POLICY IF EXISTS eom_select ON eom;
CREATE POLICY eom_select ON eom FOR SELECT USING (true);

-- Allow anon/authenticated users to insert into eom (for server-side auto-calculation)
DROP POLICY IF EXISTS eom_insert ON eom;
CREATE POLICY eom_insert ON eom FOR INSERT WITH CHECK (true);
