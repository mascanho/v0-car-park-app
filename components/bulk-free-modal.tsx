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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      setStartDate("");
      setEndDate("");
      setResult(null);
    }
  }, [open, selectedCarPark.id, currentUser, userEmail]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const bookingUserName = userMatch?.dbUserName || currentUser;
      const params = new URLSearchParams({
        startDate,
        endDate,
        carParkId,
        userName: bookingUserName,
      });
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
      setStartDate("");
      setEndDate("");
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
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
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
              !startDate ||
              !endDate ||
              isSubmitting ||
              userCarParks.length === 0
            }
            variant="destructive"
          >
            {isSubmitting ? "Freeing..." : "Free My Bookings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
