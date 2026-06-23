import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const FULL_SELECT = 'name, email, car_park, car_space, is_regular, birthday, photo, bio, website, role';
const FALLBACK_SELECT = 'name, email, car_park, car_space, is_regular, birthday';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let { data, error } = await supabase
    .from('users')
    .select(FULL_SELECT)
    .order('name');

  if (error) {
    const { data: fallback } = await supabase
      .from('users')
      .select(FALLBACK_SELECT)
      .order('name');
    data = (fallback || []) as typeof data;
  }

  return NextResponse.json(data || []);
}
