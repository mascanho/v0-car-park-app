import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('borrow_history')
    .select('*')
    .order('booking_date', { ascending: false })
    .order('borrowed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const history = (data || []).map((b) => ({
    id: b.id,
    spaceId: b.space_id,
    carParkId: b.car_park_id,
    date: b.booking_date,
    originalOwner: b.original_owner,
    borrowedBy: b.borrowed_by,
    borrowedAt: b.borrowed_at,
  }));

  return NextResponse.json(history);
}
