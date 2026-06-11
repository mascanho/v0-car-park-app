import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const USER_SELECT =
  "name, email, photo, role, bio, car_park, car_space, birthday, website";

export interface UserData {
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

export interface MonthEntry {
  month: number;
  assigned: boolean;
  user?: UserData;
}

export async function GET() {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { data: records, error } = await supabase
    .from("employee_of_month")
    .select("user_name, month, year")
    .eq("year", year);

  if (error) {
    return NextResponse.json({ year, months: [] });
  }

  const names = [...new Set(records?.map((r) => r.user_name) ?? [])];
  let users: UserData[] = [];

  if (names.length > 0) {
    const { data } = await supabase
      .from("users")
      .select(USER_SELECT)
      .in("name", names);
    users = (data ?? []) as UserData[];
  }

  const userMap = new Map<string, UserData>(
    users.map((u) => [u.name, u]),
  );

  const recordMap = new Map<number, string>(
    records?.map((r) => [r.month, r.user_name]) ?? [],
  );

  const months: MonthEntry[] = [];

  for (let m = 1; m <= 12; m++) {
    const userName = recordMap.get(m);
    if (userName) {
      const user = userMap.get(userName);
      if (user) {
        months.push({ month: m, assigned: true, user });
      } else {
        months.push({ month: m, assigned: false });
      }
    } else {
      months.push({ month: m, assigned: false });
    }
  }

  return NextResponse.json({ year, months });
}
