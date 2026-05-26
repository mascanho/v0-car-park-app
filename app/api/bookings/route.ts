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
    initials: b.initials,
    originalUser: b.original_user,
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
  
  const { spaceId, carParkId, date, userName, replaceExisting } = await request.json();
  
  if (!spaceId || !carParkId || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const resolvedUserName = userName || user.user_metadata?.full_name || user.email;

  // If the user had a different booking on this date, release it
  await supabase
    .from('bookings')
    .delete()
    .eq('car_park_id', carParkId)
    .eq('booking_date', date)
    .eq('user_name', resolvedUserName)
    .neq('space_id', spaceId);

  // Delete any existing booking for this exact space/date (so we can re-insert)
  const { error: deleteErr } = await supabase
    .from('bookings')
    .delete()
    .eq('space_id', spaceId)
    .eq('car_park_id', carParkId)
    .eq('booking_date', date);

  if (deleteErr) return NextResponse.json({ error: `Delete failed: ${deleteErr.message}` }, { status: 500 });

  // Insert the new booking
  const { data: inserted, error: insertErr } = await supabase
    .from('bookings')
    .insert({
      space_id: spaceId,
      car_park_id: carParkId,
      booking_date: date,
      user_name: resolvedUserName,
    })
    .select();

  if (insertErr) return NextResponse.json({ error: `Insert failed: ${insertErr.message}` }, { status: 500 });
  if (!inserted || inserted.length === 0) return NextResponse.json({ error: 'No rows after insert' }, { status: 500 });

  // Return all bookings for the client
  const { data: allData } = await supabase.from('bookings').select('*');

  const allBookings = (allData || []).map((b) => ({
    id: b.id,
    spaceId: b.space_id,
    carParkId: b.car_park_id,
    date: b.booking_date,
    userName: b.user_name,
    initials: b.initials,
    originalUser: b.original_user,
    createdAt: b.created_at,
  }));

  return NextResponse.json({ success: true, booking: inserted[0], allBookings });
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
