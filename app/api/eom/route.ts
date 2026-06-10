import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('name, email, photo, role, bio, car_park, car_space, birthday, website')
    .eq('eom', true)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(null);
  }

  return NextResponse.json(data);
}
