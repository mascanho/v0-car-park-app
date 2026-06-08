"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MONTH_NAMES,
  DAY_NAMES,
  getDaysInMonth,
  getFirstDayOfMonth,
  isPastDate,
  formatDate,
} from "@/lib/parking-data";

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  fullyBookedDates?: Record<string, boolean>;
}

export function Calendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  currentYear,
  onMonthChange,
  fullyBookedDates = {},
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const canGoPrev = !(
    currentYear === today.getFullYear() && currentMonth === today.getMonth()
  );
  const canGoNext = !(
    currentYear === today.getFullYear() && currentMonth === 11
  );

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-foreground">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const date = new Date(currentYear, currentMonth, day);
          const dateStr = formatDate(date);
          const isSelected = formatDate(selectedDate) === dateStr;
          const isToday = formatDate(today) === dateStr;
          const isPast = isPastDate(date);
          const isFullyBooked = fullyBookedDates[dateStr] === true;

          return (
            <button
              key={day}
              onClick={() => !isPast && onSelectDate(date)}
              disabled={isPast}
              className={cn(
                "relative h-10 rounded-lg text-sm font-medium transition-all duration-200",
                // Selected (overrides everything)
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary",
                // Today (not selected)
                isToday && !isSelected && "border-2 border-primary",
                // Past dates (disabled)
                isPast &&
                  "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
                // Fully booked (no spaces available) - red
                !isPast &&
                  !isSelected &&
                  isFullyBooked &&
                  "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/30",
                // Available (spaces available) - green
                !isPast &&
                  !isSelected &&
                  !isFullyBooked &&
                  "bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/30",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/50" />
          <span className="text-xs text-muted-foreground">Available slots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/50" />
          <span className="text-xs text-muted-foreground">Fully booked</span>
        </div>
      </div>
    </div>
  );
}
