"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Medal, ThumbsUp, Loader2, Search, Check, Vote, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoteSubmitted?: () => void;
}

type Step = "loading" | "voting" | "voted" | "already-voted" | "error" | "self-vote";

export function VoteModal({ open, onOpenChange, onVoteSubmitted }: VoteModalProps) {
  const [step, setStep] = useState<Step>("loading");
  const [candidates, setCandidates] = useState<string[]>([]);
  const [voterName, setVoterName] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchState = useCallback(async () => {
    setStep("loading");
    try {
      const res = await fetch("/api/vote");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      setVoterName(data.voterName ?? null);
      if (data.alreadyVoted) {
        setVotedFor(data.votedFor);
        setStep("already-voted");
      } else {
        setStep("voting");
      }
    } catch {
      setStep("error");
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setSearchQuery("");
      fetchState();
    }
  }, [open, fetchState]);

  function handleSelect(name: string) {
    if (name === voterName) {
      setStep("self-vote");
      return;
    }
    setSelected(name);
  }

  async function handleSubmit() {
    if (!selected) return;
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votedFor: selected }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409) {
          setVotedFor(err.votedFor ?? selected);
          setStep("already-voted");
          return;
        }
        if (res.status === 422) {
          setStep("self-vote");
          return;
        }
        throw new Error(err.error || "Failed");
      }
      setStep("voted");
      onVoteSubmitted?.();
    } catch {
      setStep("error");
    }
  }

  const filteredCandidates = candidates.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-orange-500" />
            Vote for Employee of the Month
          </DialogTitle>
          <DialogDescription>
            {step === "already-voted"
              ? `You voted for ${votedFor}.`
              : step === "voted"
                ? "Your vote has been recorded."
                : step === "error"
                  ? "Something went wrong."
                  : step === "self-vote"
                    ? "That's a bold strategy, Cotton."
                    : "Choose your nominee for this month."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[280px]">
          {step === "loading" && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-muted-foreground">
                Could not load voter information.
              </p>
              <button
                onClick={fetchState}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {step === "already-voted" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                You already cast your vote for{" "}
                <span className="font-semibold text-foreground">{votedFor}</span>
                .
              </p>
            </div>
          )}

          {step === "voted" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                <ThumbsUp className="w-7 h-7 text-orange-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Your vote for{" "}
                <span className="font-semibold text-foreground">{selected}</span>{" "}
                has been submitted.
              </p>
            </div>
          )}

          {step === "self-vote" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Ban className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Voting for yourself? That&apos;s like giving yourself a high five
                — nice try though!
              </p>
              <button
                onClick={() => setStep("voting")}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Pick someone else
              </button>
            </div>
          )}

          {step === "voting" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team members..."
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="max-h-[260px] overflow-y-auto space-y-0.5 -mx-1 px-1">
                {filteredCandidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No matches found.
                  </p>
                ) : (
                  filteredCandidates.map((name) => {
                    const isSelf = name === voterName;
                    return (
                      <button
                        key={name}
                        onClick={() => handleSelect(name)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all cursor-pointer",
                          selected === name && !isSelf
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : isSelf
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-muted text-foreground",
                        )}
                        disabled={isSelf}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            selected === name && !isSelf
                              ? "bg-primary text-primary-foreground"
                              : isSelf
                                ? "bg-muted text-muted-foreground"
                                : "bg-muted-foreground/10 text-muted-foreground",
                          )}
                        >
                          {name.charAt(0)}
                        </div>
                        <span className="truncate">{name}</span>
                        {isSelf && (
                          <span className="ml-auto text-[10px] font-medium text-muted-foreground/50 shrink-0">
                            That&apos;s you
                          </span>
                        )}
                        {selected === name && !isSelf && (
                          <Vote className="w-4 h-4 ml-auto shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {(step === "voting" || step === "already-voted" || step === "error" || step === "self-vote") && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            {step === "voting" && (
              <>
                <button
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer",
                    selected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Vote
                </button>
              </>
            )}
            {(step === "already-voted" || step === "error" || step === "self-vote") && (
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        )}

        {step === "voted" && (
          <div className="flex items-center justify-end pt-2 border-t border-border">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
