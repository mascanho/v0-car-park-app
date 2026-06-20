"use client";

import { createClient } from "@/lib/supabase/client";
import { Info, XCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "invalid_domain") {
      setError("Access denied. Only @slimstock.com accounts are allowed.");
    } else if (err === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.endsWith("@slimstock.com")) {
      setError("Only @slimstock.com email addresses are allowed.");
      return;
    }

    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message,
      );
      setIsLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email?.endsWith("@slimstock.com")) {
      await supabase.auth.signOut();
      setError("Access denied. Only @slimstock.com accounts are allowed.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/";
  };

  const passwordValid =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!email.endsWith("@slimstock.com")) {
      setError("Only @slimstock.com email addresses are allowed.");
      return;
    }

    if (!passwordValid) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
      );
      return;
    }

    setIsLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccess("Your account has been created with" + email + ".");
    setIsLoading(false);
    setPassword("");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const isSignUp = mode === "signup";

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
                <div className="relative w-full h-full rounded-2xl flex items-center justify-center shadow-blue-500/25">
                  <img src="apple-icon.png" className="w-full h-full" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Slimspot
              </h1>
              <p className="text-sm text-blue-200/70 mt-2 font-light tracking-wide">
                {isSignUp
                  ? "Create your account."
                  : "Car Park Manager for Slimstock."}
              </p>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-500/30 rounded-xl p-4 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400/90 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-950 border border-green-500/30 rounded-xl p-4 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-green-400/90 leading-relaxed">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Email/password form */}
            <form
              onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn}
              className="space-y-3 mb-4"
            >
              {isSignUp && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  placeholder="name@slimstock.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isSignUp && password.length > 0 && (
                <ul className="text-[11px] space-y-0.5 px-1">
                  {[
                    [/[a-z]/.test(password), "Lowercase letter"],
                    [/[A-Z]/.test(password), "Uppercase letter"],
                    [/[0-9]/.test(password), "Number"],
                    [
                      /[^a-zA-Z0-9]/.test(password),
                      "Special character (!@#$...)",
                    ],
                    [password.length >= 8, "At least 8 characters"],
                  ].map(([met, label]) => (
                    <li
                      key={label as string}
                      className={`flex items-center gap-1.5 ${met ? "text-green-400/80" : "text-white/30"}`}
                    >
                      <span>{met ? "✓" : "·"}</span>
                      {label as string}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isGoogleLoading ||
                  (isSignUp &&
                    (!passwordValid || !firstName.trim() || !lastName.trim()))
                }
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-xl text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </span>
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Sign in with Email"
                )}
              </button>
            </form>

            {/* Mode toggle */}
            <p className="text-center text-xs text-white/40 mb-4">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => switchMode("signin")}
                    className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  No account yet?{" "}
                  <button
                    onClick={() => switchMode("signup")}
                    className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                  >
                    Create one
                  </button>
                </>
              )}
            </p>

            {/* Divider */}
            <div className="relative my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 tracking-wider uppercase">
                or
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-xl transition-all duration-300 text-gray-800 font-medium text-sm disabled:opacity-50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 active:scale-[0.98] cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isGoogleLoading ? (
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
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-white/30 mt-6">
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
