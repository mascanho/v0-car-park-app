import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import {
  Car,
  MapPin,
  History,
  StickyNote,
  Users,
} from "lucide-react";
import { SheetMenuItem } from "./sheet-menu-item";
import { EmployeeOfTheDay } from "./employee-of-the-day";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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

export function AppInfoSheet() {
  return (
    <SheetContent side="right" className="flex flex-col">
      <SheetHeader>
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>Quick access to app sections</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-4 flex flex-col">
        <NavSection label="Main">
          <SheetMenuItem
            icon={Users}
            label="Meet The Team"
            description="View Slimstock's UK team"
            href="/team"
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
        <EmployeeOfTheDay />
      </div>
    </SheetContent>
  );
}
