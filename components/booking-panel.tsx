'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  selectedSpaceBookedBy?: string | null;
  isLoading?: boolean;
}

export function BookingPanel({
  selectedDate,
  selectedSpace,
  currentUser,
  onBook,
  onCancel,
  existingBooking,
  selectedSpaceBookedBy,
  isLoading,
}: BookingPanelProps) {
  const isPast = isPastDate(selectedDate);
  
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isBorrowing = !!selectedSpaceBookedBy;
  const isSwitching = !!existingBooking && selectedSpace && selectedSpace.id !== existingBooking.spaceId;

  const getButtonLabel = () => {
    if (isLoading) return 'Booking...';
    if (isSwitching) return isBorrowing ? 'Borrow & Switch' : 'Move to this Space';
    if (isBorrowing) return 'Borrow this Space';
    return 'Confirm Booking';
  };

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

      {/* Existing booking (only when not switching) */}
      {existingBooking && (!selectedSpace || selectedSpace.id === existingBooking.spaceId) && (
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

      {/* Switching from existing booking to another space */}
      {isSwitching && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">
            Switching from space <span className="font-semibold">{existingBooking.spaceId}</span>
          </p>
        </div>
      )}

      {/* Selected space */}
      {selectedSpace && (
        <div className={cn(
          'rounded-lg p-4 mb-4',
          isBorrowing ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-primary/10 border border-primary/30'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className={cn('w-4 h-4', isBorrowing ? 'text-amber-500' : 'text-primary')} />
            <span className={cn('font-medium', isBorrowing ? 'text-amber-600' : 'text-foreground')}>
              {isBorrowing ? 'Borrow this space' : 'Selected space'}
            </span>
          </div>
          <p className="text-sm text-foreground">
            Space <span className="font-semibold">{selectedSpace.id}</span>
          </p>
          {isBorrowing && (
            <p className="text-xs text-muted-foreground mt-1">
              Currently allocated to <span className="font-medium">{selectedSpaceBookedBy}</span>
            </p>
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
            'w-full',
            isBorrowing
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {getButtonLabel()}
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
