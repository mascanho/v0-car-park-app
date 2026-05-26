"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "./calendar";
import { ParkingLot } from "./parking-lot";
import { BorrowHistory } from "./borrow-history";
import { NotesPanel } from "./notes-panel";
import {
  generateParkingSpaces,
  formatDate,
  isPastDate,
} from "@/lib/parking-data";
import type { ParkingSpace, Booking, CarPark } from "@/lib/parking-data";
import { Car, CalendarDays, MapPin, Loader2, LogOut } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ParkingApp() {
  const [currentUser, setCurrentUser] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedCarPark, setSelectedCarPark] = useState<CarPark | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        );
        setAvatarUrl(user.user_metadata?.avatar_url || "");
      }
    });
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }, [supabase]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Fetch car parks from database
  const { data: carParks = [], isLoading: carParksLoading } = useSWR<CarPark[]>(
    "/api/car-parks",
    fetcher,
  );

  // Set initial car park when data loads
  useMemo(() => {
    if (carParks.length > 0 && !selectedCarPark) {
      setSelectedCarPark(carParks[0]);
    }
  }, [carParks, selectedCarPark]);

  // Fetch all bookings from database
  const {
    data: allBookings = [],
    isLoading: bookingsLoading,
    mutate: refreshBookings,
  } = useSWR<Booking[]>(
    "/api/bookings",
    fetcher,
    { refreshInterval: 5000 }, // Refresh every 5 seconds
  );

  const parkingSpaces = useMemo(() => {
    if (!selectedCarPark) return [];
    return generateParkingSpaces(selectedCarPark);
  }, [selectedCarPark]);

  // Get bookings for selected date and car park
  const dateBookings = useMemo(() => {
    if (!selectedCarPark) return [];
    const dateStr = formatDate(selectedDate);
    return allBookings.filter(
      (b) => b.date === dateStr && b.carParkId === selectedCarPark.id,
    );
  }, [allBookings, selectedDate, selectedCarPark]);

  // Get current user's booking for selected date and car park
  const existingBooking = useMemo(() => {
    if (!selectedCarPark) return null;
    const dateStr = formatDate(selectedDate);
    return (
      allBookings.find(
        (b) =>
          b.date === dateStr &&
          b.userName === currentUser &&
          b.carParkId === selectedCarPark.id,
      ) || null
    );
  }, [allBookings, selectedDate, currentUser, selectedCarPark]);

  // If selected space is booked by someone else, it's borrowable
  const selectedSpaceBookedBy = useMemo(() => {
    if (!selectedSpace) return null;
    const booking = dateBookings.find((b) => b.spaceId === selectedSpace.id);
    return booking && booking.userName !== currentUser
      ? booking.userName
      : null;
  }, [selectedSpace, dateBookings, currentUser]);

  // Calculate booking counts per day for the calendar
  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allBookings.forEach((b) => {
      counts[b.date] = (counts[b.date] || 0) + 1;
    });
    return counts;
  }, [allBookings]);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const handleSelectCarPark = useCallback((carPark: CarPark) => {
    setSelectedCarPark(carPark);
    setSelectedSpace(null);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSpace(null);
  }, []);

  const handleSelectSpace = useCallback((space: ParkingSpace) => {
    setSelectedSpace(space);
  }, []);

  const handleBook = async () => {
    if (!selectedSpace) {
      alert("Please select a parking space.");
      return;
    }
    if (!selectedCarPark) {
      alert("Please select a car park.");
      return;
    }
    if (isPastDate(selectedDate)) {
      alert("Cannot book a space for a past date.");
      return;
    }
    if (!currentUser) {
      alert("You must be logged in to book a space.");
      return;
    }

    setIsLoading(true);

    try {
      const body = JSON.stringify({
        spaceId: selectedSpace.id,
        carParkId: selectedCarPark.id,
        date: formatDate(selectedDate),
        userName: currentUser,
        replaceExisting: true,
      });

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP ${response.status}: Failed to book space`,
        );
      }

      // Update the SWR cache directly with the new list of all bookings
      await refreshBookings(responseData.allBookings, { revalidate: false });
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error instanceof Error ? error.message : "Failed to book space");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = useCallback(async () => {
    if (!existingBooking || !existingBooking.id) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/bookings?id=${existingBooking.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      await refreshBookings();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  }, [existingBooking, refreshBookings]);

  const handleFreeSpace = useCallback(
    async (spaceId: string) => {
      const booking = dateBookings.find((b) => b.spaceId === spaceId);
      if (!booking?.id) return;
      try {
        const res = await fetch(`/api/bookings?id=${booking.id}`, {
          method: "DELETE",
        });
        if (res.ok) refreshBookings();
      } catch {
        /* ignore */
      }
    },
    [dateBookings, refreshBookings],
  );

  // Stats
  const totalSpaces = parkingSpaces.length;
  const bookedToday = dateBookings.length;
  const availableToday = totalSpaces - bookedToday;

  if (carParksLoading || !selectedCarPark) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading car parks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SlimSpot</h1>
                <p className="text-xs text-muted-foreground">
                  Daily parking reservations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>{currentYear}</span>
              </div>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {currentUser.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {currentUser}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Car Park Selector */}
      <div className="bg-card border-b border-border">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Select Car Park:</span>
            </div>
            <div className="flex gap-3">
              {carParks.map((carPark) => (
                <button
                  key={carPark.id}
                  onClick={() => handleSelectCarPark(carPark)}
                  className={`flex-1 sm:flex-none px-4 py-3 rounded-lg border-2 transition-all text-left ${
                    selectedCarPark.id === carPark.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30 bg-background"
                  }`}
                >
                  <div className="font-medium text-foreground">
                    {carPark.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {carPark.location}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-8xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {selectedCarPark.name}:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold text-foreground">
                {totalSpaces}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-semibold text-accent">
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

      {/* Main content */}
      <main className="max-w-8xl mx-auto px-4 py-6">
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
            <BorrowHistory
              carParkId={selectedCarPark.id}
              carParkName={selectedCarPark.name}
              selectedDate={selectedDate}
            />
          </div>

          {/* Parking lot */}
          <div className="lg:col-span-6 space-y-4">
            <ParkingLot
              spaces={parkingSpaces}
              bookings={dateBookings}
              selectedSpace={selectedSpace}
              onSelectSpace={handleSelectSpace}
              currentUser={currentUser}
              disabled={isPastDate(selectedDate) || !currentUser}
              carPark={selectedCarPark}
              date={selectedDate}
              onBook={handleBook}
              onCancel={handleCancelBooking}
              existingBooking={existingBooking}
              selectedSpaceBookedBy={selectedSpaceBookedBy}
              isLoading={isLoading}
              onFreeSpace={handleFreeSpace}
            />
          </div>

          {/* Notes column */}
          <div className="lg:col-span-3">
            <NotesPanel
              carParkId={selectedCarPark.id}
              selectedDate={selectedDate}
              currentUser={currentUser}
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
