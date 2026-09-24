import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryPanel } from "@/components/site/EnquiryPanel";
import { WhatsAppIcon } from "@/components/site/PhoneLinks";
import { ProjectMapLoader } from "@/components/site/ProjectMapLoader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getSettings } from "@/lib/db/queries";
import { googleDirectionsLink, googleMapsLink, isValidLatLng } from "@/lib/geo";
import { getDictionary, isLocale, localePath, pick } from "@/lib/i18n";
import { formatPhoneDisplay, telHref, whatsappHref } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.contact.title, description: dict.contact.subtitle };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const settings = await getSettings();
  const wa = settings.whatsapp || settings.phonePrimary;
  const office = isValidLatLng(settings.officeLat, settings.officeLng) ? { lat: settings.officeLat!, lng: settings.officeLng! } : null;
  const societyName = pick(settings, "societyName", locale);

  const rows = [
    settings.phonePrimary && {
      icon: Phone,
      label: dict.contact.phone,
      content: (
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={telHref(settings.phonePrimary)} className="font-semibold text-olive-900 hover:underline">
            {formatPhoneDisplay(settings.phonePrimary)}
          </a>
          {settings.phoneSecondary ? (
            <a href={telHref(settings.phoneSecondary)} className="font-semibold text-olive-900 hover:underline">
              {formatPhoneDisplay(settings.phoneSecondary)}
            </a>
          ) : null}
        </span>
      ),
    },
    wa && {
      icon: WhatsAppIcon,
      label: dict.contact.whatsapp,
      content: (
        <a href={whatsappHref(wa)} target="_blank" rel="noopener noreferrer" className="font-semibold text-olive-900 hover:underline">
          {formatPhoneDisplay(wa)}
        </a>
      ),
    },
    settings.email && {
      icon: Mail,
      label: dict.contact.email,
      content: (
        <a href={`mailto:${settings.email}`} className="font-semibold text-olive-900 hover:underline">
          {settings.email}
        </a>
      ),
    },
    pick(settings, "address", locale) && { icon: MapPin, label: dict.contact.address, content: <span className="leading-relaxed">{pick(settings, "address", locale)}</span> },
    pick(settings, "workingHours", locale) && { icon: Clock, label: dict.contact.hours, content: <span>{pick(settings, "workingHours", locale)}</span> },
  ].filter(Boolean) as { icon: typeof Phone; label: string; content: React.ReactNode }[];

  return (
    <>
      <section className="surface-dark py-14 text-gold-100 sm:py-20">
        <div className="container-x">
          <SectionHeading as="h1" tone="dark" eyebrow={societyName} title={dict.contact.title} subtitle={dict.contact.subtitle} />
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-olive-900">{dict.contact.office}</h2>
            <dl className="mt-6 space-y-5">
              {rows.map((r) => (
                <div key={r.label} className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-50 text-olive-700">
                    <r.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{r.label}</dt>
                    <dd className="mt-1 text-[15px] text-ink-700">{r.content}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {office ? (
              <div className="mt-7 flex flex-wrap gap-2">
                <a href={googleDirectionsLink(office.lat, office.lng)} target="_blank" rel="noopener noreferrer" className="btn-olive btn-sm">
                  <Navigation className="h-4 w-4" /> {dict.common.directions}
                </a>
                <a href={googleMapsLink(office.lat, office.lng)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                  <ExternalLink className="h-4 w-4" /> {dict.common.openInMaps}
                </a>
              </div>
            ) : null}
          </div>
          <div className="card min-h-[360px] overflow-hidden lg:min-h-0">
            {office ? (
              <ProjectMapLoader main={{ lat: office.lat, lng: office.lng, label: societyName, sub: pick(settings, "address", locale) }} landmarks={[]} showLines={false} className="h-full min-h-[360px] w-full" />
            ) : (
              <div className="surface-dark flex h-full min-h-[360px] items-center justify-center text-gold-200/70">{dict.contact.mapTitle}</div>
            )}
          </div>
        </div>
      </section>

      <div className="container-x pb-16">
        <EnquiryPanel locale={locale} dict={dict} settings={settings} title={dict.contact.formTitle} source={localePath(locale, "/contact")} />
      </div>
    </>
  );
}
