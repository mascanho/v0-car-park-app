-- Add space_numbers column if it doesn't exist
ALTER TABLE car_parks ADD COLUMN IF NOT EXISTS space_numbers jsonb;

-- Add initials column if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS initials text;

-- Delete old car parks
DELETE FROM car_parks WHERE id IN ('north', 'south', 'grosvenor', 'smallwood');

-- Delete existing bookings for these car parks (so re-insert gets initials)
DELETE FROM bookings WHERE car_park_id IN ('grosvenor', 'smallwood');

-- Insert Grosvenor House
INSERT INTO car_parks (id, name, location, rows, spaces_per_row, space_numbers)
VALUES (
  'grosvenor',
  'Grosvenor House',
  'Grosvenor House Car Parking',
  ARRAY['A', 'B'],
  CAST('{"A": 30, "B": 22}' AS jsonb),
  CAST('{"A": [6, 7, 8, 14, 15, 16, 26, 29], "B": [39, 40, 41, 52]}' AS jsonb)
);

-- Insert Smallwood (with gate code in location)
INSERT INTO car_parks (id, name, location, rows, spaces_per_row, space_numbers)
VALUES (
  'smallwood',
  'Smallwood',
  'Smallwood Car Parking – Gate code: 7743 (vehicle) / C 7641 Z (pedestrian)',
  ARRAY['A', 'B'],
  CAST('{"A": 20, "B": 20}' AS jsonb),
  CAST('{"A": [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], "B": [56, 57, 58, 59]}' AS jsonb)
);

-- Pre-populate bookings in 3-month chunks to avoid SQL editor timeouts
-- Each chunk is ~1100 rows per INSERT (12-13 spaces × ~90 days)

-- Grosvenor: months 1-3
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('15', 'grosvenor', 'Emily Berry', 'EB'),
    ('16', 'grosvenor', 'Sam Phipps', 'SP'),
    ('26', 'grosvenor', 'Mike Donnelly', 'MD'),
    ('29', 'grosvenor', 'Will Severn', 'WS'),
    ('39', 'grosvenor', 'Lee Eagleton', 'LE'),
    ('40', 'grosvenor', 'Adam Greensmith', 'AG'),
    ('41', 'grosvenor', 'Jack Shortt', 'JS'),
    ('52', 'grosvenor', 'Richard Evans', 'RE')
) AS g(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + interval '3 months', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

-- Shared space 14: Samara gets even days, Jenny gets odd days
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Samara Simons', 'SS'
FROM generate_series(CURRENT_DATE, CURRENT_DATE + interval '3 months', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 0
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Jenny Lowrie', 'JL'
FROM generate_series(CURRENT_DATE, CURRENT_DATE + interval '3 months', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 1
ON CONFLICT DO NOTHING;

-- Grosvenor: months 4-6
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('15', 'grosvenor', 'Emily Berry', 'EB'),
    ('16', 'grosvenor', 'Sam Phipps', 'SP'),
    ('26', 'grosvenor', 'Mike Donnelly', 'MD'),
    ('29', 'grosvenor', 'Will Severn', 'WS'),
    ('39', 'grosvenor', 'Lee Eagleton', 'LE'),
    ('40', 'grosvenor', 'Adam Greensmith', 'AG'),
    ('41', 'grosvenor', 'Jack Shortt', 'JS'),
    ('52', 'grosvenor', 'Richard Evans', 'RE')
) AS g(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE + interval '3 months' + interval '1 day', CURRENT_DATE + interval '6 months', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Samara Simons', 'SS'
FROM generate_series(CURRENT_DATE + interval '3 months' + interval '1 day', CURRENT_DATE + interval '6 months', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 0
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Jenny Lowrie', 'JL'
FROM generate_series(CURRENT_DATE + interval '3 months' + interval '1 day', CURRENT_DATE + interval '6 months', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 1
ON CONFLICT DO NOTHING;

-- Grosvenor: months 7-9
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('15', 'grosvenor', 'Emily Berry', 'EB'),
    ('16', 'grosvenor', 'Sam Phipps', 'SP'),
    ('26', 'grosvenor', 'Mike Donnelly', 'MD'),
    ('29', 'grosvenor', 'Will Severn', 'WS'),
    ('39', 'grosvenor', 'Lee Eagleton', 'LE'),
    ('40', 'grosvenor', 'Adam Greensmith', 'AG'),
    ('41', 'grosvenor', 'Jack Shortt', 'JS'),
    ('52', 'grosvenor', 'Richard Evans', 'RE')
) AS g(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE + interval '6 months' + interval '1 day', CURRENT_DATE + interval '9 months', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Samara Simons', 'SS'
FROM generate_series(CURRENT_DATE + interval '6 months' + interval '1 day', CURRENT_DATE + interval '9 months', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 0
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Jenny Lowrie', 'JL'
FROM generate_series(CURRENT_DATE + interval '6 months' + interval '1 day', CURRENT_DATE + interval '9 months', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 1
ON CONFLICT DO NOTHING;

-- Grosvenor: months 10-12
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('15', 'grosvenor', 'Emily Berry', 'EB'),
    ('16', 'grosvenor', 'Sam Phipps', 'SP'),
    ('26', 'grosvenor', 'Mike Donnelly', 'MD'),
    ('29', 'grosvenor', 'Will Severn', 'WS'),
    ('39', 'grosvenor', 'Lee Eagleton', 'LE'),
    ('40', 'grosvenor', 'Adam Greensmith', 'AG'),
    ('41', 'grosvenor', 'Jack Shortt', 'JS'),
    ('52', 'grosvenor', 'Richard Evans', 'RE')
) AS g(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE + interval '9 months' + interval '1 day', CURRENT_DATE + interval '1 year', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Samara Simons', 'SS'
FROM generate_series(CURRENT_DATE + interval '9 months' + interval '1 day', CURRENT_DATE + interval '1 year', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 0
ON CONFLICT DO NOTHING;

INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT '14', 'grosvenor', d::date, 'Jenny Lowrie', 'JL'
FROM generate_series(CURRENT_DATE + interval '9 months' + interval '1 day', CURRENT_DATE + interval '1 year', '1 day'::interval) AS d
WHERE EXTRACT(DAY FROM d) % 2 = 1
ON CONFLICT DO NOTHING;

-- Smallwood: months 1-3
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('31', 'smallwood', 'Lisa Berry', 'LB'),
    ('32', 'smallwood', 'Jason Haller', 'JH'),
    ('33', 'smallwood', 'Samuel Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreiro', 'MG'),
    ('40', 'smallwood', 'Victoria Lima', 'VL'),
    ('56', 'smallwood', 'Rob Crellin', 'RC'),
    ('57', 'smallwood', 'Viv Keech', 'VK'),
    ('58', 'smallwood', 'Javier Garcia', 'JG'),
    ('59', 'smallwood', 'Mark Wheeler', 'MW')
) AS s(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + interval '3 months', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

-- Smallwood: months 4-6
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('31', 'smallwood', 'Lisa Berry', 'LB'),
    ('32', 'smallwood', 'Jason Haller', 'JH'),
    ('33', 'smallwood', 'Samuel Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreiro', 'MG'),
    ('40', 'smallwood', 'Victoria Lima', 'VL'),
    ('56', 'smallwood', 'Rob Crellin', 'RC'),
    ('57', 'smallwood', 'Viv Keech', 'VK'),
    ('58', 'smallwood', 'Javier Garcia', 'JG'),
    ('59', 'smallwood', 'Mark Wheeler', 'MW')
) AS s(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE + interval '3 months' + interval '1 day', CURRENT_DATE + interval '6 months', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

-- Smallwood: months 7-9
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('31', 'smallwood', 'Lisa Berry', 'LB'),
    ('32', 'smallwood', 'Jason Haller', 'JH'),
    ('33', 'smallwood', 'Samuel Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreiro', 'MG'),
    ('40', 'smallwood', 'Victoria Lima', 'VL'),
    ('56', 'smallwood', 'Rob Crellin', 'RC'),
    ('57', 'smallwood', 'Viv Keech', 'VK'),
    ('58', 'smallwood', 'Javier Garcia', 'JG'),
    ('59', 'smallwood', 'Mark Wheeler', 'MW')
) AS s(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE + interval '6 months' + interval '1 day', CURRENT_DATE + interval '9 months', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

-- Smallwood: months 10-12
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('31', 'smallwood', 'Lisa Berry', 'LB'),
    ('32', 'smallwood', 'Jason Haller', 'JH'),
    ('33', 'smallwood', 'Samuel Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreiro', 'MG'),
    ('40', 'smallwood', 'Victoria Lima', 'VL'),
    ('56', 'smallwood', 'Rob Crellin', 'RC'),
    ('57', 'smallwood', 'Viv Keech', 'VK'),
    ('58', 'smallwood', 'Javier Garcia', 'JG'),
    ('59', 'smallwood', 'Mark Wheeler', 'MW')
) AS s(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(CURRENT_DATE + interval '9 months' + interval '1 day', CURRENT_DATE + interval '1 year', '1 day'::interval) AS d
ON CONFLICT DO NOTHING;

-- Notes table for user messages on specific days
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  car_park_id TEXT NOT NULL,
  note_date DATE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_date_carpark ON notes (note_date, car_park_id);

-- Add allocated_by column to borrow_history if upgrading
ALTER TABLE borrow_history ADD COLUMN IF NOT EXISTS allocated_by TEXT;

-- Users table for official user-to-car-park mapping
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  is_regular BOOLEAN NOT NULL DEFAULT TRUE,
  car_park TEXT NOT NULL,
  car_space TEXT NOT NULL,
  birthday TEXT NOT NULL DEFAULT ''
);

-- Ensure the UNIQUE constraint exists even if the table was created without it
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_name_key') THEN
    -- Remove any existing duplicate names before adding the constraint
    DELETE FROM users a USING users b
    WHERE a.id < b.id AND a.name = b.name;
    ALTER TABLE users ADD CONSTRAINT users_name_key UNIQUE (name);
  END IF;
END $$;

INSERT INTO users (name, email, is_regular, car_park, car_space, birthday) VALUES
  ('Adam Greensmith',    'a.greensmith@slimstock.com',  TRUE, 'grosvenor', '40',  '10/06/2026'),
  ('Andrew Brush',       'a.brush@slimstock.com',       TRUE, 'smallwood', '34',  '10/06/2026'),
  ('Chris Robertson',    'c.robertson@slimstock.com',   TRUE, 'smallwood', '35',  '10/06/2026'),
  ('Emily Berry',        'E.Berry@slimstock.com',       TRUE, 'grosvenor', '15',  '10/06/2026'),
  ('Hayley Thornton',    'H.Thornton@slimstock.com',    TRUE, 'grosvenor', '6',   '10/06/2026'),
  ('Jack Shortt',        'j.shortt@slimstock.com',      TRUE, 'grosvenor', '41',  '10/06/2026'),
  ('Jason Haller',       'j.haller@slimstock.com',      TRUE, 'smallwood', '32',  '10/06/2026'),
  ('Javier Garcia',      'j.garcia@slimstock.com',      TRUE, 'smallwood', '58',  '10/06/2026'),
  ('Jessie Cooper',      'j.cooper@slimstock.com',      TRUE, 'grosvenor', '8',   '10/06/2026'),
  ('Joshua Taiwo',       'j.taiwo@slimstock.com',       TRUE, 'smallwood', '36',  '10/06/2026'),
  ('Lee Eagleton',       'l.eagleton@slimstock.com',    TRUE, 'grosvenor', '39',  '10/06/2026'),
  ('Lisa Berry',         'l.berry@slimstock.com',       TRUE, 'smallwood', '31',  '10/06/2026'),
  ('Marco Guerreiro',    'm.guerreiro@slimstock.com',   TRUE, 'smallwood', '39',  '10/06/2026'),
  ('Mark Wheeler',       'm.wheeler@slimstock.com',     TRUE, 'smallwood', '59',  '10/06/2026'),
  ('Mike Donnelly',      'm.donnelly@slimstock.com',    TRUE, 'grosvenor', '26',  '10/06/2026'),
  ('Natasha Cooper',     'n.cooper@slimstock.com',      TRUE, 'grosvenor', '7',   '10/06/2026'),
  ('Richard Evans',      'r.evans@slimstock.com',       TRUE, 'grosvenor', '52',  '10/06/2026'),
  ('Rob Crellin',        'r.crellin@slimstock.com',     TRUE, 'smallwood', '56',  '10/06/2026'),
  ('Rob Hutton',         'r.hutton@slimstock.com',      TRUE, 'smallwood', '37',  '10/06/2026'),
  ('Sam Phipps',         's.phipps@slimstock.com',      TRUE, 'grosvenor', '16',  '10/06/2026'),
  ('Samara Simons',      's.simons@slimstock.com',      TRUE, 'grosvenor', '14',  '10/06/2026'),
  ('Jenny Lowrie',       'j.lowrie@slimstock.com',      TRUE, 'grosvenor', '14',  '10/06/2026'),
  ('Samuel Round',       's.round@slimstock.com',       TRUE, 'smallwood', '33',  '10/06/2026'),
  ('Victoria Lima',      'v.lima@slimstock.com',        TRUE, 'smallwood', '40',  '10/06/2026'),
  ('Viv Keech',          'v.keech@slimstock.com',       TRUE, 'smallwood', '57',  '10/06/2026'),
  ('Will Severn',        'W.Severn@slimstock.com',      TRUE, 'grosvenor', '29',  '10/06/2026'),
  ('Zu Ali',             'z.ali@slimstock.com',         TRUE, 'smallwood', '38',  '10/06/2026')
ON CONFLICT (name) DO NOTHING;
