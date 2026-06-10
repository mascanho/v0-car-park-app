import { type LucideIcon } from "lucide-react";
import { SheetClose } from "./ui/sheet";

interface SheetMenuItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
}

export function SheetMenuItem({
  icon: Icon,
  label,
  description,
  href,
  onClick,
}: SheetMenuItemProps) {
  const content = (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {description}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <SheetClose asChild>
        <a href={href}>{content}</a>
      </SheetClose>
    );
  }

  return (
    <SheetClose asChild>
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    </SheetClose>
  );
}
