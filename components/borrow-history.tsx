'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import type { BorrowRecord } from '@/lib/parking-data';
import { History, ArrowRightFromLine } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface BorrowHistoryProps {
  carParkId: string;
  carParkName: string;
}

export function BorrowHistory({ carParkId, carParkName }: BorrowHistoryProps) {
  const { data: allHistory = [], isLoading } = useSWR<BorrowRecord[]>('/api/history', fetcher);

  const filtered = useMemo(() => allHistory.filter((h) => h.carParkId === carParkId), [allHistory, carParkId]);

  const grouped = useMemo(() => {
    const map: Record<string, BorrowRecord[]> = {};
    for (const entry of filtered) {
      const d = entry.date;
      if (!map[d]) map[d] = [];
      map[d].push(entry);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  if (isLoading) return null;
  if (grouped.length === 0) return null;

  const total = filtered.length;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Borrow History — {carParkName}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{total} event{total !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {grouped.map(([date, entries]) => (
          <div key={date}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{date}</p>
            <div className="space-y-1.5">
              {entries.map((e) => (
                <div
                  key={e.id ?? `${e.spaceId}-${e.date}-${e.borrowedAt}`}
                  className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2"
                >
                  <span className="font-mono text-xs font-semibold text-muted-foreground min-w-[40px]">
                    #{e.spaceId}
                  </span>
                  <span className="text-muted-foreground">{e.originalOwner}</span>
                  <ArrowRightFromLine className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                  <span className="font-medium text-foreground">{e.borrowedBy}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
