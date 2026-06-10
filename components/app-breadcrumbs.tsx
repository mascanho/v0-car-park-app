import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./ui/breadcrumb";

interface Crumb {
  label: string;
  href?: string;
}

interface AppBreadcrumbsProps {
  segments: Crumb[];
}

export function AppBreadcrumbs({ segments }: AppBreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, i) => (
          <BreadcrumbItem key={seg.label}>
            <BreadcrumbSeparator />
            {i === segments.length - 1 || !seg.href ? (
              <BreadcrumbPage>{seg.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={seg.href}>{seg.label}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
