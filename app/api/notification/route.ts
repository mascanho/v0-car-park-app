import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("notification")
    .select("id, title, description, end")
    .eq("visible", true)
    .gte("end", todayStr)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: `Supabase error: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>, user: { email?: string }) {
  const { data } = await supabase
    .from("users")
    .select("admin")
    .ilike("email", user.email || "")
    .maybeSingle();
  return data?.admin === true;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await requireAdmin(supabase, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, end } = await request.json();

  if (!title || !end) {
    return NextResponse.json(
      { error: "Title and end date are required" },
      { status: 400 },
    );
  }

  // Try to update existing visible notification by ID
  const { data: existing } = await supabase
    .from("notification")
    .select("id")
    .eq("visible", true)
    .maybeSingle();

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("notification")
      .update({ title, description: description || "", end })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      // Update failed, try delete + insert as fallback
      await supabase.from("notification").delete().eq("id", existing.id);

      const { data: inserted, error: insertError } = await supabase
        .from("notification")
        .insert({ title, description: description || "", end, visible: true })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: `Failed to save: ${insertError.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({
        id: inserted.id,
        title: inserted.title,
        description: inserted.description,
        end: inserted.end,
      });
    }

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      end: updated.end,
    });
  }

  // No existing notification, insert directly
  const { data: inserted, error: insertError } = await supabase
    .from("notification")
    .insert({ title, description: description || "", end, visible: true })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `Failed to save: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: inserted.id,
    title: inserted.title,
    description: inserted.description,
    end: inserted.end,
  });
}

export async function DELETE() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await requireAdmin(supabase, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Try update first (visible = false)
  const { data: updated, error: updateError } = await supabase
    .from("notification")
    .update({ visible: false })
    .eq("visible", true)
    .select();

  if (updateError) {
    return NextResponse.json(
      { error: `Supabase error: ${updateError.message}` },
      { status: 500 },
    );
  }

  if (updated && updated.length > 0) {
    return NextResponse.json({ success: true });
  }

  // Update affected 0 rows — try deleting the row directly
  const { data: deleted, error: deleteError } = await supabase
    .from("notification")
    .delete()
    .eq("visible", true)
    .select();

  if (deleteError) {
    return NextResponse.json(
      { error: `Could not remove notification. Run this SQL in Supabase dashboard to fix: ALTER TABLE notification DISABLE ROW LEVEL SECURITY;` },
      { status: 500 },
    );
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json(
      { error: "No visible notification found to remove" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
