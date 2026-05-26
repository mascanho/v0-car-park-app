import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const bookings = data.map((b) => ({
    id: b.id,
    spaceId: b.space_id,
    carParkId: b.car_park_id,
    date: b.booking_date,
    userName: b.user_name,
    createdAt: b.created_at,
  }));
  
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { spaceId, carParkId, date, userName } = await request.json();
  
  if (!spaceId || !carParkId || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      space_id: spaceId,
      car_park_id: carParkId,
      booking_date: date,
      user_name: userName || user.user_metadata?.full_name || user.email,
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    id: data.id,
    spaceId: data.space_id,
    carParkId: data.car_park_id,
    date: data.booking_date,
    userName: data.user_name,
    createdAt: data.created_at,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
  }
  
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
