"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ParkingSpace } from "@/lib/parking-data";
import { Car, Trash2, UserRoundPlus, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ParkingSpaceProps {
  space: ParkingSpace;
  isBooked: boolean;
  isSelected: boolean;
  isCurrentUserBooking: boolean;
  isVisitor: boolean;
  bookedBy?: string;
  initials?: string;
  originalUser?: string | null;
  onSelect: (space: ParkingSpace) => void;
  disabled?: boolean;
  onFreeSpace?: (spaceId: string) => void;
  onReallocate?: (spaceId: string, userName: string) => void;
  carParkId?: string;
  currentUser?: string;
  currentUserEmail?: string;
}

export function ParkingSpaceCard({
  space,
  isBooked,
  isSelected,
  isCurrentUserBooking,
  isVisitor,
  bookedBy,
  initials,
  originalUser,
  onSelect,
  disabled,
  onFreeSpace,
  onReallocate,
  carParkId,
  currentUser,
  currentUserEmail,
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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
    } catch {
      /* ignore */
    }
    setLoadingUsers(false);
  };

  const handleSelectUser = (userName: string) => {
    setMenuPos(null);
    setShowUsers(false);
    if (onReallocate) onReallocate(space.id, userName);
  };

  const handleVisitorAllocate = () => {
    setMenuPos(null);
    if (onReallocate) onReallocate(space.id, "VISITOR");
  };

  const isAdmin =
    currentUserEmail === "m.guerreiro@slimstock.com" ||
    currentUser === "Marco Guerreiro";

  const tooltip = isBooked
    ? isCurrentUserBooking
      ? space.electrified ? "Your booking — Electrified" : "Your booking"
      : isVisitor
        ? "Visitor"
        : originalUser
          ? `Borrowed by ${bookedBy} from ${originalUser}`
          : `Booked by ${bookedBy}`
    : space.electrified
      ? "Electrified"
      : null;

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            disabled={disabled || isCurrentUserBooking}
            className={cn(
              "relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 min-h-[60px] min-w-[50px]",
              !isBooked &&
                !isSelected &&
                "border-green-500/50 bg-green-500/20 hover:border-primary hover:bg-primary/5 cursor-pointer",
              isBooked &&
                !isCurrentUserBooking &&
                !isVisitor &&
                "border-destructive/50 bg-destructive/10 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5",
              isVisitor && "border-neutral-600 bg-black cursor-pointer",
              isCurrentUserBooking && "border-blue-500 bg-blue-500/20 cursor-default",
              isSelected &&
                "border-violet-500 bg-violet-500/20 ring-2 ring-violet-500 ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "text-xs font-semibold",
                isSelected && "text-violet-600 dark:text-violet-400",
                !isBooked && !isSelected && "text-green-600 dark:text-green-400",
                isBooked &&
                  !isCurrentUserBooking &&
                  !isVisitor &&
                  "text-destructive",
                isVisitor && !isSelected && "text-neutral-100",
                isVisitor && isSelected && "text-destructive",
                isCurrentUserBooking && "text-blue-600 dark:text-blue-400",
              )}
            >
              {space.id}
            </span>
            <span
              className={cn(
                "mt-1 text-[10px] font-bold leading-none",
                isSelected && "text-violet-600 dark:text-violet-400",
                !isBooked && !isSelected && "text-green-600 dark:text-green-400",
                isBooked &&
                  !isCurrentUserBooking &&
                  !isVisitor &&
                  "text-destructive/70",
                isVisitor && !isSelected && "text-neutral-300",
                isVisitor && isSelected && "text-destructive",
                isCurrentUserBooking && "text-blue-500",
              )}
            >
              {isCurrentUserBooking ? (
                <span className="text-[10px] font-bold">YOU</span>
              ) : isVisitor ? (
                <span className="text-[10px] font-bold">VISITOR</span>
              ) : isBooked && initials ? (
                <span className="text-[10px] font-bold">{initials}</span>
              ) : isBooked ? (
                <Car className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-bold">Free</span>
              )}
            </span>
            {isCurrentUserBooking && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-card" />
            )}
            {isVisitor && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-neutral-400 rounded-full border-2 border-card" />
            )}
            {space.electrified && (
              <span className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none select-none text-yellow-500/30">
                ⚡
              </span>
            )}
          </button>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent side="top" className="max-w-[200px] text-center">
            {tooltip}
          </TooltipContent>
        )}
      </Tooltip>

      {menuPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setMenuPos(null);
              setShowUsers(false);
            }}
          />
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
            {isAdmin && onReallocate && (
              <div className="relative">
                <button
                  onClick={handleReallocateClick}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/50 text-left"
                >
                  <UserRoundPlus className="w-3.5 h-3.5" />
                  {isBooked ? "Re-allocate" : "Allocate to..."}
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
            {isAdmin && onReallocate && (
              <button
                onClick={handleVisitorAllocate}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm  hover:bg-neutral-800/50 text-left"
              >
                <UserRoundPlus className="w-3.5 h-3.5" />
                Allocate to VISITOR
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
