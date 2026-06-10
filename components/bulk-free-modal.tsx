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
import { X, CalendarDays } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function weekday(dateStr: string) {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return WEEKDAYS[day];
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
  const [dateInput, setDateInput] = useState("");
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
      setResult(null);
    }
  }, [open, selectedCarPark.id, currentUser, userEmail]);

  const addDate = () => {
    if (!dateInput) return;
    if (dates.includes(dateInput)) return;
    setDates((prev) => [...prev, dateInput].sort());
    setDateInput("");
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
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Free your car space</DialogTitle>
          <DialogDescription>
            Not going to be in? Let someone else use your spot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Car Park</label>
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
            <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                You will free
              </p>
              <p className="text-2xl font-bold text-destructive">
                Space {userMatch.spaceId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {userMatch.dbUserName}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Days to free space</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addDate}
                disabled={!dateInput}
              >
                Add
              </Button>
            </div>
          </div>

          {/* <div className="space-y-1.5"> */}
          {/*   <label className="text-sm font-medium">Selected Dates</label> */}
          {/* </div> */}
          {dates.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dates.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted pl-2 pr-1.5 py-1 text-[9.5px] sm:text-[11px] font-medium w-full"
                >
                  <CalendarDays className="w-2 h-2 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{weekday(d)}</span>
                  <span className="flex-1">{d}</span>
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
              dates.length === 0 || isSubmitting || userCarParks.length === 0
            }
            variant="destructive"
          >
            {isSubmitting
              ? "Freeing..."
              : `Free My Bookings (${dates.length} date${dates.length !== 1 ? "s" : ""})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
