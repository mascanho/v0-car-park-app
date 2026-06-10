"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "./site-header";
import { AppFooter } from "./app-footer";
import {
  Cake,
  MapPin,
  ParkingCircle,
  ExternalLink,
  ShieldCheck,
  Quote,
  Copy,
} from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  car_park: string | null;
  car_space: string | null;
  is_regular: boolean | null;
  birthday: string | null;
  photo: string | null;
  bio: string | null;
  website: string | null;
  role: string | null;
}

function BirthdayBadge({ birthday }: { birthday: string | null }) {
  if (!birthday) return null;
  const today = new Date();
  const bd = new Date(birthday);
  const isToday =
    bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-xs font-medium leading-none ${
        isToday
          ? "bg-pink-100 text-pink-700 ring-1 ring-pink-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Cake className="w-3 h-3" />
      {new Date(birthday).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })}
      {isToday && <span className="animate-pulse">🎉</span>}
    </span>
  );
}

function MemberCard({ m }: { m: TeamMember }) {
  const [imgErr, setImgErr] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const isLongBio = (m.bio?.length ?? 0) > 120;

  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group flex flex-col">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-accent/5 blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/10" />

      <div className="relative p-6 flex flex-col h-full">
        {/* Avatar + Name row */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {m.photo && !imgErr ? (
              <img
                src={m.photo}
                alt={m.name}
                onError={() => setImgErr(true)}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center ring-2 ring-border group-hover:ring-primary/30 transition-all">
                <span className="text-xl font-bold text-primary">
                  {m.name.charAt(0)}
                </span>
              </div>
            )}
            {m.is_regular && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-card">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-base font-bold text-foreground truncate leading-tight">
              {m.name}
            </h3>
            {m.role && (
              <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
                {m.role}
              </p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1 truncate">
              <span className="truncate">{m.email}</span>
              <button
                onClick={() => navigator.clipboard.writeText(m.email)}
                className="shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
                title="Copy email"
              >
                <Copy className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        {/* Bio with read more */}
        {m.bio ? (
          <div className="mt-3 flex-1">
            <div className="flex items-start gap-2 text-xs text-muted-foreground/80 leading-relaxed">
              <Quote className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground/40" />
              <div>
                <p className={!bioExpanded ? "line-clamp-2" : ""}>{m.bio}</p>
                {isLongBio && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="text-xs font-medium text-primary hover:text-primary/80 mt-1 transition-colors"
                  >
                    {bioExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/50">
          {(m.car_park || m.car_space) && (
            <span className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full bg-muted/50 text-[10px] font-medium leading-none text-muted-foreground/60">
              <ParkingCircle className="w-3 h-3 opacity-50 shrink-0" />
              {m.car_space && (
                <span className="tabular-nums">#{m.car_space}</span>
              )}
              {m.car_park && (
                <span className="truncate max-w-24 capitalize">{m.car_park}</span>
              )}
            </span>
          )}
          <BirthdayBadge birthday={m.birthday} />
          {m.website && (
            <a
              href={
                m.website.startsWith("http")
                  ? m.website
                  : `https://${m.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-xs font-medium leading-none text-primary hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {new URL(
                m.website.startsWith("http")
                  ? m.website
                  : `https://${m.website}`,
              ).hostname.replace("www.", "")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => {});
  }, []);

  const carParks = [
    ...new Set(members.map((m) => m.car_park).filter(Boolean)),
  ].sort();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Meet the Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} across{" "}
            {carParks.length} location{carParks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <MemberCard key={m.email} m={m} />
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
