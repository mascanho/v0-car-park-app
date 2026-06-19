"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type { BorrowRecord } from "@/lib/parking-data";
import { formatDate } from "@/lib/parking-data";
import {
  History,
  CircleMinus,
  CircleCheck,
  ShieldCheck,
  Repeat2,
  Users,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface BorrowHistoryProps {
  carParkId: string;
  carParkName: string;
  selectedDate: Date;
}

function toName(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SpaceBadge({ id }: { id: string }) {
  return (
    <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
      #{id}
    </span>
  );
}

function N({ v }: { v: string }) {
  return <span className="font-medium text-foreground">{toName(v)}</span>;
}

function M({ children }: { children: string }) {
  return <span className="text-muted-foreground">{children}</span>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toTimestamp(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return { date, time };
}

function Timestamp({ iso }: { iso: string }) {
  const { date, time } = toTimestamp(iso);
  return (
    <div className="ml-auto flex flex-col items-end shrink-0 tabular-nums leading-none gap-0.5">
      <span className="text-[9px] text-muted-foreground/35">{date}</span>
      <span className="text-[10px] text-muted-foreground/40">{time}</span>
    </div>
  );
}

function buildTooltip(e: BorrowRecord, carParkName: string): string {
  const by = e.borrowedBy?.trim() ?? "";
  const { date, time } = toTimestamp(e.borrowedAt);
  const when = `${date} at ${time}`;
  const space = `space #${e.spaceId}`;

  const isBulkFreed = by === "[BULK FREED]";
  const isFreed = !isBulkFreed && by.endsWith("[FREED]");
  const isNew = e.originalOwner === "[NEW]";
  const isAllocated = isNew && !!e.allocatedBy;
  const isSelfBooked = isNew && !e.allocatedBy;
  const isReAllocated = !isNew && !isFreed && !isBulkFreed && !!e.allocatedBy;

  if (isBulkFreed) {
    const actor = e.allocatedBy ? toName(e.allocatedBy) : "Someone";
    return `${actor} freed ${toName(e.originalOwner)}'s ${space} at ${carParkName} on ${when}`;
  }
  if (isFreed) {
    const actor = toName(by.replace(/\s*\[FREED\]$/, ""));
    return `${actor} freed ${toName(e.originalOwner)}'s ${space} at ${carParkName} on ${when}`;
  }
  if (isAllocated) {
    return `${toName(e.allocatedBy!)} allocated ${space} to ${toName(by)} at ${carParkName} on ${when}`;
  }
  if (isSelfBooked) {
    return `${toName(by)} booked ${space} at ${carParkName} on ${when}`;
  }
  if (isReAllocated) {
    return `${toName(e.allocatedBy!)} moved ${space} from ${toName(e.originalOwner)} to ${toName(by)} at ${carParkName} on ${when}`;
  }
  return `${toName(by)} borrowed ${space} from ${toName(e.originalOwner)} at ${carParkName} on ${when}`;
}

export function BorrowHistory({ carParkId, carParkName, selectedDate }: BorrowHistoryProps) {
  const { data: allHistory = [], isLoading } = useSWR<BorrowRecord[]>(
    "/api/history",
    fetcher,
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
        {filtered.map((e) => {
          const by = e.borrowedBy?.trim() ?? "";

          const isBulkFreed = by === "[BULK FREED]";
          const isFreed = !isBulkFreed && by.endsWith("[FREED]");
          const isNew = e.originalOwner === "[NEW]";
          const isAllocated  = isNew && !!e.allocatedBy;
          const isSelfBooked = isNew && !e.allocatedBy;
          const isReAllocated = !isNew && !isFreed && !isBulkFreed && !!e.allocatedBy;
          const isBorrow = !isFreed && !isBulkFreed && !isNew && !isReAllocated;

          const tooltip = buildTooltip(e, carParkName);

          return (
            <Tooltip key={e.id ?? `${e.spaceId}-${e.date}-${e.borrowedAt}`}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2.5 cursor-default">
                  {/* ── Bulk freed ── */}
                  {isBulkFreed && (
                    <>
                      <CircleMinus className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <SpaceBadge id={e.spaceId} />
                      <p className="text-xs">
                        {e.allocatedBy ? (
                          <>
                            <N v={e.allocatedBy} />
                            <M> freed </M>
                            <N v={e.originalOwner} />
                          </>
                        ) : (
                          <>
                            <M>Freed </M>
                            <N v={e.originalOwner} />
                          </>
                        )}
                      </p>
                      <Timestamp iso={e.borrowedAt} />
                    </>
                  )}

                  {/* ── Single freed ── */}
                  {isFreed && (
                    <>
                      <CircleMinus className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <SpaceBadge id={e.spaceId} />
                      <p className="text-xs">
                        <N v={by.replace(/\s*\[FREED\]$/, "")} />
                        <M> freed </M>
                        <N v={e.originalOwner} />
                      </p>
                      <Timestamp iso={e.borrowedAt} />
                    </>
                  )}

                  {/* ── Admin allocated (new booking) ── */}
                  {isAllocated && (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                      <SpaceBadge id={e.spaceId} />
                      <p className="text-xs">
                        <N v={e.allocatedBy!} />
                        <M> allocated to </M>
                        <N v={by} />
                      </p>
                      <Timestamp iso={e.borrowedAt} />
                    </>
                  )}

                  {/* ── Self booked ── */}
                  {isSelfBooked && (
                    <>
                      <CircleCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                      <SpaceBadge id={e.spaceId} />
                      <p className="text-xs">
                        <M>Booked by </M>
                        <N v={by} />
                      </p>
                      <Timestamp iso={e.borrowedAt} />
                    </>
                  )}

                  {/* ── Re-allocated ── */}
                  {isReAllocated && (
                    <>
                      <Repeat2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <SpaceBadge id={e.spaceId} />
                      <p className="text-xs">
                        <N v={e.allocatedBy!} />
                        <M> moved </M>
                        <N v={e.originalOwner} />
                        <M> → </M>
                        <N v={by} />
                      </p>
                      <Timestamp iso={e.borrowedAt} />
                    </>
                  )}

                  {/* ── Borrow ── */}
                  {isBorrow && (
                    <>
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <SpaceBadge id={e.spaceId} />
                      <p className="text-xs">
                        <N v={by} />
                        <M> borrowed from </M>
                        <N v={e.originalOwner} />
                      </p>
                      <Timestamp iso={e.borrowedAt} />
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-center text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
