import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Settings } from "@/lib/db/schema";
import { localePath, pick, type Dictionary, type Locale } from "@/lib/i18n";
import { CallButton, WhatsAppButton } from "./PhoneLinks";

export function CtaBand({ locale, dict, settings, subject }: { locale: Locale; dict: Dictionary; settings: Settings; subject?: string }) {
  const wa = settings.whatsapp || settings.phonePrimary;
  const text = dict.enquiry.whatsappPrefill.replace("{subject}", subject ?? pick(settings, "societyName", locale));
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <div className="surface-dark relative overflow-hidden rounded-3xl px-6 py-12 text-gold-100 sm:px-12 sm:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="display-2 text-gold-100">{dict.home.ctaTitle}</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gold-100/70 sm:text-lg">{dict.home.ctaText}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <CallButton phone={settings.phonePrimary} variant="gold" />
              <WhatsAppButton phone={wa} label={dict.common.whatsapp} text={text} variant="outline-light" />
              <Link href={localePath(locale, "/enquire")} className="btn-outline-light">
                {dict.home.ctaButton}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
