"use client";

import { useMemo, useCallback } from "react";
import { ParkingSpaceCard } from "./parking-space";
import { BookingPanel } from "./booking-panel";
import type { ParkingSpace, Booking, CarPark } from "@/lib/parking-data";
import { formatDate } from "@/lib/parking-data";

interface ParkingLotProps {
  spaces: ParkingSpace[];
  bookings: Booking[];
  selectedSpace: ParkingSpace | null;
  onSelectSpace: (space: ParkingSpace) => void;
  currentUser: string;
  currentUserEmail: string;
  disabled?: boolean;
  carPark: CarPark;
  date: Date | undefined;
  onBook: () => void;
  onCancel: () => void;
  existingBooking: Booking | null;
  selectedSpaceBookedBy?: string | null;
  isLoading?: boolean;
  onFreeSpace?: (spaceId: string) => void;
  onReallocate?: (spaceId: string, userName: string) => void;
}

export function ParkingLot({
  carPark,
  spaces,
  bookings,
  selectedSpace,
  onSelectSpace,
  currentUser,
  currentUserEmail,
  disabled,
  date,
  onBook,
  onCancel,
  existingBooking,
  selectedSpaceBookedBy,
  isLoading,
  onFreeSpace,
  onReallocate,
}: ParkingLotProps) {
  const formattedDate = date ? formatDate(date) : undefined;

  const rows = useMemo(() => {
    const uniqueRows = new Set(spaces.map((s) => s.row));
    return Array.from(uniqueRows).sort();
  }, [spaces]);

  const getBookingForSpace = useCallback(
    (spaceId: string) => {
      return bookings.find(
        (b) =>
          formattedDate &&
          b.spaceId === spaceId &&
          b.carParkId === carPark.id &&
          b.date === formattedDate,
      );
    },
    [bookings, carPark.id, formattedDate],
  );

  const isSpaceBooked = useCallback(
    (spaceId: string) => {
      return !!getBookingForSpace(spaceId);
    },
    [getBookingForSpace],
  );

  const isCurrentUserBooking = useCallback(
    (spaceId: string) => {
      const booking = getBookingForSpace(spaceId);
      return booking?.userName === currentUser;
    },
    [getBookingForSpace, currentUser],
  );

  const isVisitor = useCallback(
    (spaceId: string) => {
      const booking = getBookingForSpace(spaceId);
      return booking?.userName === "VISITOR";
    },
    [getBookingForSpace],
  );

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Car Park Title */}
      <div className="mb-4 pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {carPark.name}
        </h2>
        <p className="text-sm text-muted-foreground">{carPark.location}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-card border-2 border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-destructive/10 border-2 border-destructive/50" />
          <span className="text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-accent/20 border-2 border-accent" />
          <span className="text-muted-foreground">Your Booking</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary ring-2 ring-primary ring-offset-1" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-neutral-800 border-2 border-neutral-600" />
          <span className="text-muted-foreground">Visitor</span>
        </div>
      </div>

      {/* Parking lot layout */}
      <div className="relative">
        {carPark.id === "grosvenor" ? (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
            Entry / Exit
          </div>
        ) : (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-muted/50 rounded-full px-4 py-2 ">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-20 h-0.5 bg-muted-foreground/30" />
              <span className="text-center w-full">Driving Lane</span>
              <div className="w-20 h-0.5 bg-muted-foreground/30" />
            </div>
          </div>
        )}

        {/* Parking grid */}
        <div className="pt-6 space-y-3">
          {rows.map((row) => {
            const rowSpaces = spaces.filter((s) => s.row === row);
            return (
              <div key={row} className="flex items-center gap-2">
                <span className="w-6 text-sm font-semibold text-muted-foreground">
                  {row}
                </span>
                <div className="flex flex-wrap gap-2 mt-4">
                  {rowSpaces.map((space) => (
                    <ParkingSpaceCard
                      key={space.id}
                      space={space}
                      isBooked={isSpaceBooked(space.id)}
                      isSelected={selectedSpace?.id === space.id}
                      isCurrentUserBooking={isCurrentUserBooking(space.id)}
                      isVisitor={isVisitor(space.id)}
                      bookedBy={getBookingForSpace(space.id)?.userName}
                      initials={getBookingForSpace(space.id)?.initials}
                      originalUser={getBookingForSpace(space.id)?.originalUser}
                      onSelect={onSelectSpace}
                      disabled={disabled}
                      onFreeSpace={onFreeSpace}
                      onReallocate={onReallocate}
                      carParkId={carPark.id}
                      currentUser={currentUser}
                      currentUserEmail={currentUserEmail}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Driving lanes indicator / Entry */}
        {carPark.id === "grosvenor" ? (
          <div className="mt-4 flex justify-center">
            <div className="bg-muted/50 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-8 h-0.5 bg-muted-foreground/30" />
                <span>Driving Lane</span>
                <div className="w-8 h-0.5 bg-muted-foreground/30" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
              Entry / Exit
            </div>
          </div>
        )}
      </div>

      {/* Booking details */}
      <div className="mt-6 pt-2 border-t border-border">
        <BookingPanel
          selectedDate={date || new Date()}
          selectedSpace={selectedSpace}
          currentUser={currentUser}
          onBook={onBook}
          onCancel={onCancel}
          existingBooking={existingBooking}
          selectedSpaceBookedBy={selectedSpaceBookedBy}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
