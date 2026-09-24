import { Clock, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Settings } from "@/lib/db/schema";
import { localePath, pick, type Dictionary, type Locale } from "@/lib/i18n";
import { PhoneLink, WhatsAppIcon } from "./PhoneLinks";
import { buildNav } from "./SiteHeader";
import { whatsappHref } from "@/lib/utils";

export function SiteFooter({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: Settings }) {
  const nav = buildNav(locale, dict);
  const year = new Date().getFullYear();
  const societyName = pick(settings, "societyName", locale);
  const address = pick(settings, "address", locale);
  const hours = pick(settings, "workingHours", locale);
  const wa = settings.whatsapp || settings.phonePrimary;

  return (
    <footer className="surface-dark mt-16 text-gold-100/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Image src="/brand/logo-lockup.png" alt={societyName} width={260} height={230} className="h-auto w-48 sm:w-56" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-gold-100/70">{pick(settings, "tagline", locale) || dict.meta.description}</p>
          {settings.regNumber ? (
            <p className="mt-4 text-xs text-gold-100/55">
              {dict.common.registeredSociety} · {dict.common.regNo} {settings.regNumber}
              {settings.establishedYear ? ` · ${dict.common.established} ${settings.establishedYear}` : ""}
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">{dict.footer.linksTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href={localePath(locale)} className="hover:text-gold-300">
                {dict.nav.home}
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-gold-300">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={localePath(locale, "/enquire")} className="hover:text-gold-300">
                {dict.nav.enquire}
              </Link>
            </li>
            <li className="pt-2">
              <Link href="/admin" className="text-xs text-gold-100/50 hover:text-gold-300">
                {dict.footer.memberLogin}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">{dict.footer.contactTitle}</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.phonePrimary ? (
              <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <PhoneLink phone={settings.phonePrimary} className="text-gold-200 text-base" />
                {settings.phoneSecondary ? <PhoneLink phone={settings.phoneSecondary} className="text-gold-200/80" /> : null}
              </li>
            ) : null}
            {wa ? (
              <li>
                <a href={whatsappHref(wa)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold-300">
                  <WhatsAppIcon className="h-4 w-4 text-gold-300" />
                  <span>{dict.contact.whatsapp}</span>
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 hover:text-gold-300">
                  <Mail className="h-4 w-4 text-gold-300" />
                  <span>{settings.email}</span>
                </a>
              </li>
            ) : null}
            {address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                <span className="leading-relaxed">{address}</span>
              </li>
            ) : null}
            {hours ? (
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                <span>{hours}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-gold-300/10">
        <div className="container-x flex flex-col gap-3 py-5 text-xs text-gold-100/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {societyName}. {dict.footer.rights}
          </p>
          <p className="max-w-2xl md:text-right">{dict.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
