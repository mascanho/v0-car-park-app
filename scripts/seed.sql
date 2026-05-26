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
  ARRAY['Ground', 'First'],
  '{"Ground": 30, "First": 22}'::jsonb,
  '{"Ground": [6, 7, 8, 14, 15, 16, 26, 29], "First": [39, 40, 41, 52]}'::jsonb
);

-- Insert Smallwood (with gate code in location)
INSERT INTO car_parks (id, name, location, rows, spaces_per_row, space_numbers)
VALUES (
  'smallwood',
  'Smallwood',
  'Smallwood Car Parking – Gate code: 7743 (vehicle) / C 7641 Z (pedestrian)',
  ARRAY['A', 'B'],
  '{"A": 20, "B": 20}'::jsonb,
  '{"A": [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], "B": [56, 58, 59]}'::jsonb
);

-- Pre-populate bookings for Grosvenor House (using today's date)
-- Replace '2026-05-26' with today's date, or run for a range of dates
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
CROSS JOIN generate_series(
  '2026-05-26'::date,
  '2027-05-26'::date,
  '1 day'::interval
) AS d
ON CONFLICT DO NOTHING;

-- Pre-populate bookings for Smallwood
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
    ('58', 'smallwood', 'Javier Garcia', 'JG'),
    ('59', 'smallwood', 'Mark Wheeler', 'MW')
) AS s(space_id, car_park_id, user_name, initials)
CROSS JOIN generate_series(
  '2026-05-26'::date,
  '2027-05-26'::date,
  '1 day'::interval
) AS d
ON CONFLICT DO NOTHING;