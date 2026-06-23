-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read users" ON users;
CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update users" ON users;
CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable RLS (already enabled, but idempotent)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT all bookings
DROP POLICY IF EXISTS "Authenticated users can read all bookings" ON bookings;
CREATE POLICY "Authenticated users can read all bookings"
  ON bookings FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT bookings
DROP POLICY IF EXISTS "Authenticated users can insert bookings" ON bookings;
CREATE POLICY "Authenticated users can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to UPDATE any booking
DROP POLICY IF EXISTS "Authenticated users can update any booking" ON bookings;
CREATE POLICY "Authenticated users can update any booking"
  ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to DELETE bookings
DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON bookings;
CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  USING (true);

-- Add original_user column to track who originally owned the space
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_user TEXT;

-- Simple upsert function — the trigger handles original_user + borrow history
CREATE OR REPLACE FUNCTION upsert_booking(
  p_space_id TEXT,
  p_car_park_id TEXT,
  p_booking_date DATE,
  p_user_name TEXT
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO bookings (space_id, car_park_id, booking_date, user_name)
  VALUES (p_space_id, p_car_park_id, p_booking_date, p_user_name)
  ON CONFLICT (space_id, car_park_id, booking_date)
  DO UPDATE SET user_name = p_user_name
  RETURNING row_to_json(bookings)::jsonb INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Borrow history table: logs every borrow event as a permanent record
CREATE TABLE IF NOT EXISTS borrow_history (
  id SERIAL PRIMARY KEY,
  space_id TEXT NOT NULL,
  car_park_id TEXT NOT NULL,
  booking_date DATE NOT NULL,
  original_owner TEXT NOT NULL,
  borrowed_by TEXT NOT NULL,
  allocated_by TEXT,
  borrowed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_borrow_history_date ON borrow_history (booking_date DESC);
CREATE INDEX IF NOT EXISTS idx_borrow_history_carpark ON borrow_history (car_park_id);

ALTER TABLE borrow_history ADD COLUMN IF NOT EXISTS allocated_by TEXT;

ALTER TABLE borrow_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read borrow history" ON borrow_history;
CREATE POLICY "Authenticated users can read borrow history"
  ON borrow_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert borrow history" ON borrow_history;
CREATE POLICY "Authenticated users can insert borrow history"
  ON borrow_history FOR INSERT WITH CHECK (true);

-- Trigger: auto-log every user_name change + preserve original_user
CREATE OR REPLACE FUNCTION log_borrow_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the borrow event
  INSERT INTO borrow_history (space_id, car_park_id, booking_date, original_owner, borrowed_by)
  VALUES (OLD.space_id, OLD.car_park_id, OLD.booking_date, OLD.user_name, NEW.user_name);

  -- Preserve original_user on the updated row (never overwrite if already set)
  IF NEW.original_user IS NULL THEN
    NEW.original_user := OLD.user_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS borrow_event_trigger ON bookings;
CREATE TRIGGER borrow_event_trigger
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  WHEN (OLD.user_name IS DISTINCT FROM NEW.user_name)
  EXECUTE FUNCTION log_borrow_event();

-- Backfill: create history entries for existing borrows (run once)
INSERT INTO borrow_history (space_id, car_park_id, booking_date, original_owner, borrowed_by)
SELECT space_id, car_park_id, booking_date, original_user, user_name
FROM bookings
WHERE original_user IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM borrow_history LIMIT 1);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  car_park_id TEXT NOT NULL,
  note_date DATE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_date_carpark ON notes (note_date, car_park_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read notes" ON notes;
CREATE POLICY "Authenticated users can read notes"
  ON notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert notes" ON notes;
CREATE POLICY "Authenticated users can insert notes"
  ON notes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete their own notes" ON notes;
CREATE POLICY "Authenticated users can delete their own notes"
  ON notes FOR DELETE USING (true);
