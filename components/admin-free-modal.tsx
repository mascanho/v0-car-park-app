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
import type { CarPark, Booking } from "@/lib/parking-data";
import { generateParkingSpaces, getUserDefaultSpace } from "@/lib/parking-data";
import { X, CalendarDays, Plus } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeUserName(name: string) {
  const lower = name.toLowerCase();
  if (lower === "visitor" || lower === "v") return "VISITOR";
  return name;
}

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
  const ref = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (ref.current) {
      try {
        ref.current.showPicker();
      } catch {
        ref.current.focus();
      }
    }
  };

  return (
    <div
      onClick={openPicker}
      className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background cursor-pointer overflow-hidden hover:bg-accent/50 transition-colors"
    >
      {label && (
        <span className="flex items-center gap-1 px-2.5 text-xs text-muted-foreground bg-muted/50 border-r border-input shrink-0 select-none">
          <CalendarDays className="w-3.5 h-3.5" />
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 px-2">
        {!label && (
          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <div className="relative flex-1 min-w-0">
          <span
            className={`text-sm cursor-pointer ${value ? 'text-foreground' : 'text-muted-foreground'}`}
            onClick={openPicker}
          >
            {value ? formatEuro(value) : placeholder}
          </span>
          <input
            ref={ref}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

interface AdminFreeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carParks: CarPark[];
  selectedCarPark: CarPark | null;
  onSelectCarPark: (carPark: CarPark) => void;
  onFreed: () => void;
}

export function AdminFreeModal({
  open,
  onOpenChange,
  carParks,
  selectedCarPark,
  onSelectCarPark,
  onFreed,
}: AdminFreeModalProps) {
  const [mode, setMode] = useState<"free" | "book">("free");
  const [carParkId, setCarParkId] = useState(
    selectedCarPark?.id || carParks[0]?.id || "",
  );
  const [freeUsers, setFreeUsers] = useState<string[]>([]);
  const [bookUsers, setBookUsers] = useState<string[]>([]);
  const selectedUsers = mode === "free" ? freeUsers : bookUsers;
  const [dates, setDates] = useState<string[]>([]);
  const [tab, setTab] = useState<"single" | "range">("single");
  const [dateInput, setDateInput] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const usersRef = useRef<HTMLDivElement>(null);

  const [selectedSpace, setSelectedSpace] = useState("");
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState<
    { date: string; userName: string }[]
  >([]);

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
    "/api/users",
    fetcher,
  );
  const allUsers = [
    "Visitor",
    ...(Array.isArray(rawUsers) ? rawUsers.filter((u) => u !== "Visitor") : []),
  ];

  const { data: rawBookings = [] } = useSWR<Booking[]>(
    "/api/bookings",
    fetcher,
  );
  const allBookings = Array.isArray(rawBookings) ? rawBookings : [];

  const currentCarPark = carParks.find((cp) => cp.id === carParkId);
  const parkingSpaces = currentCarPark
    ? generateParkingSpaces(currentCarPark)
    : [];

  useEffect(() => {
    if (open) {
      setCarParkId(selectedCarPark?.id || carParks[0]?.id || "");
      setFreeUsers([]);
      setBookUsers([]);
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResultMessage(null);
      setSelectedSpace("");
      setShowConflictWarning(false);
      setPendingConflicts([]);
    }
  }, [open, selectedCarPark, carParks]);

  useEffect(() => {
    setShowConflictWarning(false);
    setPendingConflicts([]);
  }, [selectedSpace, dates]);

  const toggleUser = (u: string) => {
    if (mode === "book") {
      setBookUsers((prev) => (prev.includes(u) ? [] : [u]));
    } else {
      setFreeUsers((prev) =>
        prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u],
      );
    }
  };

  const selectAll = () => {
    if (mode === "book") return;
    if (Array.isArray(allUsers)) setFreeUsers([...allUsers]);
  };
  const deselectAll = () => {
    const setter = mode === "free" ? setFreeUsers : setBookUsers;
    setter([]);
  };

  const addDate = (iso: string) => {
    if (!iso || dates.includes(iso)) return;
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

  const handleFreeSubmit = async () => {
    if (dates.length === 0 || selectedUsers.length === 0 || !carParkId) return;
    setIsSubmitting(true);
    setResultMessage(null);
    try {
      const params = new URLSearchParams();
      dates.forEach((d) => params.append("dates", d));
      params.set("carParkId", carParkId);
      selectedUsers.forEach((u) =>
        params.append("userNames", normalizeUserName(u)),
      );
      const res = await fetch(`/api/bookings?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultMessage(
        `Freed ${data.freedCount} booking${data.freedCount !== 1 ? "s" : ""}.`,
      );
      onFreed();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to free bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookSubmit = async () => {
    if (
      dates.length === 0 ||
      selectedUsers.length === 0 ||
      !carParkId ||
      !selectedSpace
    )
      return;
    setIsSubmitting(true);
    setResultMessage(null);
    try {
      let bookedCount = 0;
      const errors: string[] = [];

      for (const userName of selectedUsers) {
        const apiUserName = normalizeUserName(userName);
        for (const date of dates) {
          const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spaceId: selectedSpace,
              carParkId,
              date,
              userName: apiUserName,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          bookedCount++;
        }
      }

      const parts = [
        `Booked ${bookedCount} booking${bookedCount !== 1 ? "s" : ""}.`,
      ];
      if (errors.length > 0) {
        parts.push(`Skipped ${errors.length}: ${errors.join(", ")}`);
      }
      setResultMessage(parts.join(" "));
      onFreed();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === "free") {
      await handleFreeSubmit();
      return;
    }

    if (showConflictWarning) {
      setShowConflictWarning(false);
      setPendingConflicts([]);
      await handleBookSubmit();
      return;
    }

    if (!selectedSpace) return;

    const conflicts = allBookings.filter(
      (b) =>
        b.carParkId === carParkId &&
        b.spaceId === selectedSpace &&
        dates.includes(b.date),
    );

    if (conflicts.length > 0) {
      setPendingConflicts(
        conflicts.map((c) => ({ date: c.date, userName: c.userName })),
      );
      setShowConflictWarning(true);
      return;
    }

    await handleBookSubmit();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFreeUsers([]);
      setBookUsers([]);
      setDates([]);
      setDateInput("");
      setRangeStart("");
      setRangeEnd("");
      setResultMessage(null);
      setSelectedSpace("");
      setShowConflictWarning(false);
      setPendingConflicts([]);
      onOpenChange(false);
    }
  };

  const conflictCount = pendingConflicts.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Manage car park bookings</DialogTitle>
          <DialogDescription>
            {mode === "free"
              ? "Free any user's booking from any car park."
              : "Book a space for any user in any car park."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full border-b border-border">
          <button
            type="button"
            onClick={() => {
              setMode("free");
              setResultMessage(null);
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer rounded-t-md ${
              mode === "free"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Free
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("book");
              setResultMessage(null);
              setShowConflictWarning(false);
              setPendingConflicts([]);
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer rounded-t-md ${
              mode === "book"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Book
          </button>
        </div>

        <div className="space-y-4 py-2">
          {mode === "book" && (
            <div className="space-y-1.5">
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
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1">
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

          <div className="space-y-1.5">
            <select
              value={carParkId}
              onChange={(e) => {
                const cp = carParks.find((p) => p.id === e.target.value);
                if (cp) onSelectCarPark(cp);
                setCarParkId(e.target.value);
                setFreeUsers([]);
                setBookUsers([]);
                setUsersOpen(false);
                setSelectedSpace("");
                setShowConflictWarning(false);
                setPendingConflicts([]);
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

          {mode !== "book" && (
            <>
              <div className="space-y-1.5">
                <div className="relative" ref={usersRef}>
                  <button
                    type="button"
                    onClick={() => setUsersOpen(!usersOpen)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className={
                        selectedUsers.length === 0
                          ? "text-muted-foreground"
                          : ""
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

              {selectedUsers.length > 0 && (
                <div className="-mt-2 flex flex-wrap gap-1">
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
            </>
          )}

          {mode === "book" && (
            <div className="space-y-1.5">
              <select
                value={selectedSpace}
                onChange={(e) => {
                  setSelectedSpace(e.target.value);
                  setShowConflictWarning(false);
                  setPendingConflicts([]);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a space...</option>
                {parkingSpaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.row}
                    {s.number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5 bg-muted p-2 rounded-md">
            <div className="flex w-full border-b border-border">
              <button
                type="button"
                onClick={() => setTab("single")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/20 cursor-pointer rounded-t-md border-b-2 -mb-px ${
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
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-b-2 hover:bg-accent/20 cursor-pointer rounded-t-md -mb-px ${
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
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <DatePicker
                      value={dateInput}
                      onChange={(val) => {
                        setDateInput(val);
                      }}
                      placeholder="Click to select days"
                    />
                  </div>
                  {dateInput && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        addDate(dateInput);
                      }}
                      className="shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {dates.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                    {dates.map((d) => (
                      <span
                        key={d}
                        className="flex w-full items-center gap-1 rounded-md border border-border bg-slate-100 pl-2 pr-1.5 py-1 text-[11px] font-medium"
                      >
                        <span className="text-muted-foreground">
                          {weekday(d)}
                        </span>
                        <span>{formatEuro(d)}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(d)}
                          className="ml-auto text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted-foreground/10"
                        >
                          <X className="w-2.5 h-2.5 text-red-500 cursor-pointer" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "range" && (
              <div className="pt-1 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <DatePicker
                      value={rangeStart}
                      onChange={setRangeStart}
                      placeholder="Click to select days"
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
                  className="cursor-pointer"
                >
                  Add Range
                </Button>
                {dates.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                    {dates.map((d) => (
                      <span
                        key={d}
                        className="flex w-full items-center gap-1 rounded-md border border-border bg-slate-100 pl-2 pr-1.5 py-1 text-[11px] font-medium"
                      >
                        <span className="text-muted-foreground">
                          {weekday(d)}
                        </span>
                        <span>{formatEuro(d)}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(d)}
                          className="ml-auto text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted-foreground/10"
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

          {showConflictWarning && conflictCount > 0 && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                Space {selectedSpace} is already booked on:
              </p>
              <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-1 mb-3">
                {pendingConflicts.map((c) => (
                  <li key={c.date}>
                    {weekday(c.date)} {formatEuro(c.date)} &mdash;{" "}
                    <span className="font-medium">{c.userName}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-600 dark:text-amber-300">
                These existing bookings will be replaced. Click "Continue
                anyway" to proceed, or select a different space.
              </p>
            </div>
          )}

          {resultMessage && (
            <div className="rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-700 dark:text-green-400">
              {resultMessage}
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
              dates.length === 0 ||
              selectedUsers.length === 0 ||
              isSubmitting ||
              (mode === "book" && !selectedSpace && !showConflictWarning)
            }
            variant={
              showConflictWarning
                ? "destructive"
                : mode === "free"
                  ? "destructive"
                  : "default"
            }
            className="cursor-pointer"
          >
            {isSubmitting
              ? mode === "free"
                ? "Freeing..."
                : "Booking..."
              : showConflictWarning
                ? `Continue anyway (${conflictCount} conflict${conflictCount !== 1 ? "s" : ""})`
                : `${mode === "free" ? "Free" : "Book"} (${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""}, ${dates.length} date${dates.length !== 1 ? "s" : ""}${mode === "book" && selectedSpace ? `, Space ${selectedSpace}` : ""})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
