import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ items, tone = "light", className }: { items: { href?: string; label: string }[]; tone?: "light" | "dark"; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[13px]", tone === "dark" ? "text-gold-100/60" : "text-ink-500", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" /> : null}
            {item.href ? (
              <Link href={item.href} className={cn("hover:underline", tone === "dark" ? "hover:text-gold-200" : "hover:text-olive-900")}>
                {item.label}
              </Link>
            ) : (
              <span className={tone === "dark" ? "text-gold-200" : "text-olive-900"} aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
