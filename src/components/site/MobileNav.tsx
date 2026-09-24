"use client";

import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPhoneDisplay, telHref } from "@/lib/utils";
import { NavLinks } from "./NavLinks";
import type { NavItem } from "./SiteHeader";

export function MobileNav({
  items,
  phone,
  labels,
}: {
  items: NavItem[];
  phone: string;
  labels: { menu: string; close: string; call: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gold-200 transition hover:bg-gold-300/10"
        aria-label={labels.menu}
        aria-expanded={open}
      >
        <Menu className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-olive-950/60 backdrop-blur-sm" aria-label={labels.close} onClick={() => setOpen(false)} />
          <div className="surface-dark absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col border-l border-gold-300/10 shadow-lift animate-fade-up">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-200/70">{labels.menu}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gold-200 hover:bg-gold-300/10"
                aria-label={labels.close}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3" aria-label="Mobile">
              <NavLinks items={items} vertical onNavigate={() => setOpen(false)} />
            </nav>
            {phone ? (
              <div className="border-t border-gold-300/10 p-4">
                <a href={telHref(phone)} className="btn-gold w-full">
                  <Phone className="h-4 w-4" />
                  <span>
                    {labels.call} · {formatPhoneDisplay(phone)}
                  </span>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
