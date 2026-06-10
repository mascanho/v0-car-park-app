"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
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
import { X, CalendarDays } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function weekday(dateStr: string) {
  const day = new Date(dateStr + "T00:00:00").getDay();
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const dateRef = useRef<HTMLInputElement>(null);
  const display = value ? formatEuro(value) : "";

  return (
    <div className="relative">
      <input
        type="text"
        value={display}
        placeholder={placeholder}
        readOnly
        onClick={() => dateRef.current?.showPicker()}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
      />
      <input
        ref={dateRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
}

interface AdminFreeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carParks: CarPark[];
  onFreed: () => void;
}

export function AdminFreeModal({
  open,
  onOpenChange,
  carParks,
  onFreed,
}: AdminFreeModalProps) {
  const [carParkId, setCarParkId] = useState(carParks[0]?.id || "");
  const [userName, setUserName] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [tab, setTab] = useState<"single" | "range">("single");
  const [dateInput, setDateInput] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ freedCount: number } | null>(null);

  const { data: allUsers = [] } = useSWR<string[]>(
    `/api/users?carParkId=${carParkId}`,
    fetcher,
  );

  const filteredUsers = allUsers.filter((u) =>
    u.toLowerCase().includes(userName.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setCarParkId(carParks[0]?.id || "");
      setUserName("");
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResult(null);
    }
  }, [open]);

  const addDate = (iso: string) => {
    if (!iso || dates.includes(iso)) return;
    setDates((prev) => [...prev, iso].sort());
    setDateInput("");
  };

  const addRange = () => {
    if (!rangeStart || !rangeEnd) return;
    if (rangeStart > rangeEnd) return;
    const newDates: string[] = [];
    const cur = new Date(rangeStart + "T00:00:00");
    const endDate = new Date(rangeEnd + "T00:00:00");
    while (cur <= endDate) {
      newDates.push(cur.toISOString().slice(0, 10));
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
    if (dates.length === 0 || !userName || !carParkId) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const params = new URLSearchParams();
      dates.forEach((d) => params.append("dates", d));
      params.set("carParkId", carParkId);
      params.set("userName", userName);
      const res = await fetch(`/api/bookings?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      onFreed();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to free bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setUserName("");
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin Free</DialogTitle>
          <DialogDescription>
            Free any user's booking from any car park.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-bold">Car Park</label>
            <select
              value={carParkId}
              onChange={(e) => setCarParkId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {carParks.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold">User</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Type a user name..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <h3 className="text-xs mt-2 font-bold text-gray-500">
              Freeing spots for: {filteredUsers.length} user(s)
            </h3>
            {userName && filteredUsers.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-popover shadow-sm">
                {filteredUsers.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUserName(u)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors bg-blue-200"
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setTab("single")}
                className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === "single"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Single dates
              </button>
              <button
                type="button"
                onClick={() => setTab("range")}
                className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
                  placeholder="dd/mm/yyyy"
                />
              </div>
            )}

            {tab === "range" && (
              <div className="flex items-end gap-2 pt-1">
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground block mb-1">
                    From
                  </span>
                  <DatePicker
                    value={rangeStart}
                    onChange={setRangeStart}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground block mb-1">
                    To
                  </span>
                  <DatePicker
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRange}
                  disabled={!rangeStart || !rangeEnd}
                  className="shrink-0"
                >
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
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dates.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted pl-2 pr-1.5 py-1 text-[9.5px] sm:text-[11px] font-medium w-full"
                  >
                    <CalendarDays className="w-2 h-2 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{weekday(d)}</span>
                    <span className="flex-1">{formatEuro(d)}</span>
                    <button
                      type="button"
                      onClick={() => removeDate(d)}
                      className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted-foreground/10"
                    >
                      <X className="w-2 h-2 text-red-500" />
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
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              dates.length === 0 || !userName || !carParkId || isSubmitting
            }
            variant="destructive"
          >
            {isSubmitting
              ? "Freeing..."
              : `Free (${dates.length} date${dates.length !== 1 ? "s" : ""})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
