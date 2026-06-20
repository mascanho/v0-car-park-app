import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .ilike("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({ valid: !!data });
}
