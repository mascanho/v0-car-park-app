-- Employee of the Month table: tracks which user was EOM for each month/year
CREATE TABLE IF NOT EXISTS employee_of_month (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  UNIQUE(month, year)
);

-- Seed some known months, leave others as pending (no row = pending)
INSERT INTO employee_of_month (user_name, month, year) VALUES
  ('Emily Berry', 1, 2026),
  ('Marco Guerreiro', 2, 2026),
  ('Jessie Cooper', 3, 2026),
  ('Natasha Cooper', 4, 2026),
  ('Lisa Berry', 5, 2026),
  ('Sam Phipps', 7, 2026),
  ('Mike Donnelly', 12, 2026)
ON CONFLICT (month, year) DO NOTHING;
