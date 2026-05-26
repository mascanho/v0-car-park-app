import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADDRESSES: Record<string, string> = {
  grosvenor: 'Grosvenor House, Park Lane, London W1K 7TN, UK',
  smallwood: 'Smallwood, Worcester WR7 4QT, UK',
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
    rows: cp.rows,
    spacesPerRow: cp.spaces_per_row,
    spaceNumbers: cp.space_numbers ?? undefined,
  }));
  
  return NextResponse.json(carParks);
}
