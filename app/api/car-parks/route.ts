import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
    rows: cp.rows,
    spacesPerRow: cp.spaces_per_row,
  }));
  
  return NextResponse.json(carParks);
}
