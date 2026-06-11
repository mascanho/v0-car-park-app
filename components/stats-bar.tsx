import { Loader2 } from "lucide-react";
import type { CarPark } from "@/lib/parking-data";

interface StatsBarProps {
  selectedCarPark: CarPark;
  totalSpaces: number;
  availableToday: number;
  bookedToday: number;
  bookingsLoading: boolean;
}

export function StatsBar({
  selectedCarPark,
  totalSpaces,
  availableToday,
  bookedToday,
  bookingsLoading,
}: StatsBarProps) {
  return (
    <div className="bg-muted/30 border-b border-border">
      <div className="max-w-8xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm flex-wrap">
          <span className="text-muted-foreground font-medium shrink-0">
            {selectedCarPark.name}:
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-foreground">{totalSpaces}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Available:</span>
            <span
              className={`font-semibold ${availableToday === 0 ? "text-destructive" : "text-green-500"}`}
            >
              {availableToday}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Booked:</span>
            <span className="font-semibold text-destructive">
              {bookedToday}
            </span>
          </div>
          {bookingsLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}
