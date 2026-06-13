"use client";

import useSWR from "swr";
import { X, Megaphone } from "lucide-react";
import { useState } from "react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export function NotificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data, error } = useSWR<{ title: string; description: string } | null>(
    "/api/notification",
    fetcher,
    { dedupingInterval: 0, revalidateOnFocus: true },
  );

  if (error) {
    console.error("Notification banner error:", error);
  }

  if (dismissed) return null;

  if (error) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
        <div className="max-w-8xl mx-auto flex items-center gap-2">
          <span className="text-xs text-destructive">
            Notification error: {error.message}
          </span>
          <button onClick={() => setDismissed(true)} className="ml-auto">
            <X className="w-3 h-3 text-destructive" />
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="max-w-8xl mx-auto flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{data.title}</p>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
