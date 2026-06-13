"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export function NotificationBanner() {
  const { data, error } = useSWR<{ title: string; description: string } | null>(
    "/api/notification",
    fetcher,
    { dedupingInterval: 0, revalidateOnFocus: true },
  );

  if (error) {
    console.error("Notification banner error:", error);
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-red-500/10 to-red-700/10 border border-primary/20 text-left w-full"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-4 -right-4 text-4xl opacity-20">📢</div>
        {/* <div className="absolute bottom-2 left-4 text-2xl opacity-15">💬</div> */}
      </div>
      <div className="relative flex items-center gap-4 px-5 py-4">
        {/* <div className="relative shrink-0"> */}
        {/*   <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/30"> */}
        {/*     <Megaphone className="w-6 h-6 text-primary" /> */}
        {/*   </div> */}
        {/* </div> */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-foreground">
            {data.title}
          </span>
          <p className="text-sm text-foreground mt-0.5">{data.description}</p>
        </div>
        <div className="shrink-0 text-3xl opacity-30 hidden sm:block">📢</div>
      </div>
    </motion.div>
  );
}
