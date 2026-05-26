'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import type { BorrowRecord } from '@/lib/parking-data';
import { formatDate } from '@/lib/parking-data';
import { History, ArrowRightFromLine } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface BorrowHistoryProps {
  carParkId: string;
  carParkName: string;
  selectedDate: Date;
}

export function BorrowHistory({ carParkId, carParkName, selectedDate }: BorrowHistoryProps) {
  const { data: allHistory = [], isLoading } = useSWR<BorrowRecord[]>('/api/history', fetcher);
  const dateStr = formatDate(selectedDate);

  const filtered = useMemo(
    () => allHistory.filter((h) => h.carParkId === carParkId && h.date === dateStr),
    [allHistory, carParkId, dateStr]
  );

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
  if (filtered.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Borrow History</h3>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {filtered.map((e) => (
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
  );
}
