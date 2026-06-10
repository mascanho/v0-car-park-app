"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "./site-header";
import { AppFooter } from "./app-footer";
import {
  Cake,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Quote,
} from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  car_park: string | null;
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
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

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {m.photo && !imgErr ? (
            <img
              src={m.photo}
              alt={m.name}
              onError={() => setImgErr(true)}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
              <span className="text-lg font-bold text-primary">
                {m.name.charAt(0)}
              </span>
            </div>
          )}
          {m.is_regular && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-card">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground truncate">{m.name}</div>
          {m.role && (
            <div className="text-xs text-muted-foreground truncate">{m.role}</div>
          )}
          {m.car_park && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{m.car_park}</span>
            </div>
          )}
          {m.bio && (
            <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground/70 leading-relaxed">
              <Quote className="w-3 h-3 shrink-0 mt-0.5" />
              <p className="line-clamp-2">{m.bio}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
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
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
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
