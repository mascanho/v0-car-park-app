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
