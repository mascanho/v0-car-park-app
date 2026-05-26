import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const carParkId = searchParams.get('carParkId');
  
  const supabase = await createClient();
  
  let query = supabase.from('bookings').select('*');
  
  if (date) {
    query = query.eq('booking_date', date);
  }
  
  if (carParkId) {
    query = query.eq('car_park_id', carParkId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Transform to match our Booking interface
  const bookings = data.map((b) => ({
    id: b.id,
    spaceId: b.space_id,
    carParkId: b.car_park_id,
    date: b.booking_date,
    userName: b.user_name,
  }));
  
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { spaceId, carParkId, date, userName } = body;
  
  if (!spaceId || !carParkId || !date || !userName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      space_id: spaceId,
      car_park_id: carParkId,
      booking_date: date,
      user_name: userName,
    })
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Space already booked for this date' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    id: data.id,
    spaceId: data.space_id,
    carParkId: data.car_park_id,
    date: data.booking_date,
    userName: data.user_name,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
