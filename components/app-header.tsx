"use client";

import { useCallback, useEffect, useRef } from "react";
import { Sheet, SheetTrigger } from "./ui/sheet";
import {
  Car,
  CalendarDays,
  LogOut,
  Shield,
  Database,
  ParkingCircle,
  Trash2,
} from "lucide-react";
import { BulkFreeModal } from "./bulk-free-modal";
import { AppInfoSheet } from "./app-info-sheet";
import type { CarPark } from "@/lib/parking-data";

interface AppHeaderProps {
  currentUser: string;
  avatarUrl: string;
  userEmail: string;
  adminMenuOpen: boolean;
  onToggleAdminMenu: () => void;
  onCloseAdminMenu: () => void;
  bulkFreeOpen: boolean;
  onOpenBulkFree: () => void;
  onCloseBulkFree: () => void;
  carParks: CarPark[];
  selectedCarPark: CarPark;
  onRefreshBookings: () => void;
  onSignOut: () => void;
  currentYear: number;
}

export function AppHeader({
  currentUser,
  avatarUrl,
  userEmail,
  adminMenuOpen,
  onToggleAdminMenu,
  onCloseAdminMenu,
  bulkFreeOpen,
  onOpenBulkFree,
  onCloseBulkFree,
  carParks,
  selectedCarPark,
  onRefreshBookings,
  onSignOut,
  currentYear,
}: AppHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-8xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    SlimSpot
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Daily parking reservations
                  </p>
                </div>
              </div>
            </SheetTrigger>
            <AppInfoSheet />
          </Sheet>
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
              {(userEmail.toLowerCase().trim() ===
                "m.guerreiro@slimstock.com" ||
                currentUser === "Marco Guerreiro") && (
                <AdminDropdown
                  open={adminMenuOpen}
                  onToggle={onToggleAdminMenu}
                  onClose={onCloseAdminMenu}
                  onOpenBulkFree={onOpenBulkFree}
                />
              )}
              <button
                onClick={onOpenBulkFree}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Bulk Free"
              >
                <ParkingCircle className="w-4 h-4 animate-pulse text-orange-600" />
              </button>
              <BulkFreeModal
                open={bulkFreeOpen}
                onOpenChange={onCloseBulkFree}
                carParks={carParks}
                selectedCarPark={selectedCarPark}
                currentUser={currentUser}
                userEmail={userEmail}
                onFreed={onRefreshBookings}
              />
              <button
                onClick={onSignOut}
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
  );
}

function AdminDropdown({
  open,
  onToggle,
  onClose,
  onOpenBulkFree,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenBulkFree: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        title="Admin"
      >
        <Shield className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => {
              window.open(
                "https://supabase.com/dashboard/project/pmjdrswfxxuaqayojccz",
                "_blank",
              );
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
          >
            <Database className="w-4 h-4 text-muted-foreground" />
            Supabase Dashboard
          </button>
          <button
            onClick={() => {
              window.open("/api/bookings?format=json", "_blank");
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
          >
            <Shield className="w-4 h-4 text-muted-foreground" />
            Raw Bookings
          </button>
          <button
            onClick={() => {
              onOpenBulkFree();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-destructive/70" />
            Bulk Free
          </button>
        </div>
      )}
    </div>
  );
}
