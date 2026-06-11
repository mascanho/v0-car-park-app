"use client";

import { useState } from "react";
import { SiteHeader } from "./site-header";
import { AppFooter } from "./app-footer";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { getPhotoUrl } from "@/lib/utils";
import { Cake, ParkingCircle, Medal, Crown, Clock } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface EomUser {
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
  user?: EomUser;
}

const FAKE_DATA: MonthEntry[] = [
  {
    month: 1, assigned: true,
    user: { name: "Emily Berry", email: "e.berry@slimstock.com", photo: null, role: "Supply Chain Analyst", bio: "Always early, always organised. Sets the standard for the year ahead.", car_park: "grosvenor", car_space: "15", birthday: "15/03/1990", website: null },
  },
  {
    month: 2, assigned: true,
    user: { name: "Marco Guerreiro", email: "m.guerreiro@slimstock.com", photo: null, role: "Operations Lead", bio: "Keeps the wheels turning even in the shortest month.", car_park: "smallwood", car_space: "39", birthday: "22/07/1988", website: null },
  },
  {
    month: 3, assigned: true,
    user: { name: "Jessie Cooper", email: "j.cooper@slimstock.com", photo: null, role: "Customer Success", bio: "Spring energy all year round. The person everyone wants on their team.", car_park: "grosvenor", car_space: "8", birthday: "10/11/1992", website: null },
  },
  {
    month: 4, assigned: true,
    user: { name: "Natasha Cooper", email: "n.cooper@slimstock.com", photo: null, role: "Project Manager", bio: "April showers bring May flowers — and Natasha brings results.", car_park: "grosvenor", car_space: "7", birthday: "05/05/1991", website: null },
  },
  {
    month: 5, assigned: true,
    user: { name: "Lisa Berry", email: "l.berry@slimstock.com", photo: null, role: "Finance Manager", bio: "Numbers never lie, and Lisa's work speaks volumes.", car_park: "smallwood", car_space: "31", birthday: "18/09/1987", website: null },
  },
  { month: 6, assigned: false },
  {
    month: 7, assigned: true,
    user: { name: "Sam Phipps", email: "s.phipps@slimstock.com", photo: null, role: "Business Developer", bio: "Mid-year momentum builder. Always brings the energy.", car_park: "grosvenor", car_space: "16", birthday: "30/01/1993", website: null },
  },
  { month: 8, assigned: false },
  { month: 9, assigned: false },
  {
    month: 10, assigned: true,
    user: { name: "Mike Donnelly", email: "m.donnelly@slimstock.com", photo: null, role: "Senior Developer", bio: "Wrapped up the year strong. The definition of consistent excellence.", car_park: "grosvenor", car_space: "26", birthday: "12/12/1989", website: null },
  },
  { month: 11, assigned: false },
  { month: 12, assigned: false },
];

function BirthdayBadge({
  birthday,
  name,
  email,
}: {
  birthday: string | null;
  name: string;
  email: string;
}) {
  if (!birthday) return null;
  const today = new Date();
  const bd = new Date(birthday);
  const isToday =
    bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();

  function handleClick() {
    window.open(
      `https://teams.microsoft.com/l/chat/0/0?users=${email}`,
      "_blank",
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[10px] font-medium leading-none cursor-pointer ${
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
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        Click to Wish {name} a happy birthday
      </TooltipContent>
    </Tooltip>
  );
}

function AssignedCard({ user, month }: { user: EomUser; month: number }) {
  const [imgErr, setImgErr] = useState(false);
  const photoUrl = getPhotoUrl(user.email, user.photo);
  const isCurrent =
    month === new Date().getMonth() + 1;

  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500" />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />

      <div className="relative p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
            {MONTHS[month - 1]}
          </span>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-medium leading-none ring-1 ring-orange-300">
              <Crown className="w-2.5 h-2.5" />
              Current
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            {photoUrl && !imgErr ? (
              <img
                src={photoUrl}
                alt={user.name}
                onError={() => setImgErr(true)}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-border group-hover:ring-blue-300/50 transition-all"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/15 to-orange-500/15 flex items-center justify-center ring-2 ring-border group-hover:ring-blue-300/50 transition-all">
                <span className="text-xl font-bold text-blue-600">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center ring-2 ring-card">
              <Medal className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-sm font-bold text-foreground truncate leading-tight">
              {user.name}
            </h3>
            {user.role && (
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                {user.role}
              </p>
            )}
          </div>
        </div>

        {user.bio && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3 border-t border-border/40 pt-3">
            &ldquo;{user.bio}&rdquo;
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/40">
          {(user.car_park || user.car_space) && (
            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-full bg-muted/50 text-[10px] font-medium leading-none text-muted-foreground/60">
              <ParkingCircle className="w-2.5 h-2.5 opacity-50 shrink-0" />
              {user.car_space && (
                <span className="tabular-nums">#{user.car_space}</span>
              )}
              {user.car_park && (
                <span className="truncate max-w-20 capitalize">
                  {user.car_park}
                </span>
              )}
            </span>
          )}
          <BirthdayBadge birthday={user.birthday} name={user.name} email={user.email} />
        </div>
      </div>
    </div>
  );
}

function PendingCard({ month }: { month: number }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-muted-foreground/25 bg-card/50 overflow-hidden transition-all duration-300 hover:border-muted-foreground/40 group flex flex-col">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-muted/10 blur-2xl pointer-events-none" />

      <div className="relative p-5 flex flex-col h-full items-center justify-center min-h-[220px]">
        <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center ring-2 ring-muted-foreground/10 group-hover:ring-muted-foreground/20 transition-all mb-3">
          <Clock className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">
          {MONTHS[month - 1]}
        </span>
        <span className="text-xs font-medium text-muted-foreground/40">
          Pending
        </span>
      </div>
    </div>
  );
}

export function EmployeeOfTheMonthPage() {
  const year = new Date().getFullYear();
  const assignedCount = FAKE_DATA.filter((m) => m.assigned).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <AppBreadcrumbs segments={[{ label: "Employee of the Month" }]} />

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center shrink-0">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Employee of the Month
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {assignedCount} of 12 months assigned for {year}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FAKE_DATA.map((entry) =>
            entry.assigned && entry.user ? (
              <AssignedCard
                key={entry.month}
                user={entry.user}
                month={entry.month}
              />
            ) : (
              <PendingCard key={entry.month} month={entry.month} />
            ),
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
