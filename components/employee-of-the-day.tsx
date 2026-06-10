"use client";

import { useEffect, useState } from "react";
import { Crown, Medal, ParkingCircle, ExternalLink, Cake } from "lucide-react";

interface EotdUser {
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

function BirthdayBadge({ birthday }: { birthday: string | null }) {
  if (!birthday) return null;
  const today = new Date();
  const bd = new Date(birthday);
  const isToday =
    bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[10px] font-medium leading-none ${
        isToday
          ? "bg-pink-100 text-pink-700 ring-1 ring-pink-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Cake className="w-2.5 h-2.5" />
      {new Date(birthday).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })}
      {isToday && <span className="animate-pulse">🎉</span>}
    </span>
  );
}

export function EmployeeOfTheDay() {
  const [user, setUser] = useState<EotdUser | null>(null);

  useEffect(() => {
    fetch("/api/eom")
      .then((r) => r.json())
      .then((d) => setUser(d))
      .catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="px-4 pb-4 flex-1 flex flex-col pt-4 mt-2 border-t border-border">
      <div className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 p-[3px]">
        <div className="h-full rounded-2xl bg-background p-5 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl" />

          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-orange-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
              Employee of the Month
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 p-[3px]">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <span className="text-2xl font-black text-blue-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -top-1 -right-1">
                <Crown className="w-5 h-5 text-orange-400 drop-shadow" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-lg font-extrabold text-foreground truncate">
                {user.name}
              </div>
              {user.role && (
                <div className="text-sm font-medium text-blue-600 truncate">
                  {user.role}
                </div>
              )}
              <div className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                {user.email.toLowerCase()}
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 border-t border-blue-500/10 pt-3 mb-4">
              &ldquo;{user.bio}&rdquo;
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 border-t border-blue-500/10">
            {(user.car_park || user.car_space) && (
              <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-full bg-muted/50 text-[10px] font-medium leading-none text-muted-foreground/60">
                <ParkingCircle className="w-2.5 h-2.5 opacity-50 shrink-0" />
                {user.car_space && (
                  <span className="tabular-nums">#{user.car_space}</span>
                )}
                {user.car_park && (
                  <span className="truncate max-w-24 capitalize">
                    {user.car_park}
                  </span>
                )}
              </span>
            )}
            <BirthdayBadge birthday={user.birthday} />
            {user.website && (
              <a
                href={
                  user.website.startsWith("http")
                    ? user.website
                    : `https://${user.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[10px] font-medium leading-none text-primary hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {new URL(
                  user.website.startsWith("http")
                    ? user.website
                    : `https://${user.website}`,
                ).hostname.replace("www.", "")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
