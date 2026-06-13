
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
  '{"A": 30, "B": 22}'::jsonb,
  '{"A": [6, 7, 8, 14, 15, 16, 26, 29], "B": [39, 40, 41, 52]}'::jsonb
);

-- Insert Smallwood (with gate code in location)
INSERT INTO car_parks (id, name, location, rows, spaces_per_row, space_numbers)
VALUES (
  'smallwood',
  'Smallwood',
  'Smallwood Car Parking – Gate code: 7743 (vehicle) / C 7641 Z (pedestrian)',
  ARRAY['A', 'B'],
  '{"A": 20, "B": 20}'::jsonb,
  '{"A": [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], "B": [56, 57, 58, 59]}'::jsonb
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
    ('14', 'grosvenor', 'Jenny Lowrie / Samara Simons', 'JL / SS'),
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

-- Grosvenor: months 4-6
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('14', 'grosvenor', 'Jenny Lowrie / Samara Simons', 'JL / SS'),
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

-- Grosvenor: months 7-9
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('14', 'grosvenor', 'Jenny Lowrie / Samara Simons', 'JL / SS'),
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

-- Grosvenor: months 10-12
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('6',  'grosvenor', 'Hayley Thornton', 'HT'),
    ('7',  'grosvenor', 'Natasha Cooper', 'NC'),
    ('8',  'grosvenor', 'Jessie Cooper', 'JC'),
    ('14', 'grosvenor', 'Jenny Lowrie / Samara Simons', 'JL / SS'),
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

-- Smallwood: months 1-3
INSERT INTO bookings (space_id, car_park_id, booking_date, user_name, initials)
SELECT space_id, car_park_id, d::date, user_name, initials
FROM (
  VALUES
    ('31', 'smallwood', 'Lisa Berry', 'LB'),
    ('32', 'smallwood', 'Jason Haller', 'JH'),
    ('33', 'smallwood', 'Samual Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreirco', 'MG'),
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
    ('33', 'smallwood', 'Samual Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreirco', 'MG'),
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
    ('33', 'smallwood', 'Samual Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreirco', 'MG'),
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
    ('33', 'smallwood', 'Samual Round', 'SR'),
    ('34', 'smallwood', 'Andrew Brush', 'AB'),
    ('35', 'smallwood', 'Chris Robertson', 'CR'),
    ('36', 'smallwood', 'Joshua Taiwo', 'JT'),
    ('37', 'smallwood', 'Rob Hutton', 'RH'),
    ('38', 'smallwood', 'Zu Ali', 'ZA'),
    ('39', 'smallwood', 'Marco Guerreirco', 'MG'),
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
