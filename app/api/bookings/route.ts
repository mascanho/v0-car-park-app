import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function extractInitials(name: string): string {
  return name
    .split(/[\s._/-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 2)
    || name.charAt(0).toUpperCase();
}

export async function GET() {
  const supabase = await createClient();
  
  let allData: any[] = [];
  let start = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .range(start, start + pageSize - 1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    start += pageSize;
    if (data.length < pageSize) break;
  }
  
  const bookings = allData.map((b) => ({
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
  const authUserName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const isAllocation = resolvedUserName !== authUserName;

  // If the user had a different booking on this date, release it
  // Skip for VISITOR to allow multiple visitor allocations per day
  if (resolvedUserName !== 'VISITOR') {
    await supabase
      .from('bookings')
      .delete()
      .eq('car_park_id', carParkId)
      .eq('booking_date', date)
      .eq('user_name', resolvedUserName)
      .neq('space_id', spaceId);
  }

  // Fetch existing booking for this space/date to check for borrow
  const { data: existing } = await supabase
    .from('bookings')
    .select('*')
    .eq('space_id', spaceId)
    .eq('car_park_id', carParkId)
    .eq('booking_date', date)
    .maybeSingle();

  const previousOwner = existing?.user_name;
  const isBorrow = previousOwner && previousOwner !== resolvedUserName;

  // Delete any existing booking for this exact space/date
  const { error: deleteErr } = await supabase
    .from('bookings')
    .delete()
    .eq('space_id', spaceId)
    .eq('car_park_id', carParkId)
    .eq('booking_date', date);

  if (deleteErr) return NextResponse.json({ error: `Delete failed: ${deleteErr.message}` }, { status: 500 });

  // Log booking event
  await supabase.from('borrow_history').insert({
    space_id: spaceId,
    car_park_id: carParkId,
    booking_date: date,
    original_owner: isBorrow ? previousOwner : '[NEW]',
    borrowed_by: resolvedUserName,
    allocated_by: isAllocation ? authUserName : null,
  });

  // Insert the new booking
  const { data: inserted, error: insertErr } = await supabase
    .from('bookings')
    .insert({
      space_id: spaceId,
      car_park_id: carParkId,
      booking_date: date,
      user_name: resolvedUserName,
      initials: extractInitials(resolvedUserName),
      original_user: isBorrow ? previousOwner : existing?.original_user,
    })
    .select();

  if (insertErr) return NextResponse.json({ error: `Insert failed: ${insertErr.message}` }, { status: 500 });
  if (!inserted || inserted.length === 0) return NextResponse.json({ error: 'No rows after insert' }, { status: 500 });

  // Return all bookings for the client
  let allData2: any[] = [];
  let s = 0;
  const ps = 1000;
  while (true) {
    const { data: page } = await supabase.from('bookings').select('*').range(s, s + ps - 1);
    if (!page || page.length === 0) break;
    allData2 = allData2.concat(page);
    s += ps;
    if (page.length < ps) break;
  }

  const allBookings = allData2.map((b) => ({
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
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const carParkId = searchParams.get('carParkId');
  const userName = searchParams.get('userName');
  const userNames = searchParams.getAll('userNames');
  const dates = searchParams.getAll('dates');
  const targetUsers = userNames.length > 0 ? userNames : (userName ? [userName] : []);

  // Bulk delete by specific dates (non-sequential) for users
  if (dates.length > 0 && carParkId && targetUsers.length > 0) {
    const { data: bookings, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('car_park_id', carParkId)
      .in('user_name', targetUsers)
      .in('booking_date', dates);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    for (const booking of bookings || []) {
      await supabase.from('borrow_history').insert({
        space_id: booking.space_id,
        car_park_id: booking.car_park_id,
        booking_date: booking.booking_date,
        original_owner: booking.user_name,
        borrowed_by: '[BULK FREED]',
      });
    }

    const { error: deleteErr } = await supabase
      .from('bookings')
      .delete()
      .eq('car_park_id', carParkId)
      .in('user_name', targetUsers)
      .in('booking_date', dates);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, freedCount: bookings?.length || 0 });
  }

  // Bulk delete by date range for users
  if (startDate && endDate && carParkId && targetUsers.length > 0) {
    const { data: bookings, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('car_park_id', carParkId)
      .in('user_name', targetUsers)
      .gte('booking_date', startDate)
      .lte('booking_date', endDate);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    for (const booking of bookings || []) {
      await supabase.from('borrow_history').insert({
        space_id: booking.space_id,
        car_park_id: booking.car_park_id,
        booking_date: booking.booking_date,
        original_owner: booking.user_name,
        borrowed_by: '[BULK FREED]',
      });
    }

    const { error: deleteErr } = await supabase
      .from('bookings')
      .delete()
      .eq('car_park_id', carParkId)
      .in('user_name', targetUsers)
      .gte('booking_date', startDate)
      .lte('booking_date', endDate);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, freedCount: bookings?.length || 0 });
  }

  // Single delete by id
  if (!id) {
    return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
  }

  // Fetch the booking to log the free event
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (booking) {
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    await supabase.from('borrow_history').insert({
      space_id: booking.space_id,
      car_park_id: booking.car_park_id,
      booking_date: booking.booking_date,
      original_owner: booking.user_name,
      borrowed_by: `${userName} [FREED]`,
    });
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
