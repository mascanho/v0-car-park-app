'use client';

import { cn } from '@/lib/utils';
import type { ParkingSpace } from '@/lib/parking-data';
import { Car } from 'lucide-react';

interface ParkingSpaceProps {
  space: ParkingSpace;
  isBooked: boolean;
  isSelected: boolean;
  isCurrentUserBooking: boolean;
  bookedBy?: string;
  initials?: string;
  originalUser?: string | null;
  onSelect: (space: ParkingSpace) => void;
  disabled?: boolean;
}

export function ParkingSpaceCard({
  space,
  isBooked,
  isSelected,
  isCurrentUserBooking,
  bookedBy,
  initials,
  originalUser,
  onSelect,
  disabled,
}: ParkingSpaceProps) {
  const handleClick = () => {
    if (!disabled && !isCurrentUserBooking) {
      onSelect(space);
    }
  };

  const tooltip = isBooked
    ? isCurrentUserBooking
      ? 'Your booking'
      : originalUser
        ? `Borrowed by ${bookedBy} from ${originalUser}`
        : `Booked by ${bookedBy}`
    : space.id;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isCurrentUserBooking}
      title={tooltip}
      className={cn(
        'relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 min-h-[60px] min-w-[50px]',
        // Available state
        !isBooked && !isSelected && 'border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer',
        // Booked by others (borrowable)
        isBooked && !isCurrentUserBooking && 'border-destructive/50 bg-destructive/10 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5',
        // Booked by current user
        isCurrentUserBooking && 'border-accent bg-accent/20 cursor-default',
        // Selected state
        isSelected && 'border-primary bg-primary/20 ring-2 ring-primary ring-offset-2',
        // Disabled
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'text-xs font-semibold',
        isSelected && 'text-primary',
        isBooked && !isCurrentUserBooking && 'text-destructive',
        isCurrentUserBooking && 'text-accent-foreground'
      )}>
        {space.id}
      </span>
      <span className={cn(
        'mt-1 text-[10px] font-bold leading-none',
        isSelected && 'text-primary',
        isBooked && !isCurrentUserBooking && 'text-destructive/70',
        isCurrentUserBooking && 'text-accent'
      )}>
        {isCurrentUserBooking
          ? <span className="text-[10px] font-bold">YOU</span>
          : isBooked && initials
            ? <span className="text-[10px] font-bold">{initials}</span>
            : isBooked
              ? <Car className="w-4 h-4" />
              : <span className="text-[10px] font-bold">Free</span>
        }
      </span>
      {isCurrentUserBooking && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-card" />
      )}
    </button>
  );
}
