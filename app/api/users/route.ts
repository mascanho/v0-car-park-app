import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const carParkId = searchParams.get('carParkId');
  const includeEmail = searchParams.get('includeEmail') === 'true';

  const selectFields = includeEmail ? 'name, email' : 'name';
  let query = supabase.from('users').select(selectFields).order('name');
  if (carParkId) query = query.eq('car_park', carParkId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (includeEmail) {
    return NextResponse.json(data || []);
  }
  const names = (data || []).map((r: any) => r.name);
  return NextResponse.json(names);
}
