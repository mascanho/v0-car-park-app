"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CarPark } from "@/lib/parking-data";
import { findUserSpace } from "@/lib/parking-data";
import { X, CalendarDays, FilePlus, CircleFadingPlus } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function weekday(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return WEEKDAYS[day];
}

function formatEuro(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function DatePicker({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <div className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background cursor-pointer overflow-hidden">
      {label && (
        <span className="flex items-center px-2.5 text-xs text-muted-foreground bg-muted/50 border-r border-input shrink-0">
          {label}
        </span>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-none px-2 text-sm cursor-pointer focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-70"
      />
    </div>
  );
}

interface BulkFreeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carParks: CarPark[];
  selectedCarPark: CarPark;
  currentUser: string;
  userEmail?: string;
  onFreed: () => void;
}

export function BulkFreeModal({
  open,
  onOpenChange,
  carParks,
  selectedCarPark,
  currentUser,
  userEmail,
  onFreed,
}: BulkFreeModalProps) {
  const [carParkId, setCarParkId] = useState(selectedCarPark.id);
  const [dates, setDates] = useState<string[]>([]);
  const [tab, setTab] = useState<"single" | "range">("single");
  const [dateInput, setDateInput] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [bouncing, setBouncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ freedCount: number } | null>(null);
  const userMatch = findUserSpace(currentUser, userEmail, carParkId);

  const userCarParks = carParks.filter(
    (cp) => findUserSpace(currentUser, userEmail, cp.id) !== null,
  );

  useEffect(() => {
    if (open) {
      const firstMatch = userCarParks.find(
        (cp) => findUserSpace(currentUser, userEmail, cp.id) !== null,
      );
      setCarParkId(firstMatch?.id || selectedCarPark.id);
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResult(null);
    }
  }, [open, selectedCarPark.id, currentUser, userEmail]);

  useEffect(() => {
    if (rangeStart && rangeEnd) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 400);
    }
  }, [rangeStart, rangeEnd]);

  const addDate = (iso: string) => {
    if (!iso) return;
    if (dates.includes(iso)) return;
    setDates((prev) => [...prev, iso].sort());
    setDateInput("");
  };

  const addRange = () => {
    if (!rangeStart || !rangeEnd) return;
    if (rangeStart > rangeEnd) return;
    const newDates: string[] = [];
    const [sy, sm, sd] = rangeStart.split("-").map(Number);
    const [ey, em, ed] = rangeEnd.split("-").map(Number);
    const cur = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const day = String(cur.getDate()).padStart(2, "0");
      newDates.push(`${y}-${m}-${day}`);
      cur.setDate(cur.getDate() + 1);
    }
    setDates((prev) => {
      const merged = [...prev, ...newDates];
      return [...new Set(merged)].sort();
    });
  };

  const removeDate = (d: string) => {
    setDates((prev) => prev.filter((date) => date !== d));
  };

  const handleSubmit = async () => {
    if (dates.length === 0) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const bookingUserName = userMatch?.dbUserName || currentUser;
      const params = new URLSearchParams();
      dates.forEach((d) => params.append("dates", d));
      params.set("carParkId", carParkId);
      params.set("userName", bookingUserName);
      const res = await fetch(`/api/bookings?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      onFreed();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bulk free failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <>
      <style>{`
@keyframes bounce-once {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-bounce-once {
  animation: bounce-once 0.35s ease-in-out;
}
`}</style>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free your car space</DialogTitle>
            <DialogDescription className="hidden sm:inline-block">
              Not going to be in? Let someone else use your spot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5 hidden">
              {userCarParks.length > 0 ? (
                <select
                  value={carParkId}
                  onChange={(e) => setCarParkId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {userCarParks.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  No car park spot assigned to your account.
                </p>
              )}
            </div>

            {userMatch && (
              <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 sm:p-4 text-center">
                <p className="text-xs text-muted-foreground sm:mb-1 mt-1 sm:mt-0">
                  You will free
                </p>
                <p className="text-2xl font-bold text-destructive">
                  Space {userMatch.spaceId}
                </p>
                <p className="text-xs text-muted-foreground sm:inline-block sm:mt-1 mb-1 sm:mb-0 font-semibold">
                  {carParkId.charAt(0).toUpperCase() + carParkId.slice(1)}
                </p>
              </div>
            )}

            {/* Tabbed date input */}
            <div className="space-y-1.5">
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setTab("single")}
                  className={`px-3 py-2 text-sm cursor-pointer font-medium hover:bg-accent/20 rounded-t-md transition-colors border-b-2 -mb-px ${
                    tab === "single"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Specific dates
                </button>
                <button
                  type="button"
                  onClick={() => setTab("range")}
                  className={`px-3 py-2 text-sm font-medium cursor-pointer hover:bg-accent/20 rounded-t-md transition-colors border-b-2 -mb-px ${
                    tab === "range"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Range
                </button>
              </div>

              {tab === "single" && (
                <div className="pt-1">
                  <DatePicker
                    value={dateInput}
                    onChange={(val) => {
                      setDateInput(val);
                      if (val) addDate(val);
                    }}
                    placeholder="Click to select days"
                  />
                </div>
              )}

              {tab === "range" && (
                <div className="space-y-2 pt-1 w-full">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 min-w-0">
                      <DatePicker
                        value={rangeStart}
                        onChange={setRangeStart}
                        placeholder="dd/mm/yyyy"
                        label="From"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DatePicker
                        value={rangeEnd}
                        onChange={setRangeEnd}
                        placeholder="dd/mm/yyyy"
                        label="To"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRange}
                    disabled={!rangeStart || !rangeEnd}
                    className={`w-full sm:w-auto cursor-pointer ${rangeStart && rangeEnd ? "bg-accent text-accent-foreground" : "text-foreground"} ${bouncing ? "animate-bounce-once" : ""}`}
                  >
                    <CircleFadingPlus className="w-4 h-4 cursor-pointer shrink-0" />
                    Add Range
                  </Button>
                </div>
              )}
            </div>

            {dates.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    Selected Dates ({dates.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setDates([])}
                    className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-36 overflow-y-auto p-2 bg-muted border rounded-md">
                  {dates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-slate-100 pl-2 pr-1.5 py-1 text-[9.5px] sm:text-[11px] font-medium w-full"
                    >
                      <CalendarDays className="w-2 h-2 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        {weekday(d)}
                      </span>
                      <span className="flex-1">{formatEuro(d)}</span>
                      <button
                        type="button"
                        onClick={() => removeDate(d)}
                        className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted-foreground/10"
                      >
                        <X className="w-2 h-2 text-red-500 cursor-pointer" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-700 dark:text-green-400">
                Freed {result.freedCount} booking
                {result.freedCount !== 1 ? "s" : ""}.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                dates.length === 0 || isSubmitting || userCarParks.length === 0
              }
              variant="destructive"
              className="cursor-pointer"
            >
              {isSubmitting
                ? "Freeing..."
                : `Free my space (${dates.length} day${dates.length !== 1 ? "s" : ""})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
