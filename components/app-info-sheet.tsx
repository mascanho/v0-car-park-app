import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Info } from "lucide-react";

export function AppInfoSheet() {
  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>SlimSpot</SheetTitle>
        <SheetDescription>
          Daily parking reservations
        </SheetDescription>
      </SheetHeader>
      <div className="px-4 space-y-4 text-sm text-muted-foreground">
        <p>
          Manage your team's parking spaces. Book, cancel, re-allocate, and
          keep track of daily parking usage across multiple locations.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Info className="w-3 h-3" />
          <span>v1.0.0</span>
        </div>
      </div>
    </SheetContent>
  );
}
