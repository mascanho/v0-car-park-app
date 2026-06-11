import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const CURRENT_MONTH = new Date().getMonth() + 1;

export async function GET() {
  const supabase = await createClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = authUser.user.email?.toLowerCase().trim();

  const { data: users } = await supabase
    .from("users")
    .select("name")
    .order("name");

  const candidates = (users ?? []).map((u) => u.name);

  let userHasVoted: number | null = null;
  let userVotedFor: string | null = null;
  let voterName: string | null = null;

  if (email) {
    const { data } = await supabase
      .from("users")
      .select("name, has_voted, voted_for")
      .ilike("email", email)
      .maybeSingle();

    const row = data as { name: string; has_voted: number | null; voted_for: string | null } | null;
    if (row) {
      voterName = row.name;
      userHasVoted = row.has_voted;
      userVotedFor = row.voted_for;
    }
  }

  const alreadyVoted = userHasVoted === CURRENT_MONTH;

  return NextResponse.json({
    candidates,
    alreadyVoted,
    votedFor: alreadyVoted ? userVotedFor : null,
    voterName,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = authUser.user.email?.toLowerCase().trim();

  const { votedFor } = await request.json();

  if (!votedFor || typeof votedFor !== "string") {
    return NextResponse.json({ error: "Missing votedFor" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("has_voted")
    .ilike("email", email)
    .maybeSingle();

  const existingRow = existing as { has_voted: number | null } | null;

  if (existingRow?.has_voted === CURRENT_MONTH) {
    return NextResponse.json({ error: "Already voted this month" }, { status: 409 });
  }

  const { error: updateError, data: updated } = await supabase
    .from("users")
    .update({ has_voted: CURRENT_MONTH, voted_for: votedFor })
    .ilike("email", email)
    .select()
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ error: "Voter not found in users table" }, { status: 400 });
  }

  const { data: target } = await supabase
    .from("users")
    .select("votes")
    .eq("name", votedFor)
    .maybeSingle();

  const targetRow = target as { votes: number | null } | null;
  const currentVotes = targetRow?.votes ?? 0;

  const { error: incError } = await supabase
    .from("users")
    .update({ votes: currentVotes + 1 })
    .eq("name", votedFor);

  if (incError) {
    return NextResponse.json({ error: incError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, votedFor, votes: currentVotes + 1 });
}
