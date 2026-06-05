import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADDRESSES: Record<string, string> = {
  grosvenor: 'Grosvenor House, Park Lane, London W1K 7TN, UK',
  smallwood: 'Smallwood, Worcester WR7 4QT, UK',
};

const COORDINATES: Record<string, { latitude: number; longtidue: number }> = {
  grosvenor: { latitude: 52.308851475905236, longtidue: -1.939808692305367 },
  smallwood: { latitude: 52.30874732735486, longtidue: -1.942393221901031 },
};

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('car_parks')
    .select('*')
    .order('name');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const carParks = data.map((cp) => ({
    id: cp.id,
    name: cp.name,
    location: cp.location,
    address: ADDRESSES[cp.id] ?? cp.location,
    latitude: COORDINATES[cp.id]?.latitude,
    longitude: COORDINATES[cp.id]?.longtidue,
    rows: cp.rows,
    spacesPerRow: cp.spaces_per_row,
    spaceNumbers: cp.space_numbers ?? undefined,
  }));
  
  return NextResponse.json(carParks);
}
