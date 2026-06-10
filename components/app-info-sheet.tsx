import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Car, MapPin, CalendarDays, History, StickyNote, Info } from "lucide-react";
import { SheetMenuItem } from "./sheet-menu-item";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 py-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="px-4 pt-4 mt-2 border-t border-border space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">SlimSpot</div>
          <div className="text-xs text-muted-foreground">
            Daily parking reservations
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppInfoSheet() {
  return (
    <SheetContent side="right" className="flex flex-col">
      <SheetHeader>
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>
          Quick access to app sections
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-4">
        <NavSection label="Main">
          <SheetMenuItem
            icon={CalendarDays}
            label="Calendar"
            description="Browse dates and availability"
            onClick={() => scrollTo("calendar")}
          />
          <SheetMenuItem
            icon={Car}
            label="Parking Lot"
            description="View and manage parking spaces"
            onClick={() => scrollTo("parking-lot")}
          />
          <SheetMenuItem
            icon={MapPin}
            label="Map View"
            description="See car park locations"
            onClick={() => scrollTo("map-view")}
          />
        </NavSection>
        <NavSection label="Information">
          <SheetMenuItem
            icon={History}
            label="History"
            description="Browse borrow and free activity"
            onClick={() => scrollTo("history")}
          />
          <SheetMenuItem
            icon={StickyNote}
            label="Notes"
            description="Daily team notes"
            onClick={() => scrollTo("notes")}
          />
        </NavSection>
        <AboutSection />
      </div>
    </SheetContent>
  );
}
