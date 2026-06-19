"use client";

import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ParkingCircle,
  X,
  Zap,
  MapPin,
} from "lucide-react";
import {
  generateParkingSpaces,
  formatDate,
  isPastDate,
} from "@/lib/parking-data";
import type { Booking, CarPark, ParkingSpace } from "@/lib/parking-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WeeklyOverviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allBookings: Booking[];
  carParks: CarPark[];
  currentUser: string;
  isRegular: boolean;
  onBookingComplete: (updatedBookings: Booking[]) => void;
  onRefreshBookings: () => void;
}

interface PendingBooking {
  spaceId: string;
  dateStr: string;
  carParkId: string;
  carParkName: string;
}

interface DayData {
  day: Date;
  dateStr: string;
  available: ParkingSpace[];
  myBooking: Booking | undefined;
  past: boolean;
  isToday: boolean;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function todayIndex(weekDays: Date[]): number {
  const t = formatDate(new Date());
  const idx = weekDays.findIndex((d) => formatDate(d) === t);
  return idx >= 0 ? idx : 0;
}

function formatDisplayDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const BOOK_MSGS = [
  { msg: "Spot secured!", emoji: "🔒" },
  { msg: "Nailed the spot!", emoji: "🎯" },
  { msg: "Consider it done!", emoji: "✅" },
  { msg: "Parking rockstar!", emoji: "🎸" },
  { msg: "Vroom vroom! You're in!", emoji: "🚗" },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function SpaceChip({
  space,
  isSelected,
  disabled,
  onClick,
  size = "sm",
}: {
  space: ParkingSpace;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={`Space ${space.id}${space.electrified ? " — EV charger" : ""}`}
      className={cn(
        "rounded border font-mono font-medium transition-all duration-150 leading-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95",
        size === "md" ? "text-sm px-3 py-2" : "text-[11px] px-1.5 py-0.5",
        isSelected
          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
          : "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/20 hover:border-green-500/50 hover:scale-105",
      )}
    >
      {space.id}
      {space.electrified && (
        <Zap
          className={cn(
            "inline -mt-px text-amber-500",
            size === "md" ? "w-3 h-3 ml-1" : "w-2 h-2 ml-0.5",
          )}
        />
      )}
    </button>
  );
}

function MyBookingBadge({
  booking,
  past,
  disabled,
  onCancel,
  size = "sm",
}: {
  booking: Booking;
  past: boolean;
  disabled: boolean;
  onCancel: (id: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/25 rounded-lg",
        size === "md" ? "px-3 py-2" : "px-1.5 py-1",
      )}
    >
      <CheckCircle2
        className={cn(
          "text-blue-500 shrink-0",
          size === "md" ? "w-4 h-4" : "w-3 h-3",
        )}
      />
      <span
        className={cn(
          "font-semibold text-blue-600 dark:text-blue-400 font-mono",
          size === "md" ? "text-sm" : "text-[11px]",
        )}
      >
        #{booking.spaceId}
      </span>
      {!past && booking.id && (
        <button
          onClick={() => onCancel(booking.id!)}
          disabled={disabled}
          title="Cancel booking"
          className={cn(
            "ml-auto text-muted-foreground/50 hover:text-destructive transition-colors disabled:opacity-30",
            size === "md" ? "p-0.5" : "",
          )}
        >
          <X className={size === "md" ? "w-4 h-4" : "w-2.5 h-2.5"} />
        </button>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function WeeklyOverview({
  open,
  onOpenChange,
  allBookings,
  carParks,
  currentUser,
  isRegular,
  onBookingComplete,
  onRefreshBookings,
}: WeeklyOverviewProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const todayStr = formatDate(new Date());

  const [mobileDay, setMobileDay] = useState(() =>
    todayIndex(getWeekDays(getWeekStart(new Date()))),
  );

  // All data: carParks × days — single useMemo, reused by both layouts
  const allData = useMemo(
    () =>
      carParks.map((cp) => {
        const spaces = generateParkingSpaces(cp);
        const days: DayData[] = weekDays.map((day) => {
          const dateStr = formatDate(day);
          const dayBookings = allBookings.filter(
            (b) => b.date === dateStr && b.carParkId === cp.id,
          );
          const bookedIds = new Set(dayBookings.map((b) => b.spaceId));
          const available = spaces.filter((s) => !bookedIds.has(s.id));
          const myBooking = dayBookings.find((b) => b.userName === currentUser);
          return {
            day,
            dateStr,
            available,
            myBooking,
            past: isPastDate(day),
            isToday: dateStr === todayStr,
          };
        });
        return { cp, days };
      }),
    [carParks, weekDays, allBookings, currentUser, todayStr],
  );

  // Per-day summary used by the mobile day strip
  const daySummary = useMemo(
    () =>
      weekDays.map((_, i) => {
        const past = allData[0]?.days[i]?.past ?? false;
        const anyFree = allData.some((d) => d.days[i].available.length > 0);
        const hasMyBooking = allData.some((d) => d.days[i].myBooking != null);
        return { past, anyFree, hasMyBooking };
      }),
    [weekDays, allData],
  );

  // ── navigation ──────────────────────────────────────────────────────────────

  const prevWeek = useCallback(() => {
    setWeekStart((ws) => {
      const d = new Date(ws);
      d.setDate(d.getDate() - 7);
      return d;
    });
    setPending(null);
    setMobileDay(0);
  }, []);

  const nextWeek = useCallback(() => {
    setWeekStart((ws) => {
      const d = new Date(ws);
      d.setDate(d.getDate() + 7);
      return d;
    });
    setPending(null);
    setMobileDay(0);
  }, []);

  // ── booking actions ──────────────────────────────────────────────────────────

  const handleSelectSpace = useCallback(
    (spaceId: string, dateStr: string, cp: CarPark) => {
      setPending((prev) =>
        prev?.spaceId === spaceId &&
        prev?.dateStr === dateStr &&
        prev?.carParkId === cp.id
          ? null
          : { spaceId, dateStr, carParkId: cp.id, carParkName: cp.name },
      );
    },
    [],
  );

  const handleBookConfirm = async () => {
    if (!pending || !currentUser) return;
    setIsBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: pending.spaceId,
          carParkId: pending.carParkId,
          date: pending.dateStr,
          userName: currentUser,
          replaceExisting: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");
      onBookingComplete(data.allBookings);
      setPending(null);
      const pick = BOOK_MSGS[Math.floor(Math.random() * BOOK_MSGS.length)];
      toast(`${pick.emoji} ${pick.msg}`, {
        description: `Space ${pending.spaceId} at ${pending.carParkName} — ${formatDisplayDate(pending.dateStr)}`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setIsBooking(true);
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to cancel");
      onRefreshBookings();
      toast("🕊️ Spot freed!", {
        description: "Your booking has been cancelled.",
      });
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setIsBooking(false);
    }
  };

  // ── labels ───────────────────────────────────────────────────────────────────

  const weekLabel = (() => {
    const s = weekDays[0];
    const e = weekDays[6];
    return s.getMonth() === e.getMonth()
      ? `${s.getDate()} – ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${e.getFullYear()}`
      : `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${e.getFullYear()}`;
  })();

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setPending(null);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-5xl lg:max-w-6xl p-0 gap-0 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[95vh]"
      >
        {/* ══ Shared top bar ══════════════════════════════════════════════════ */}
        <div className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-5 py-3.5 border-b border-border">
          {/* Title — left */}
          <div className="flex items-center gap-2">
            <ParkingCircle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Weekly Overview
            </span>
          </div>

          {/* Week nav — true centre */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={prevWeek}
              className="p-2 rounded-md text-muted-foreground hover:text-white hover:bg-accent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-medium text-foreground px-2 tabular-nums text-center min-w-[130px] sm:min-w-[180px]">
              {weekLabel}
            </span>
            <button
              onClick={nextWeek}
              className="p-2 rounded-md text-muted-foreground hover:text-white hover:bg-accent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Close — right */}
          <div className="flex justify-end">
            <DialogClose className="p-2 rounded-md text-muted-foreground hover:text-white hover:bg-accent transition-colors cursor-pointer cursor-pointer">
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        {/* ══ MOBILE layout (hidden md+) ══════════════════════════════════════ */}
        <div className="md:hidden flex flex-col flex-1 min-h-0">
          {/* Day selector strip */}
          <div className="shrink-0 flex gap-1.5 overflow-x-auto px-4 py-3 border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {weekDays.map((day, i) => {
              const { past, anyFree, hasMyBooking } = daySummary[i];
              const isToday = formatDate(day) === todayStr;
              const isSelected = mobileDay === i;
              const isWeekend = i >= 5;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setMobileDay(i);
                    setPending(null);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl shrink-0 transition-all duration-150 min-w-[52px]",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isToday
                        ? "bg-primary/10 text-primary"
                        : past
                          ? "opacity-40 text-muted-foreground"
                          : isWeekend
                            ? "text-muted-foreground hover:bg-muted/60"
                            : "text-foreground hover:bg-accent/50",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {DAY_NAMES[i]}
                  </span>
                  <span className="text-base font-bold leading-none">
                    {day.getDate()}
                  </span>
                  {/* Availability dots — one per car park */}
                  <div className="flex gap-0.5 mt-0.5">
                    {allData.map(({ cp, days }) => {
                      const d = days[i];
                      return (
                        <span
                          key={cp.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            past
                              ? isSelected
                                ? "bg-primary-foreground/30"
                                : "bg-muted-foreground/20"
                              : d.myBooking
                                ? isSelected
                                  ? "bg-blue-200"
                                  : "bg-blue-400"
                                : d.available.length > 0
                                  ? isSelected
                                    ? "bg-green-200"
                                    : "bg-green-500"
                                  : isSelected
                                    ? "bg-primary-foreground/40"
                                    : "bg-destructive/40",
                          )}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
            {(() => {
              const dayLabel = `${DAY_NAMES[mobileDay]}, ${weekDays[mobileDay].getDate()} ${MONTH_SHORT[weekDays[mobileDay].getMonth()]}`;
              const dayData = allData[0]?.days[mobileDay];
              const isPast = dayData?.past ?? false;

              return (
                <>
                  {/* Date heading */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {dayLabel}
                    </h3>
                    {dayData?.isToday && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                    {isPast && (
                      <span className="text-[10px] text-muted-foreground">
                        Past
                      </span>
                    )}
                  </div>

                  {allData.map(({ cp, days }) => {
                    const d = days[mobileDay];
                    const isFull = !d.past && d.available.length === 0;
                    return (
                      <div
                        key={cp.id}
                        className={cn(
                          "rounded-xl border bg-card p-4 space-y-3 transition-opacity",
                          d.past && "opacity-50",
                        )}
                      >
                        {/* Car park header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground truncate">
                              {cp.name}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full",
                              d.past
                                ? "text-muted-foreground bg-muted/50"
                                : isFull
                                  ? "text-destructive/80 bg-destructive/10"
                                  : "text-green-700 dark:text-green-400 bg-green-500/10",
                            )}
                          >
                            {d.past
                              ? "Past"
                              : isFull
                                ? "Full"
                                : `${d.available.length} free`}
                          </span>
                        </div>

                        {/* My booking */}
                        {d.myBooking && (
                          <MyBookingBadge
                            booking={d.myBooking}
                            past={d.past}
                            disabled={isBooking}
                            onCancel={handleCancelBooking}
                            size="md"
                          />
                        )}

                        {/* Available spaces */}
                        {!d.past && d.available.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {d.available.map((space) => (
                              <SpaceChip
                                key={space.id}
                                space={space}
                                isSelected={
                                  pending?.spaceId === space.id &&
                                  pending?.dateStr === d.dateStr &&
                                  pending?.carParkId === cp.id
                                }
                                disabled={isBooking}
                                onClick={() =>
                                  handleSelectSpace(space.id, d.dateStr, cp)
                                }
                                size="md"
                              />
                            ))}
                          </div>
                        )}

                        {isFull && !d.myBooking && (
                          <p className="text-sm text-muted-foreground/60 text-center py-1">
                            No spaces available
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>

        {/* ══ DESKTOP layout (hidden below md) ═══════════════════════════════ */}
        <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-y-auto">
          <div>
            {/* Sticky day-header row */}
            <div className="sticky top-0 z-10 grid grid-cols-[130px_repeat(7,1fr)] border-b border-border bg-card/95 backdrop-blur">
              <div className="border-r border-border/60" />
              {weekDays.map((day, i) => {
                const isToday = formatDate(day) === todayStr;
                const isWeekend = i >= 5;
                return (
                  <div
                    key={i}
                    className={cn(
                      "py-2.5 text-center border-r border-border/60 last:border-r-0",
                      isToday && "bg-primary/8",
                      isWeekend && !isToday && "bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        isToday ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {DAY_NAMES[i]}
                    </div>
                    <div
                      className={cn(
                        "text-base font-bold leading-tight mt-0.5",
                        isToday
                          ? "text-primary"
                          : isWeekend
                            ? "text-muted-foreground"
                            : "text-foreground",
                      )}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Car park rows */}
            {allData.map(({ cp, days }) => (
              <div
                key={cp.id}
                className="border-b border-border last:border-b-0"
              >
                <div className="grid grid-cols-[130px_repeat(7,1fr)]">
                  {/* Car park label */}
                  <div className="border-r border-border/60 bg-muted/20 p-3 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Car Park
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground leading-snug">
                      {cp.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight">
                      {cp.location}
                    </span>
                  </div>

                  {/* Day cells */}
                  {days.map(
                    ({ day, dateStr, available, myBooking, past, isToday }) => {
                      const isWeekend = [6, 0].includes(day.getDay());
                      const isFull = !past && available.length === 0;
                      return (
                        <div
                          key={dateStr}
                          className={cn(
                            "border-r border-border/60 last:border-r-0 p-2 min-h-[110px] flex flex-col gap-1.5",
                            past && "bg-muted/15 opacity-50",
                            !past && isWeekend && "bg-muted/20",
                            !past && !isWeekend && "bg-card",
                            isToday && !past && "bg-primary/5",
                          )}
                        >
                          {myBooking && (
                            <MyBookingBadge
                              booking={myBooking}
                              past={past}
                              disabled={isBooking}
                              onCancel={handleCancelBooking}
                              size="sm"
                            />
                          )}

                          {past && !myBooking && (
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-[11px] text-muted-foreground/40">
                                —
                              </span>
                            </div>
                          )}

                          {isFull && (
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-[11px] text-muted-foreground/60 font-medium">
                                Full
                              </span>
                            </div>
                          )}

                          {!past && available.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {available.length} free
                              </span>
                              <div className="flex flex-wrap gap-0.5">
                                {available.map((space) => (
                                  <SpaceChip
                                    key={space.id}
                                    space={space}
                                    isSelected={
                                      pending?.spaceId === space.id &&
                                      pending?.dateStr === dateStr &&
                                      pending?.carParkId === cp.id
                                    }
                                    disabled={isBooking}
                                    onClick={() =>
                                      handleSelectSpace(space.id, dateStr, cp)
                                    }
                                    size="sm"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ Shared confirmation footer ═══════════════════════════════════════ */}
        <div
          className={cn(
            "shrink-0 border-t border-border overflow-hidden transition-all duration-200",
            pending ? "max-h-24 opacity-100" : "max-h-0 opacity-0 border-t-0",
          )}
        >
          {pending && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-card">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <p className="text-sm text-foreground truncate">
                  <span className="font-semibold font-mono">
                    Space {pending.spaceId}
                  </span>
                  <span className="text-muted-foreground">
                    {" · "}
                    {pending.carParkName}
                    {" · "}
                    {formatDisplayDate(pending.dateStr)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPending(null)}
                  disabled={isBooking}
                  className="h-9 sm:h-8 text-sm sm:text-xs px-3 cursor-pointer hover:bg-zinc-500 hover:text-white"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={handleBookConfirm}
                  disabled={isBooking}
                  className="h-9 sm:h-8 text-sm sm:text-xs min-w-[80px] sm:min-w-[90px] cursor-pointer"
                >
                  {isBooking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Book"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
