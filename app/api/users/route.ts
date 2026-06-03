import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const carParkId = searchParams.get('carParkId');

  let query = supabase.from('bookings').select('user_name');
  if (carParkId) query = query.eq('car_park_id', carParkId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const names = [...new Set((data || []).map((r) => r.user_name))].sort();
  return NextResponse.json(names);
}
