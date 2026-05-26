'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Clock, User } from 'lucide-react';
import type { ParkingSpace, Booking } from '@/lib/parking-data';
import { formatDate, isPastDate } from '@/lib/parking-data';

interface BookingPanelProps {
  selectedDate: Date;
  selectedSpace: ParkingSpace | null;
  currentUser: string;
  onBook: () => void;
  onCancel: () => void;
  existingBooking: Booking | null;
  isLoading?: boolean;
}

export function BookingPanel({
  selectedDate,
  selectedSpace,
  currentUser,
  onBook,
  onCancel,
  existingBooking,
  isLoading,
}: BookingPanelProps) {
  const isPast = isPastDate(selectedDate);
  
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-foreground mb-4">Booking Details</h3>
      
      {/* Date info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Full day access (24h)</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{currentUser}</span>
        </div>
      </div>

      {/* Existing booking */}
      {existingBooking && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="font-medium text-accent-foreground">Your booking</span>
          </div>
          <p className="text-sm text-foreground">
            Space <span className="font-semibold">{existingBooking.spaceId}</span> is reserved for you
          </p>
          {!isPast && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cancel Booking
            </Button>
          )}
        </div>
      )}

      {/* Selected space */}
      {selectedSpace && !existingBooking && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Selected space</span>
          </div>
          <p className="text-sm text-foreground">
            Space <span className="font-semibold">{selectedSpace.id}</span>
            <span className="text-muted-foreground ml-2">
              ({selectedSpace.type === 'handicap' ? 'Accessible' : 
                selectedSpace.type === 'electric' ? 'EV Charging' : 'Standard'})
            </span>
          </p>
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

      {/* Book button */}
      {selectedSpace && !existingBooking && !isPast && (
        <Button
          onClick={onBook}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </Button>
      )}

      {/* Daily renewal notice */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Bookings are valid for one day only and must be renewed daily.
        </p>
      </div>
    </div>
  );
}
