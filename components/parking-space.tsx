'use client';

import { cn } from '@/lib/utils';
import type { ParkingSpace } from '@/lib/parking-data';
import { Car, Zap, Accessibility } from 'lucide-react';

interface ParkingSpaceProps {
  space: ParkingSpace;
  isBooked: boolean;
  isSelected: boolean;
  isCurrentUserBooking: boolean;
  onSelect: (space: ParkingSpace) => void;
  disabled?: boolean;
}

export function ParkingSpaceCard({
  space,
  isBooked,
  isSelected,
  isCurrentUserBooking,
  onSelect,
  disabled,
}: ParkingSpaceProps) {
  const handleClick = () => {
    if (!disabled && !isBooked) {
      onSelect(space);
    }
  };

  const getIcon = () => {
    switch (space.type) {
      case 'handicap':
        return <Accessibility className="w-4 h-4" />;
      case 'electric':
        return <Zap className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isBooked}
      className={cn(
        'relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 min-h-[60px] min-w-[50px]',
        // Available state
        !isBooked && !isSelected && 'border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer',
        // Booked by others
        isBooked && !isCurrentUserBooking && 'border-destructive/50 bg-destructive/10 cursor-not-allowed opacity-60',
        // Booked by current user
        isCurrentUserBooking && 'border-accent bg-accent/20 cursor-default',
        // Selected state
        isSelected && 'border-primary bg-primary/20 ring-2 ring-primary ring-offset-2',
        // Disabled
        disabled && !isBooked && 'opacity-50 cursor-not-allowed'
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
        'mt-1',
        isSelected && 'text-primary',
        isBooked && !isCurrentUserBooking && 'text-destructive/70',
        isCurrentUserBooking && 'text-accent'
      )}>
        {getIcon()}
      </span>
      {isCurrentUserBooking && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-card" />
      )}
    </button>
  );
}
