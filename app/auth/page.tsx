"use client";

import { createClient } from "@/lib/supabase/client";
import { Car, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-blue-100 via-blue-400 to-blue-900 dark:from-blue-950 dark:via-background dark:to-blue-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-lg shadow-primary/5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
              <Car className="w-9 h-9 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              SlimSpot
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to book your parking space
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  SlimStock email required
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                  You must sign in with your{" "}
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    @slimstock.com
                  </span>{" "}
                  Google account. Make sure your SlimStock email is connected to
                  Gmail before signing in.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-background  border border-border hover:border-primary/30 rounded-xl transition-all duration-200 text-foreground font-medium disabled:opacity-50 shadow-sm hover:shadow-md hover:cursor-pointer  active:scale-[0.98] hover:bg-orange-400 hover:text-white"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <Info className="w-3.5 h-3.5" />
            <span>Only @slimstock.com accounts are allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
