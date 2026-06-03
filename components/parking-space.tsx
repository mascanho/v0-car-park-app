'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ParkingSpace } from '@/lib/parking-data';
import { Car, Trash2, UserRoundPlus, Loader2 } from 'lucide-react';

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
  onFreeSpace?: (spaceId: string) => void;
  onReallocate?: (spaceId: string, userName: string) => void;
  carParkId?: string;
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
  onFreeSpace,
  onReallocate,
  carParkId,
}: ParkingSpaceProps) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuPos) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
        setShowUsers(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuPos]);

  const handleClick = () => {
    if (!disabled && !isCurrentUserBooking) {
      onSelect(space);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowUsers(false);
  };

  const handleFree = () => {
    setMenuPos(null);
    if (onFreeSpace) onFreeSpace(space.id);
  };

  const handleReallocateClick = async () => {
    setShowUsers(true);
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/users?carParkId=${carParkId}`);
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    setLoadingUsers(false);
  };

  const handleSelectUser = (userName: string) => {
    setMenuPos(null);
    setShowUsers(false);
    if (onReallocate) onReallocate(space.id, userName);
  };

  const tooltip = isBooked
    ? isCurrentUserBooking
      ? 'Your booking'
      : originalUser
        ? `Borrowed by ${bookedBy} from ${originalUser}`
        : `Booked by ${bookedBy}`
    : space.id;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        disabled={disabled || isCurrentUserBooking}
        title={tooltip}
        className={cn(
          'relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 min-h-[60px] min-w-[50px]',
          !isBooked && !isSelected && 'border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer',
          isBooked && !isCurrentUserBooking && 'border-destructive/50 bg-destructive/10 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5',
          isCurrentUserBooking && 'border-accent bg-accent/20 cursor-default',
          isSelected && 'border-primary bg-primary/20 ring-2 ring-primary ring-offset-2',
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

      {menuPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setMenuPos(null); setShowUsers(false); }} />
          <div
            ref={menuRef}
            className="fixed z-50 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[180px]"
            style={{ left: menuPos.x, top: menuPos.y }}
          >
            {isBooked && onFreeSpace && (
              <button
                onClick={handleFree}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Free this space
              </button>
            )}
            {onReallocate && (
              <div className="relative">
                <button
                  onClick={handleReallocateClick}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/50 text-left"
                >
                  <UserRoundPlus className="w-3.5 h-3.5" />
                  {isBooked ? 'Re-allocate' : 'Allocate to...'}
                </button>
                {showUsers && (
                  <div className="absolute left-full top-0 ml-1 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[180px] max-h-60 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="flex justify-center py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      users.map((name) => (
                        <button
                          key={name}
                          onClick={() => handleSelectUser(name)}
                          className="w-full px-3 py-1.5 text-xs text-left text-foreground hover:bg-muted/50 truncate"
                        >
                          {name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
