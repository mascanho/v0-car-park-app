import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Car, MapPin, History, StickyNote, Users, Medal } from "lucide-react";
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
    <SheetContent
      side="right"
      className="flex flex-col w-full sm:max-w-[26.4rem]"
    >
      <SheetHeader>
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>Quick access to app sections</SheetDescription>
        <hr className="border-t border-border mt-2 -mb-4" />
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-4 flex flex-col">
        <NavSection label="Main">
          <SheetMenuItem
            icon={Users}
            label="Home"
            description="Go to the homepage"
            href="/"
          />
          <SheetMenuItem
            icon={Users}
            label="Meet The Team"
            description="View Slimstock's UK team"
            href="/team"
          />
          <SheetMenuItem
            icon={Car}
            label="Slimstock Website"
            description="Go to the Slimstock website"
            // onClick={() => scrollTo("parking-lot")}
            href="https://www.slimstock.com/"
          />
          <SheetMenuItem
            icon={MapPin}
            label="SCP Club"
            description="Go to the SCP Club"
            // onClick={() => scrollTo("map-view")}
            href="https://www.scpclub.com/"
          />
        </NavSection>
        {/* <NavSection label="Roster"> */}
        {/* <SheetMenuItem */}
        {/* <SheetMenuItem */}
        {/*   icon={Medal} */}
        {/*   label="Employee of the Month" */}
        {/*   description="This year's EOM roll of honour" */}
        {/*   href="/employee-of-the-month" */}
        {/* /> */}
        {/*   icon={History} */}
        {/*   label="History" */}
        {/*   description="Browse borrow and free activity" */}
        {/*   onClick={() => scrollTo("history")} */}
        {/* /> */}
        {/* <SheetMenuItem */}
        {/*   icon={StickyNote} */}
        {/*   label="Notes" */}
        {/*   description="Daily team notes" */}
        {/*   onClick={() => scrollTo("notes")} */}
        {/* /> */}
        {/* </NavSection> */}
        {/* <hr className="border-t border-border" /> */}
        {/* <EmployeeOfTheDay /> */}
      </div>
    </SheetContent>
  );
}
