import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("visible", true)
    .gte("end", todayStr)
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
