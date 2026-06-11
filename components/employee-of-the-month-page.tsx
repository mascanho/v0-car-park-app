"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "./site-header";
import { AppFooter } from "./app-footer";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { VoteModal } from "./vote-modal";
import { getPhotoUrl } from "@/lib/utils";
import {
  Cake,
  ParkingCircle,
  Medal,
  Crown,
  Clock,
  ThumbsUp,
  Loader2,
  Vote,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  votes?: number;
  user?: EomUser;
}

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
  const isCurrent = month === new Date().getMonth() + 1;

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
            <h3 className="text-sm font-bold text-foreground leading-tight">
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
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-4 mb-3 border-t border-border/40 pt-3">
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
          <BirthdayBadge
            birthday={user.birthday}
            name={user.name}
            email={user.email}
          />
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
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [data, setData] = useState<{
    year: number;
    months: MonthEntry[];
  } | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/employee-of-month")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData({ year, months: [] }));
  }, [year]);

  const assignedCount = data?.months?.filter((m) => m.assigned).length ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <AppBreadcrumbs segments={[{ label: "Employee of the Month" }]} />

        <div className="mb-8 flex items-start justify-between gap-4">
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

          <button
            onClick={() => setVoteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shrink-0"
          >
            <ThumbsUp className="w-4 h-4" />
            Vote
          </button>
        </div>

        <VoteModal open={voteModalOpen} onOpenChange={setVoteModalOpen} />

        {!data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(data.months ?? []).map((entry) =>
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
        )}
      </main>
      <AppFooter />
    </div>
  );
}
