import type { ProjectStatus, SiteStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const siteTone: Record<SiteStatus, string> = {
  available: "bg-success-100 text-success-600",
  reserved: "bg-info-100 text-info-600",
  booked: "bg-warning-100 text-warning-600",
  sold: "bg-danger-100 text-danger-600",
};

const projectTone: Record<ProjectStatus, string> = {
  upcoming: "bg-info-100 text-info-600",
  ongoing: "bg-success-100 text-success-600",
  completed: "bg-olive-100 text-olive-700",
  sold_out: "bg-danger-100 text-danger-600",
};

const siteDot: Record<SiteStatus, string> = {
  available: "bg-success-600",
  reserved: "bg-info-600",
  booked: "bg-warning-600",
  sold: "bg-danger-600",
};

export function SiteStatusBadge({ status, label, className }: { status: SiteStatus; label: string; className?: string }) {
  return (
    <span className={cn("badge", siteTone[status], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", siteDot[status])} aria-hidden="true" />
      {label}
    </span>
  );
}

export function ProjectStatusBadge({ status, label, className }: { status: ProjectStatus; label: string; className?: string }) {
  return <span className={cn("badge", projectTone[status], className)}>{label}</span>;
}
