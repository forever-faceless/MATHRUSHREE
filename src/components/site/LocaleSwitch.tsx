"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { otherLocale, switchLocalePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleSwitch({ locale, label, className }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname() || `/${locale}`;
  const target = otherLocale(locale);
  const href = switchLocalePath(pathname, target);
  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold-300/30 px-3 py-1.5 text-[13px] font-semibold text-gold-200 transition hover:border-gold-300 hover:bg-gold-300/10",
        className,
      )}
    >
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
