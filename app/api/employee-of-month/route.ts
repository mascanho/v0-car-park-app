import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const USER_SELECT =
  "name, email, photo, role, bio, car_park, car_space, birthday, website";

interface UserData {
  name: string;
  email: string;
  photo: string | null;
  role: string | null;
  bio: string | null;
  car_park: string | null;
  car_space: string | null;
  birthday: string | null;
  website: string | null;
}

interface MonthEntry {
  month: number;
  assigned: boolean;
  votes?: number;
  user?: UserData;
}

export async function GET() {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { data: eomRecords } = await supabase
    .from("eom")
    .select("month, email, votes")
    .gte("year", `${year}-01-01`)
    .lt("year", `${year + 1}-01-01`);

  const emails = [...new Set(eomRecords?.map((r) => r.email) ?? [])];

  let users: UserData[] = [];
  if (emails.length > 0) {
    const { data } = await supabase
      .from("users")
      .select(USER_SELECT)
      .in("email", emails);
    users = (data ?? []) as UserData[];
  }

  const userMap = new Map<string, UserData>(
    users.map((u) => [u.email, u]),
  );

  const eomByMonth = new Map(eomRecords?.map((r) => [Number(r.month), r]) ?? []);

  const months: MonthEntry[] = [];

  for (let m = 1; m <= 12; m++) {
    const record = eomByMonth.get(m);
    if (record) {
      const user = userMap.get(record.email);
      months.push({
        month: m,
        assigned: true,
        votes: record.votes,
        ...(user ? { user } : {}),
      });
    } else {
      months.push({ month: m, assigned: false });
    }
  }

  return NextResponse.json({ year, months });
}
