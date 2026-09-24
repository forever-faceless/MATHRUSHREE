import type { Settings } from "@/lib/db/schema";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { CallButton } from "./PhoneLinks";
import { LocaleSwitch } from "./LocaleSwitch";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

export type NavItem = { href: string; label: string };

export function buildNav(locale: Locale, dict: Dictionary): NavItem[] {
  return [
    { href: localePath(locale, "/projects"), label: dict.nav.projects },
    { href: localePath(locale, "/about"), label: dict.nav.about },
    { href: localePath(locale, "/committee"), label: dict.nav.committee },
    { href: localePath(locale, "/contact"), label: dict.nav.contact },
  ];
}

export function SiteHeader({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: Settings }) {
  const nav = buildNav(locale, dict);
  const nameLine1 = locale === "kn" ? "ಮಾತೃಶ್ರೀ" : "Mathrushree";
  const nameLine2 = locale === "kn" ? "ಹೌಸಿಂಗ್ ಕೋ-ಆಪರೇಟಿವ್ ಸೊಸೈಟಿ · ಹಾಸನ" : "Housing Co-operative Society · Hassan";

  return (
    <header className="surface-dark sticky top-0 z-40 border-b border-gold-300/10 text-gold-100 shadow-[0_1px_0_rgba(232,207,143,0.08)]">
      <div className="container-x flex h-[68px] items-center justify-between gap-4 sm:h-[76px]">
        <Logo href={localePath(locale)} nameLine1={nameLine1} nameLine2={nameLine2} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <NavLinks items={nav} />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LocaleSwitch locale={locale} label={dict.nav.switchTo} />
          <CallButton phone={settings.phonePrimary} label={dict.nav.callUs} variant="gold" size="sm" />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitch locale={locale} label={dict.nav.switchTo} className="px-2.5" />
          <MobileNav
            items={[{ href: localePath(locale), label: dict.nav.home }, ...nav, { href: localePath(locale, "/enquire"), label: dict.nav.enquire }]}
            phone={settings.phonePrimary}
            labels={{ menu: dict.nav.menu, close: dict.nav.close, call: dict.nav.callUs }}
          />
        </div>
      </div>
    </header>
  );
}
