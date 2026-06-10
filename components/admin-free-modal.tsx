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
import { X } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [tab, setTab] = useState<"single" | "range">("single");
  const [dateInput, setDateInput] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ freedCount: number } | null>(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const usersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (usersRef.current && !usersRef.current.contains(e.target as Node)) {
        setUsersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: rawUsers } = useSWR<string[]>(
    `/api/users?carParkId=${carParkId}`,
    fetcher,
  );
  const allUsers = Array.isArray(rawUsers) ? rawUsers : [];

  useEffect(() => {
    if (open) {
      setCarParkId(carParks[0]?.id || "");
      setSelectedUsers([]);
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResult(null);
    }
  }, [open]);

  const toggleUser = (u: string) => {
    setSelectedUsers((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u],
    );
  };

  const selectAll = () => {
    if (Array.isArray(allUsers)) setSelectedUsers([...allUsers]);
  };
  const deselectAll = () => setSelectedUsers([]);

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
    if (dates.length === 0 || selectedUsers.length === 0 || !carParkId) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const params = new URLSearchParams();
      dates.forEach((d) => params.append("dates", d));
      params.set("carParkId", carParkId);
      selectedUsers.forEach((u) => params.append("userNames", u));
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
      setSelectedUsers([]);
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
            <label className="text-sm font-medium">Car Park</label>
            <select
              value={carParkId}
              onChange={(e) => {
                setCarParkId(e.target.value);
                setSelectedUsers([]);
                setUsersOpen(false);
              }}
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
            <label className="text-sm font-medium">Users</label>
            <div className="relative" ref={usersRef}>
              <button
                type="button"
                onClick={() => setUsersOpen(!usersOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={
                    selectedUsers.length === 0 ? "text-muted-foreground" : ""
                  }
                >
                  {selectedUsers.length === 0
                    ? "Select users..."
                    : `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""} selected`}
                </span>
                <svg
                  className={`h-4 w-4 text-muted-foreground transition-transform ${usersOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {usersOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                    <span className="text-xs text-muted-foreground">
                      {allUsers.length} users
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-1">
                    {allUsers.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No users found for this car park.
                      </p>
                    ) : (
                      allUsers.map((u) => {
                        const active = selectedUsers.includes(u);
                        return (
                          <label
                            key={u}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm hover:bg-accent cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => toggleUser(u)}
                              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                            />
                            <span
                              className={
                                active
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {u}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1 border-t border-border p-2 max-h-20 overflow-y-auto">
                      {selectedUsers.map((u) => (
                        <span
                          key={u}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 pl-2 pr-1 py-0.5 text-xs font-medium text-foreground"
                        >
                          {u}
                          <button
                            type="button"
                            onClick={() => toggleUser(u)}
                            className="hover:bg-primary/20 rounded-sm p-0.5"
                          >
                            <X className="w-2.5 h-2.5 text-red-500" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 bg-muted p-2 rounded-md">
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
              <div className="pt-1 space-y-2">
                <DatePicker
                  value={dateInput}
                  onChange={(val) => {
                    setDateInput(val);
                    if (val) addDate(val);
                  }}
                  placeholder="Click to select days"
                />
                {dates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {dates.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-100 pl-2 pr-1.5 py-1 text-[11px] font-medium"
                      >
                        <span className="text-muted-foreground">
                          {weekday(d)}
                        </span>
                        <span>{formatEuro(d)}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(d)}
                          className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted-foreground/10"
                        >
                          <X className="w-2.5 h-2.5 text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "range" && (
              <div className="pt-1 space-y-2">
                <div className="flex items-end gap-2">
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
                {dates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {dates.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-100 pl-2 pr-1.5 py-1 text-[11px] font-medium"
                      >
                        <span className="text-muted-foreground">
                          {weekday(d)}
                        </span>
                        <span>{formatEuro(d)}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(d)}
                          className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted-foreground/10"
                        >
                          <X className="w-2.5 h-2.5 text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
              dates.length === 0 || selectedUsers.length === 0 || isSubmitting
            }
            variant="destructive"
          >
            {isSubmitting
              ? "Freeing..."
              : `Free (${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""}, ${dates.length} date${dates.length !== 1 ? "s" : ""})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
