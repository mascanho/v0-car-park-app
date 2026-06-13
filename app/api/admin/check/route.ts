import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const email = user.email || "";
  const name = user.user_metadata?.full_name || "";

  const { data } = await supabase
    .from("users")
    .select("admin")
    .or(`email.ilike.${email},name.ilike.${name}`)
    .maybeSingle();

  return NextResponse.json({ isAdmin: data?.admin === true });
}
