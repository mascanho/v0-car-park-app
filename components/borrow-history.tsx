"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type { BorrowRecord } from "@/lib/parking-data";
import { formatDate } from "@/lib/parking-data";
import { History, ArrowRightFromLine, Trash2, CirclePlus } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface BorrowHistoryProps {
  carParkId: string;
  carParkName: string;
  selectedDate: Date;
}

export function BorrowHistory({
  carParkId,
  carParkName,
  selectedDate,
}: BorrowHistoryProps) {
  const { data: allHistory = [], isLoading } = useSWR<BorrowRecord[]>(
    "/api/history",
    fetcher,
    { refreshInterval: 2000 },
  );
  const dateStr = formatDate(selectedDate);

  const filtered = useMemo(
    () =>
      allHistory.filter((h) => h.carParkId === carParkId && h.date === dateStr),
    [allHistory, carParkId, dateStr],
  );

  if (isLoading) return null;
  if (filtered.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Activity History
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1.5 max-h-[26rem] overflow-y-auto">
        {filtered.map((e) => (
          <div
            key={e.id ?? `${e.spaceId}-${e.date}-${e.borrowedAt}`}
            className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg px-3 py-2"
          >
            {e.borrowedBy.endsWith(" [FREED]") ? (
              <>
                <Trash2 className="w-3 h-3 text-destructive shrink-0" />
                <span className="font-mono text-[9px] font-semibold text-muted-foreground min-w-[40px]">
                  #{e.spaceId}
                </span>
                <span className="text-destructive text-[9px]">
                  {e.borrowedBy.replace(" [FREED]", "")} freed
                </span>
              </>
            ) : e.originalOwner === "[NEW]" ? (
              <>
                <CirclePlus className="w-3 h-3 text-accent shrink-0" />
                <span className="font-mono text-[9px] font-semibold text-muted-foreground min-w-[40px]">
                  #{e.spaceId}
                </span>
                {e.allocatedBy ? (
                  <span className="text-[11px]">
                    <span className="text-accent font-medium">
                      {e.allocatedBy}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      allocated to{" "}
                    </span>
                    <span className="text-accent font-medium">
                      {e.borrowedBy}
                    </span>
                  </span>
                ) : (
                  <span className="text-accent text-[9px]">
                    {e.borrowedBy} booked
                  </span>
                )}
              </>
            ) : e.allocatedBy ? (
              <>
                <ArrowRightFromLine className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                <span className="font-mono text-xs font-semibold text-muted-foreground min-w-[40px]">
                  #{e.spaceId}
                </span>
                <span className="text-[11px]">
                  <span className="font-medium text-foreground">
                    {e.allocatedBy}
                  </span>
                  <span className="text-muted-foreground"> re-allocated </span>
                  <span className="text-muted-foreground">
                    {e.originalOwner} {""}
                  </span>
                  <ArrowRightFromLine className="w-3 h-3 text-muted-foreground/30 shrink-0 inline" />
                  <span className="font-medium text-foreground">
                    {""} {e.borrowedBy}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-xs font-semibold text-muted-foreground min-w-[40px]">
                  #{e.spaceId}
                </span>
                <span className="text-muted-foreground">{e.originalOwner}</span>
                <ArrowRightFromLine className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                <span className="font-medium text-foreground">
                  {e.borrowedBy}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
