"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sheet, SheetTrigger } from "./ui/sheet";
import {
  Menu,
  Car,
  LogOut,
  Shield,
  Database,
  ParkingCircle,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { BulkFreeModal } from "./bulk-free-modal";
import { AdminFreeModal } from "./admin-free-modal";
import { AppInfoSheet } from "./app-info-sheet";
import type { CarPark } from "@/lib/parking-data";
import { CarParkSelector } from "./car-park-selector";

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
  adminFreeOpen: boolean;
  onOpenAdminFree: () => void;
  onCloseAdminFree: () => void;
  carParks: CarPark[];
  selectedCarPark: CarPark;
  onRefreshBookings: () => void;
  onSignOut: () => void;
  currentYear: number;
  isRegular: boolean;
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
  adminFreeOpen,
  onOpenAdminFree,
  onCloseAdminFree,
  carParks,
  selectedCarPark,
  onRefreshBookings,
  onSignOut,
  currentYear,
  isRegular,
}: AppHeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-xs sticky top-0 z-10">
      <div className="max-w-8xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Sheet>
            <div className="flex items-center gap-3">
              <SheetTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Menu className="w-6 h-6 cursor-pointer" />
                </button>
              </SheetTrigger>
              <div
                className="hidden sm:flex items-center gap-3"
                onClick={() => (window.location.href = "/")}
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center cursor-pointer">
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
            </div>
            <AppInfoSheet />
          </Sheet>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {[
                "m.guerreiro@slimstock.com",
                "j.cooper@slimstock.com",
                "n.cooper@slimstock.com",
              ].includes(userEmail.toLowerCase().trim()) && (
                <AdminDropdown
                  open={adminMenuOpen}
                  onToggle={onToggleAdminMenu}
                  onClose={onCloseAdminMenu}
                  onOpenBulkFree={onOpenBulkFree}
                  onOpenAdminFree={onOpenAdminFree}
                />
              )}
              {isRegular && (
                <button
                  onClick={onOpenBulkFree}
                  className="p-1.5  flex items-center gap-1 hover:cursor-pointer  bg-orange-600 rounded-sm text-xs text-white px-3 hover:bg-orange-700 transition-all active:scale-100"
                  title="Bulk Free"
                >
                  <ParkingCircle className="w-4 h-4 text-white" />
                  My Parking
                </button>
              )}
              <BulkFreeModal
                open={bulkFreeOpen}
                onOpenChange={onCloseBulkFree}
                carParks={carParks}
                selectedCarPark={selectedCarPark}
                currentUser={currentUser}
                userEmail={userEmail}
                onFreed={onRefreshBookings}
              />
              <AdminFreeModal
                open={adminFreeOpen}
                onOpenChange={onCloseAdminFree}
                carParks={carParks}
                onFreed={onRefreshBookings}
              />
              <AvatarMenu
                currentUser={currentUser}
                avatarUrl={avatarUrl}
                userEmail={userEmail}
                onSignOut={onSignOut}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AvatarMenu({
  currentUser,
  avatarUrl,
  userEmail,
  onSignOut,
}: {
  currentUser: string;
  avatarUrl: string;
  userEmail: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer"
      >
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
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">{currentUser}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function AdminDropdown({
  open,
  onToggle,
  onClose,
  onOpenBulkFree,
  onOpenAdminFree,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenBulkFree: () => void;
  onOpenAdminFree: () => void;
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
        <LayoutDashboard className="w-4 h-4 cursor-pointer" />
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
              onOpenAdminFree();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <Car className="w-4 h-4 text-destructive/70" />
            Manage spaces
          </button>
          {/* <button */}
          {/*   onClick={() => { */}
          {/*     onOpenBulkFree(); */}
          {/*     onClose(); */}
          {/*   }} */}
          {/*   className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left" */}
          {/* > */}
          {/*   <Trash2 className="w-4 h-4 text-destructive/70" /> */}
          {/*   Bulk Free */}
          {/* </button> */}
        </div>
      )}
    </div>
  );
}
