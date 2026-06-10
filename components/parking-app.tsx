"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "./calendar";
import { ParkingLot } from "./parking-lot";
import { BorrowHistory } from "./borrow-history";
import { NotesPanel } from "./notes-panel";
import { MapPanel } from "./map-panel";
import { AppHeader } from "./app-header";
import { CarParkSelector } from "./car-park-selector";
import { StatsBar } from "./stats-bar";
import { AppFooter } from "./app-footer";
import {
  generateParkingSpaces,
  formatDate,
  isPastDate,
  findUserSpace,
} from "@/lib/parking-data";
import type { ParkingSpace, Booking, CarPark } from "@/lib/parking-data";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ParkingApp() {
  const [currentUser, setCurrentUser] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [bulkFreeOpen, setBulkFreeOpen] = useState(false);
  const [adminFreeOpen, setAdminFreeOpen] = useState(false);
  const [selectedCarPark, setSelectedCarPark] = useState<CarPark | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const email = user.email || user.user_metadata?.email || "";
        console.log("Logged in email:", email);
        setCurrentUser(
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        );
        setUserEmail(email);
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

  const { data: carParks = [], isLoading: carParksLoading } = useSWR<CarPark[]>(
    "/api/car-parks",
    fetcher,
  );

  useMemo(() => {
    if (carParks.length > 0 && !selectedCarPark) {
      setSelectedCarPark(carParks[0]);
    }
  }, [carParks, selectedCarPark]);

  const {
    data: allBookings = [],
    isLoading: bookingsLoading,
    mutate: refreshBookings,
  } = useSWR<Booking[]>("/api/bookings", fetcher);

  const parkingSpaces = useMemo(() => {
    if (!selectedCarPark) return [];
    return generateParkingSpaces(selectedCarPark);
  }, [selectedCarPark]);

  const dateBookings = useMemo(() => {
    if (!selectedCarPark) return [];
    const dateStr = formatDate(selectedDate);
    return allBookings.filter(
      (b) => b.date === dateStr && b.carParkId === selectedCarPark.id,
    );
  }, [allBookings, selectedDate, selectedCarPark]);

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

  const selectedSpaceBookedBy = useMemo(() => {
    if (!selectedSpace) return null;
    const booking = dateBookings.find((b) => b.spaceId === selectedSpace.id);
    return booking && booking.userName !== currentUser
      ? booking.userName
      : null;
  }, [selectedSpace, dateBookings, currentUser]);

  const carParkBookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!selectedCarPark) return counts;
    allBookings
      .filter((b) => b.carParkId === selectedCarPark.id)
      .forEach((b) => {
        counts[b.date] = (counts[b.date] || 0) + 1;
      });
    return counts;
  }, [allBookings, selectedCarPark]);

  const fullyBookedDates = useMemo(() => {
    const full: Record<string, boolean> = {};
    if (!selectedCarPark) return full;
    const total = parkingSpaces.length;
    Object.entries(carParkBookingCounts).forEach(([date, count]) => {
      if (count >= total) {
        full[date] = true;
      }
    });
    return full;
  }, [carParkBookingCounts, parkingSpaces, selectedCarPark]);

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

  const handleReallocate = useCallback(
    async (spaceId: string, userName: string) => {
      if (!selectedCarPark) return;
      try {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spaceId,
            carParkId: selectedCarPark.id,
            date: formatDate(selectedDate),
            userName,
          }),
        });
        refreshBookings();
      } catch {
        /* ignore */
      }
    },
    [selectedCarPark, selectedDate, refreshBookings],
  );

  const handleQuickBook = useCallback(async () => {
    if (!selectedCarPark || !currentUser) return;
    const spaceId = findUserSpace(
      currentUser,
      userEmail,
      selectedCarPark.id,
    )?.spaceId;
    if (!spaceId) return;
    if (isPastDate(selectedDate)) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          carParkId: selectedCarPark.id,
          date: formatDate(selectedDate),
          userName: currentUser,
          replaceExisting: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to book");
      const data = await response.json();
      await refreshBookings(data.allBookings, { revalidate: false });
    } catch (error) {
      console.error("Quick book failed:", error);
      alert(
        error instanceof Error ? error.message : "Failed to book your space",
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedCarPark, currentUser, selectedDate, refreshBookings]);

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
      <AppHeader
        currentUser={currentUser}
        avatarUrl={avatarUrl}
        userEmail={userEmail}
        adminMenuOpen={adminMenuOpen}
        onToggleAdminMenu={() => setAdminMenuOpen((v) => !v)}
        onCloseAdminMenu={() => setAdminMenuOpen(false)}
        bulkFreeOpen={bulkFreeOpen}
        onOpenBulkFree={() => setBulkFreeOpen(true)}
        onCloseBulkFree={() => setBulkFreeOpen(false)}
        adminFreeOpen={adminFreeOpen}
        onOpenAdminFree={() => setAdminFreeOpen(true)}
        onCloseAdminFree={() => setAdminFreeOpen(false)}
        carParks={carParks}
        selectedCarPark={selectedCarPark}
        onRefreshBookings={() => refreshBookings()}
        onSignOut={handleSignOut}
        currentYear={currentYear}
      />

      <CarParkSelector
        carParks={carParks}
        selectedCarPark={selectedCarPark}
        onSelectCarPark={handleSelectCarPark}
      />

      <StatsBar
        selectedCarPark={selectedCarPark}
        totalSpaces={totalSpaces}
        availableToday={availableToday}
        bookedToday={bookedToday}
        bookingsLoading={bookingsLoading}
      />

      <main className="max-w-8xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
              fullyBookedDates={fullyBookedDates}
            />
            <div className="hidden lg:block">
              <BorrowHistory
                carParkId={selectedCarPark.id}
                carParkName={selectedCarPark.name}
                selectedDate={selectedDate}
              />
            </div>
          </div>

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
              onReallocate={handleReallocate}
              onQuickBook={handleQuickBook}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="lg:hidden">
              <BorrowHistory
                carParkId={selectedCarPark.id}
                carParkName={selectedCarPark.name}
                selectedDate={selectedDate}
              />
            </div>
            <MapPanel
              address={selectedCarPark.address || selectedCarPark.location}
              name={selectedCarPark.name}
              latitude={selectedCarPark.latitude}
              longitude={selectedCarPark.longitude}
            />

            <NotesPanel
              carParkId={selectedCarPark.id}
              selectedDate={selectedDate}
              currentUser={currentUser}
            />
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
