import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("visible", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: `Supabase error: ${error.message}` },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    title: data.title || "",
    description: data.description || "",
  });
}
