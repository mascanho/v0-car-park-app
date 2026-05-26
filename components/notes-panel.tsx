'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { Note } from '@/lib/parking-data';
import { formatDate } from '@/lib/parking-data';
import { StickyNote, Plus, X, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface NotesPanelProps {
  carParkId: string;
  selectedDate: Date;
  currentUser: string;
}

export function NotesPanel({ carParkId, selectedDate, currentUser }: NotesPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const dateStr = formatDate(selectedDate);

  const { data: notes = [], isLoading, mutate } = useSWR<Note[]>(
    `/api/notes?carParkId=${carParkId}&date=${dateStr}`,
    fetcher
  );

  const handleSubmit = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carParkId, date: dateStr, message: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage('');
        mutate();
      }
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    mutate();
  };

  const todayNotes = notes.filter((n) => n.noteDate === dateStr);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <StickyNote className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Notes</h3>
      </div>

      <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && todayNotes.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No notes for this day</p>
        )}
        {todayNotes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2 group"
          >
            <span className="text-xs font-semibold text-muted-foreground shrink-0 min-w-[24px]">
              {note.userName.charAt(0).toUpperCase()}
            </span>
            <p className="text-xs text-foreground flex-1">{note.message}</p>
            {note.userName === currentUser && (
              <button
                onClick={() => handleDelete(note.id!)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Leave a note..."
          className="flex-1 text-xs bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleSubmit}
          disabled={!newMessage.trim() || sending}
          className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
