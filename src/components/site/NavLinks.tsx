"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./SiteHeader";

export function NavLinks({ items, onNavigate, vertical = false }: { items: NavItem[]; onNavigate?: () => void; vertical?: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              vertical
                ? "block rounded-xl px-4 py-3 text-lg font-medium text-gold-100 transition hover:bg-gold-300/10"
                : "rounded-full px-3.5 py-2 text-[14px] font-medium text-gold-100/85 transition hover:bg-gold-300/10 hover:text-gold-200",
              active && (vertical ? "bg-gold-300/10 text-gold-300" : "bg-gold-300/12 text-gold-300"),
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
