"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Megaphone, Loader2, CalendarDays } from "lucide-react";

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (ref.current) {
      ref.current.focus();
      try { ref.current.showPicker(); } catch { /* noop */ }
    }
  };

  return (
    <div
      onClick={openPicker}
      className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background cursor-pointer overflow-hidden hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0 px-2">
        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent border-none text-sm cursor-pointer focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>
    </div>
  );
}

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function NotificationModal({
  open,
  onOpenChange,
  onRefresh,
}: NotificationModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setEnd("");
      setError("");
      fetch("/api/notification")
        .then((r) => r.json())
        .then((data) => {
          if (data && data.title) {
            setTitle(data.title);
            setDescription(data.description || "");
            setEnd(data.end || "");
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!end) {
      setError("End date is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          end,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to save");
      }
      onRefresh();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/notification", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to clear");
      }
      onRefresh();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Notification
          </DialogTitle>
          <DialogDescription>
            Set a banner notification that appears at the top of the page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Maintenance Notice"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The car park will be closed on June 20th for resurfacing."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              End date *
            </label>
            <DatePicker
              value={end}
              onChange={setEnd}
              placeholder="Select end date"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The notification will be hidden automatically after this date.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          {end && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || deleting}
            size="sm"
            className="cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
