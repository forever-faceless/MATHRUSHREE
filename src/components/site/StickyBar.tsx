"use client";

import { MessageSquareText, Phone } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n";
import { telHref, whatsappHref } from "@/lib/utils";
import { WhatsAppIcon } from "./PhoneLinks";

export function StickyBar({
  locale,
  phone,
  whatsapp,
  whatsappText,
  labels,
}: {
  locale: Locale;
  phone: string;
  whatsapp: string;
  whatsappText: string;
  labels: { call: string; whatsapp: string; enquire: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  if (!phone && !whatsapp) return null;

  const onEnquire = () => {
    const target = document.getElementById("enquire");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => target.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }), 500);
    } else {
      router.push(localePath(locale, "/enquire"));
    }
  };

  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-300/15 bg-olive-900/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-3 divide-x divide-gold-300/10">
        {phone ? (
          <a href={telHref(phone)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-gold-200">
            <Phone className="h-5 w-5" />
            {labels.call}
          </a>
        ) : null}
        {whatsapp ? (
          <a href={whatsappHref(whatsapp, whatsappText)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-gold-200">
            <WhatsAppIcon className="h-5 w-5" />
            {labels.whatsapp}
          </a>
        ) : null}
        <button type="button" onClick={onEnquire} className="flex flex-col items-center gap-1 bg-gold-500 py-2.5 text-[11px] font-semibold text-olive-900">
          <MessageSquareText className="h-5 w-5" />
          {labels.enquire}
        </button>
      </div>
    </div>
  );
}
