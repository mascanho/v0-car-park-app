"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";
import type { CarPark } from "@/lib/parking-data";
import { Cake, Car, ShieldCheck, ShieldX } from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  car_park: string | null;
  is_regular: boolean | null;
  birthday: string | null;
}

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then(setMembers)
      .catch(() => {});
  }, []);

  const carParks = [...new Set(members.map((m) => m.car_park).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        currentUser="Team"
        avatarUrl=""
        userEmail=""
        adminMenuOpen={false}
        onToggleAdminMenu={() => {}}
        onCloseAdminMenu={() => {}}
        bulkFreeOpen={false}
        onOpenBulkFree={() => {}}
        onCloseBulkFree={() => {}}
        adminFreeOpen={false}
        onOpenAdminFree={() => {}}
        onCloseAdminFree={() => {}}
        carParks={[] as CarPark[]}
        selectedCarPark={{} as CarPark}
        onRefreshBookings={() => {}}
        onSignOut={async () => {}}
        currentYear={new Date().getFullYear()}
        isRegular={false}
      />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} members across {carParks.length} locations
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.email}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {m.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">
                    {m.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {m.email}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {m.car_park && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Car className="w-3 h-3" />
                        {m.car_park}
                      </span>
                    )}
                    {m.is_regular !== null && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {m.is_regular ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Regular
                          </>
                        ) : (
                          <>
                            <ShieldX className="w-3 h-3 text-muted-foreground" />
                            Non-regular
                          </>
                        )}
                      </span>
                    )}
                    {m.birthday && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Cake className="w-3 h-3" />
                        {new Date(m.birthday).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
