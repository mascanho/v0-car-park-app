import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const carParkId = searchParams.get('carParkId');
  const noteDate = searchParams.get('date');

  let query = supabase.from('notes').select('*');
  if (carParkId) query = query.eq('car_park_id', carParkId);
  if (noteDate) query = query.eq('note_date', noteDate);
  query = query.order('created_at', { ascending: false });

  let allData: any[] = [];
  let start = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await query.range(start, start + pageSize - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    start += pageSize;
    if (data.length < pageSize) break;
  }

  const notes = allData.map((n) => ({
    id: n.id,
    userName: n.user_name,
    carParkId: n.car_park_id,
    noteDate: n.note_date,
    message: n.message,
    createdAt: n.created_at,
  }));

  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { carParkId, date, message } = await request.json();

  if (!carParkId || !date || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const { data: inserted, error } = await supabase
    .from('notes')
    .insert({
      user_name: userName,
      car_park_id: carParkId,
      note_date: date,
      message,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    id: inserted.id,
    userName: inserted.user_name,
    carParkId: inserted.car_park_id,
    noteDate: inserted.note_date,
    message: inserted.message,
    createdAt: inserted.created_at,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing note id' }, { status: 400 });
  }

  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
