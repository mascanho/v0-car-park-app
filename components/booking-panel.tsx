"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  User,
  ExternalLink,
  LucideCircleParking,
} from "lucide-react";
import type { ParkingSpace, Booking } from "@/lib/parking-data";
import { isPastDate } from "@/lib/parking-data";

interface BookingPanelProps {
  selectedDate: Date;
  selectedSpace: ParkingSpace | null;
  currentUser: string;
  onBook: () => void;
  onCancel: () => void;
  existingBooking: Booking | null;
  selectedSpaceBookedBy?: string | null;
  selectedSpaceBookedByEmail?: string | null;
  isLoading?: boolean;
  carParkName?: string;
}

export function BookingPanel({
  selectedDate,
  selectedSpace,
  currentUser,
  onBook,
  onCancel,
  existingBooking,
  selectedSpaceBookedBy,
  selectedSpaceBookedByEmail,
  isLoading,
  carParkName,
}: BookingPanelProps) {
  const isPast = isPastDate(selectedDate);

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isBorrowing = !!selectedSpaceBookedBy;
  const isSwitching =
    !!existingBooking &&
    selectedSpace &&
    selectedSpace.id !== existingBooking.spaceId;

  const getButtonLabel = () => {
    if (isLoading) return "Booking...";
    if (isSwitching)
      return isBorrowing ? "Borrow & Switch" : "Move to this Space";
    if (isBorrowing) return "Borrow this Space";
    return "Confirm Booking";
  };

  return (
    <div className="bg-card rounded-xl md:border md:border-border md:p-6 md:shadow-sm mt-4">
      <h3 className="font-semibold text-lg text-foreground mb-4">
        Booking Details
      </h3>

      {/* Date info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{formattedDate}</span>
        </div>
        {carParkName && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{carParkName}</span>
          </div>
        )}
        {selectedSpace && (
          <div className="flex items-center gap-3 text-sm">
            <LucideCircleParking className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">
              Space <span className="font-semibold">{selectedSpace.id}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{currentUser}</span>
        </div>
      </div>

      {/* Existing booking (only when not switching) */}
      {existingBooking &&
        (!selectedSpace || selectedSpace.id === existingBooking.spaceId) && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">
                Your booking
              </span>
            </div>
            <p className="text-sm text-foreground">
              Space{" "}
              <span className="font-semibold">{existingBooking.spaceId}</span>{" "}
              is reserved for you
            </p>
            {!isPast && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
                className="mt-3 w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        )}

      {/* Switching from existing booking to another space */}
      {isSwitching && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">
            Switching from space{" "}
            <span className="font-semibold">{existingBooking.spaceId}</span>
          </p>
        </div>
      )}

      {/* Selected space */}
      {selectedSpace && (
        <div
          className={cn(
            "rounded-lg p-4 mb-4",
            isBorrowing
              ? "bg-amber-500/10 border border-amber-500/30"
              : "bg-primary/10 border border-primary/30",
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin
              className={cn(
                "w-4 h-4",
                isBorrowing ? "text-amber-500" : "text-primary",
              )}
            />
            <span
              className={cn(
                "font-medium",
                isBorrowing ? "text-amber-600" : "text-foreground",
              )}
            >
              {isBorrowing ? "Borrow this space" : "Selected space"}
            </span>
          </div>
          <p className="text-sm text-foreground">
            Space <span className="font-semibold">{selectedSpace.id}</span>
            <span className="text-muted-foreground ml-2"></span>
          </p>
          {isBorrowing && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Currently allocated to{" "}
                <span className="font-medium">{selectedSpaceBookedBy}</span>
              </p>
              {selectedSpaceBookedByEmail && (
                <a
                  href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(selectedSpaceBookedByEmail)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Request to book
                </a>
              )}
            </div>
          )}

          {selectedSpace.id === "26" && (
            <span>
              <p className="text-xs text-muted-foreground mt-1">
                This space allows EV charging{" "}
              </p>
            </span>
          )}
        </div>
      )}

      {/* No selection message */}
      {!selectedSpace && !existingBooking && !isPast && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground text-center">
            Select a parking space from the lot to make a booking
          </p>
        </div>
      )}

      {/* Past date message */}
      {isPast && !existingBooking && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground text-center">
            Cannot book spaces for past dates
          </p>
        </div>
      )}

      {/* Book / Borrow / Switch button */}
      {selectedSpace && !isPast && (existingBooking ? isSwitching : true) && (
        <Button
          onClick={onBook}
          disabled={isLoading}
          className={cn(
            "w-full",
            isBorrowing
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {getButtonLabel()}
        </Button>
      )}

      {/* Daily renewal notice */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Bookings are the user's responsibility
        </p>
      </div>
    </div>
  );
}
