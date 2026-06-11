"use client";

import { createClient } from "@/lib/supabase/client";
import { Car, AlertTriangle, Info, XCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "invalid_domain") {
      setError("Access denied. Only @slimstock.com accounts are allowed.");
    }
  }, []);

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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: "5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-2xl blur-xl opacity-20" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50" />
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Car className="w-9 h-9 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Slimspot
              </h1>
              <p className="text-sm text-blue-200/70 mt-2 font-light tracking-wide">
                Car Park Manager. And more...
              </p>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-500/30 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-red-400/80 leading-relaxed">
                      {error}
                    </p>
                    <a
                      href="https://support.google.com/mail/answer/6304825?hl=en-GB&co=GENIE.Platform%3DDesktop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 mt-1 transition-colors"
                    >
                      Learn how to add your SlimStock email to Gmail
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-950 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a
                    href="https://support.google.com/mail/answer/6304825?hl=en-GB&co=GENIE.Platform%3DDesktop"
                    target="_blank"
                    className="flex"
                  >
                    <p className="text-sm font-semibold text-amber-300 underline">
                      Gmail account required
                    </p>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 text-amber-400 shrink-0 mt-0.5" />
                  </a>
                  <p className="text-[10px] text-amber-400/70 leading-relaxed">
                    You must have Gmail linked with your{" "}
                    <span className="font-medium text-amber-300">
                      @slimstock.com
                    </span>{" "}
                    account to manage your parking spots.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-xl transition-all duration-300 text-gray-800 font-medium disabled:opacity-50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 active:scale-[0.98] cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isLoading ? (
                <span className="relative w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="relative w-5 h-5" viewBox="0 0 24 24">
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
              <span className="relative">
                {isLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-transparent text-white/30 tracking-wider uppercase">
                  Authorised Access Only
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-white/30">
              <Info className="w-3.5 h-3.5" />
              <span>Only @slimstock.com accounts are allowed</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/15 mt-6 tracking-wide">
          &copy; {new Date().getFullYear()} Slimstock. All rights reserved.
        </p>
      </div>
    </div>
  );
}
