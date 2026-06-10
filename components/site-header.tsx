"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "./app-header";
import type { CarPark } from "@/lib/parking-data";

export function SiteHeader() {
  const [currentUser, setCurrentUser] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const email = user.email || user.user_metadata?.email || "";
        setCurrentUser(
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        );
        setUserEmail(email);
        setAvatarUrl(user.user_metadata?.avatar_url || "");
      }
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabaseRef.current.auth.signOut();
    window.location.href = "/auth";
  }, []);

  return (
    <AppHeader
      currentUser={currentUser}
      avatarUrl={avatarUrl}
      userEmail={userEmail}
      adminMenuOpen={adminMenuOpen}
      onToggleAdminMenu={() => setAdminMenuOpen((v) => !v)}
      onCloseAdminMenu={() => setAdminMenuOpen(false)}
      bulkFreeOpen={false}
      onOpenBulkFree={() => {}}
      onCloseBulkFree={() => {}}
      adminFreeOpen={false}
      onOpenAdminFree={() => {}}
      onCloseAdminFree={() => {}}
      carParks={[]}
      selectedCarPark={{} as CarPark}
      onRefreshBookings={() => {}}
      onSignOut={handleSignOut}
      currentYear={new Date().getFullYear()}
      isRegular={false}
    />
  );
}
