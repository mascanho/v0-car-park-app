'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar } from './calendar';
import { ParkingLot } from './parking-lot';
import { BookingPanel } from './booking-panel';
import { generateParkingSpaces, formatDate, isPastDate } from '@/lib/parking-data';
import type { ParkingSpace, Booking } from '@/lib/parking-data';
import { Car, CalendarDays } from 'lucide-react';

// Simulated bookings (in production, this would come from a database)
const initialBookings: Booking[] = [
  { spaceId: 'A3', date: formatDate(new Date()), userName: 'John Doe' },
  { spaceId: 'B5', date: formatDate(new Date()), userName: 'Jane Smith' },
  { spaceId: 'C2', date: formatDate(new Date()), userName: 'Bob Wilson' },
  { spaceId: 'D8', date: formatDate(new Date()), userName: 'Alice Brown' },
  { spaceId: 'A4', date: formatDate(new Date(new Date().setDate(new Date().getDate() + 1))), userName: 'John Doe' },
  { spaceId: 'B1', date: formatDate(new Date(new Date().setDate(new Date().getDate() + 1))), userName: 'Sarah Lee' },
];

export function ParkingApp() {
  const [currentUser] = useState('Current User');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(false);
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const parkingSpaces = useMemo(() => generateParkingSpaces(), []);
  
  // Get bookings for selected date
  const dateBookings = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return bookings.filter((b) => b.date === dateStr);
  }, [bookings, selectedDate]);
  
  // Get current user's booking for selected date
  const existingBooking = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return bookings.find((b) => b.date === dateStr && b.userName === currentUser) || null;
  }, [bookings, selectedDate, currentUser]);
  
  // Calculate booking counts per day for the calendar
  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.date] = (counts[b.date] || 0) + 1;
    });
    return counts;
  }, [bookings]);
  
  const handleMonthChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);
  
  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSpace(null);
  }, []);
  
  const handleSelectSpace = useCallback((space: ParkingSpace) => {
    setSelectedSpace(space);
  }, []);
  
  const handleBook = useCallback(async () => {
    if (!selectedSpace || existingBooking || isPastDate(selectedDate)) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newBooking: Booking = {
      spaceId: selectedSpace.id,
      date: formatDate(selectedDate),
      userName: currentUser,
    };
    
    setBookings((prev) => [...prev, newBooking]);
    setSelectedSpace(null);
    setIsLoading(false);
  }, [selectedSpace, existingBooking, selectedDate, currentUser]);
  
  const handleCancelBooking = useCallback(async () => {
    if (!existingBooking) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setBookings((prev) => 
      prev.filter((b) => !(b.date === existingBooking.date && b.userName === existingBooking.userName))
    );
    setIsLoading(false);
  }, [existingBooking]);

  // Stats
  const totalSpaces = parkingSpaces.length;
  const bookedToday = dateBookings.length;
  const availableToday = totalSpaces - bookedToday;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ParkSpot</h1>
                <p className="text-xs text-muted-foreground">Daily parking reservations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>{currentYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {currentUser.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {currentUser}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold text-foreground">{totalSpaces}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-semibold text-accent">{availableToday}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Booked:</span>
              <span className="font-semibold text-destructive">{bookedToday}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
              bookingCounts={bookingCounts}
            />
            <BookingPanel
              selectedDate={selectedDate}
              selectedSpace={selectedSpace}
              currentUser={currentUser}
              onBook={handleBook}
              onCancel={handleCancelBooking}
              existingBooking={existingBooking}
              isLoading={isLoading}
            />
          </div>

          {/* Parking lot */}
          <div className="lg:col-span-9">
            <ParkingLot
              spaces={parkingSpaces}
              bookings={dateBookings}
              selectedSpace={selectedSpace}
              onSelectSpace={handleSelectSpace}
              currentUser={currentUser}
              disabled={isPastDate(selectedDate) || !!existingBooking}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-muted-foreground">
            Bookings reset daily at midnight. Please renew your space each day.
          </p>
        </div>
      </footer>
    </div>
  );
}
