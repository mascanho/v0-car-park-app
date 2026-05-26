import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) { console.error('Missing env vars'); process.exit(1); }

const supabase = createClient(url, key);

const grosvenorSpaces = [
  ['6',  'grosvenor', 'Hayley Thornton', 'HT'],
  ['7',  'grosvenor', 'Natasha Cooper', 'NC'],
  ['8',  'grosvenor', 'Jessie Cooper', 'JC'],
  ['14', 'grosvenor', 'Jenny Lowrie / Samara Simons', 'JL / SS'],
  ['15', 'grosvenor', 'Emily Berry', 'EB'],
  ['16', 'grosvenor', 'Sam Phipps', 'SP'],
  ['26', 'grosvenor', 'Mike Donnelly', 'MD'],
  ['29', 'grosvenor', 'Will Severn', 'WS'],
  ['39', 'grosvenor', 'Lee Eagleton', 'LE'],
  ['40', 'grosvenor', 'Adam Greensmith', 'AG'],
  ['41', 'grosvenor', 'Jack Shortt', 'JS'],
  ['52', 'grosvenor', 'Richard Evans', 'RE'],
];

const smallwoodSpaces = [
  ['31', 'smallwood', 'Lisa Berry', 'LB'],
  ['32', 'smallwood', 'Jason Haller', 'JH'],
  ['33', 'smallwood', 'Samual Round', 'SR'],
  ['34', 'smallwood', 'Andrew Brush', 'AB'],
  ['35', 'smallwood', 'Chris Robertson', 'CR'],
  ['36', 'smallwood', 'Joshua Taiwo', 'JT'],
  ['37', 'smallwood', 'Rob Hutton', 'RH'],
  ['38', 'smallwood', 'Zu Ali', 'ZA'],
  ['39', 'smallwood', 'Marco Guerreirco', 'MG'],
  ['40', 'smallwood', 'Victoria Lima', 'VL'],
  ['56', 'smallwood', 'Rob Crellin', 'RC'],
  ['58', 'smallwood', 'Javier Garcia', 'JG'],
  ['59', 'smallwood', 'Mark Wheeler', 'MW'],
];

function dateStr(d) { return d.toISOString().split('T')[0]; }

function* dateRange(start, end) {
  const d = new Date(start);
  while (d <= end) { yield new Date(d); d.setDate(d.getDate() + 1); }
}

async function deleteAll() {
  console.log('Deleting existing bookings...');
  const { error } = await supabase
    .from('bookings')
    .delete()
    .in('car_park_id', ['grosvenor', 'smallwood']);
  if (error) { console.error('Delete failed:', error.message); throw error; }
  console.log('Done.');
}

async function insertBatch(spaces, batchStart, batchEnd) {
  const rows = [];
  for (const [spaceId, carParkId, userName, initials] of spaces) {
    for (const d of dateRange(batchStart, batchEnd)) {
      rows.push({
        space_id: spaceId,
        car_park_id: carParkId,
        booking_date: dateStr(d),
        user_name: userName,
        initials,
      });
    }
  }
  const { error } = await supabase.from('bookings').insert(rows);
  if (error) { console.error(`Batch insert failed (${batchStart} – ${batchEnd}):`, error.message); throw error; }
  console.log(`  Inserted ${rows.length} rows for ${batchStart} – ${batchEnd}`);
}

async function seedCarPark(spaces, label) {
  console.log(`\nSeeding ${label}...`);
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);

  let batchStart = new Date(now);
  while (batchStart < end) {
    const batchEnd = new Date(batchStart);
    batchEnd.setDate(batchEnd.getDate() + 89);
    if (batchEnd > end) batchEnd.setTime(end.getTime());
    await insertBatch(spaces, batchStart, batchEnd);
    batchStart.setDate(batchStart.getDate() + 90);
  }
}

async function main() {
  console.log('Starting seed...\n');
  await deleteAll();
  await seedCarPark(grosvenorSpaces, 'Grosvenor House');
  await seedCarPark(smallwoodSpaces, 'Smallwood');
  console.log('\nSeed complete!');
}

main().catch(console.error);
