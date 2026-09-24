import { ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Settings } from "@/lib/db/schema";
import { localePath, pick, type Dictionary, type Locale } from "@/lib/i18n";
import { CallButton } from "./PhoneLinks";

export function Hero({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: Settings }) {
  const title = pick(settings, "heroTitle", locale) || dict.home.heroTitle;
  const subtitle = pick(settings, "heroSubtitle", locale) || dict.home.heroSubtitle;
  return (
    <section className="surface-dark relative isolate overflow-hidden text-gold-100">
      {settings.heroImage ? (
        <>
          <Image src={settings.heroImage} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-70" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-olive-950/90 via-olive-900/70 to-olive-900/30" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-olive-900 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(216,181,115,0.25), transparent 45%)" }} />
      )}

      <div className="container-x relative grid min-h-[72vh] items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div className="max-w-2xl">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold-300/25 bg-olive-900/50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300 backdrop-blur sm:text-xs">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {dict.home.heroEyebrow}
          </p>
          <h1 className="display-1 animate-fade-up delay-100 mt-6 text-gold-100">{title}</h1>
          <p className="animate-fade-up delay-200 mt-6 max-w-xl text-base leading-relaxed text-gold-100/75 sm:text-lg">{subtitle}</p>
          <div className="animate-fade-up delay-300 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={localePath(locale, "/projects")} className="btn-gold">
              {dict.home.heroPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <CallButton phone={settings.phonePrimary} label={dict.home.heroSecondary} variant="outline-light" />
          </div>
        </div>

        <div className="hidden justify-end lg:flex">
          <div className="relative rounded-3xl border border-gold-300/15 bg-olive-900/40 p-8 shadow-lift backdrop-blur-sm">
            <Image src="/brand/logo-lockup.png" alt={pick(settings, "societyName", locale)} width={420} height={370} priority className="h-auto w-[22rem]" />
            {settings.regNumber ? (
              <p className="mt-6 border-t border-gold-300/15 pt-4 text-center text-xs text-gold-100/60">
                {dict.common.regNo} {settings.regNumber}
                {settings.establishedYear ? ` · ${dict.common.since} ${settings.establishedYear}` : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
