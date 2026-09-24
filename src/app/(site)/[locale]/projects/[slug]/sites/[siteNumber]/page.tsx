import { ArrowLeft, ArrowRight, Check, ExternalLink, MessageSquareText, Navigation } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EnquiryPanel } from "@/components/site/EnquiryPanel";
import { Gallery } from "@/components/site/Gallery";
import { computeDistances, LandmarkList } from "@/components/site/LandmarkList";
import { CallButton, WhatsAppButton } from "@/components/site/PhoneLinks";
import { ProjectMapLoader } from "@/components/site/ProjectMapLoader";
import { SiteStatusBadge } from "@/components/site/StatusBadge";
import { getProjectBySlug, getSettings, getSite, listLandmarks, listSites } from "@/lib/db/queries";
import { googleDirectionsLink, googleMapsLink, isValidLatLng } from "@/lib/geo";
import { getDictionary, isLocale, localePath, pick, pickItem } from "@/lib/i18n";
import { cn, formatINR, formatINRShort, formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]/sites/[siteNumber]">): Promise<Metadata> {
  const { locale, slug, siteNumber } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const site = await getSite(project.id, decodeURIComponent(siteNumber));
  if (!site) return {};
  const dict = getDictionary(locale);
  return {
    title: `${dict.common.site} ${site.siteNumber} · ${pick(project, "name", locale)}`,
    description: `${site.dimension} · ${site.areaSqft ?? ""} ${dict.common.sqft} · ${dict.status.site[site.status]}`,
  };
}

export default async function SitePage({ params }: PageProps<"/[locale]/projects/[slug]/sites/[siteNumber]">) {
  const { locale, slug, siteNumber: rawNumber } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const site = await getSite(project.id, decodeURIComponent(rawNumber));
  if (!site) notFound();
  const [settings, landmarks, siblings] = await Promise.all([getSettings(), listLandmarks(project.id), listSites(project.id)]);

  const projectName = pick(project, "name", locale);
  const projectHref = localePath(locale, `/projects/${project.slug}`);
  const siteHref = `${projectHref}/sites/${encodeURIComponent(site.siteNumber)}`;
  const siteTitle = `${dict.common.site} ${site.siteNumber}`;
  const subject = `${siteTitle}, ${projectName}`;
  const sitePin = isValidLatLng(site.lat, site.lng) ? { lat: site.lat!, lng: site.lng! } : null;
  const projectPin = isValidLatLng(project.lat, project.lng) ? { lat: project.lat!, lng: project.lng! } : null;
  const origin = sitePin ?? projectPin;
  const distances = origin ? computeDistances(origin, landmarks, locale) : [];
  const images = site.images.length ? site.images : [project.coverImage, ...project.gallery].filter(Boolean);
  const wa = settings.whatsapp || settings.phonePrimary;
  const waText = dict.enquiry.whatsappPrefill.replace("{subject}", subject);

  const others = siblings.filter((s) => s.id !== site.id && s.status === "available").slice(0, 4);

  const params2: { label: string; value: string; strong?: boolean }[] = [
    { label: dict.projects.dimension, value: site.dimension || "—", strong: true },
    { label: dict.projects.areaSqft, value: site.areaSqft ? `${formatNumber(site.areaSqft)} ${dict.common.sqft}` : "—", strong: true },
    { label: dict.facing.label, value: site.facing ? dict.facing[site.facing] : "—" },
    { label: dict.projects.road, value: site.roadWidthFt ? `${site.roadWidthFt} ft` : "—" },
    { label: dict.common.corner, value: site.corner ? dict.common.yes : dict.common.no },
    { label: dict.site.ratePerSqft, value: site.pricePerSqft ? `₹${formatNumber(site.pricePerSqft)} ${dict.common.perSqft}` : "—" },
  ];

  const mapSites = siblings
    .filter((s) => isValidLatLng(s.lat, s.lng))
    .map((s) => ({ id: s.id, lat: s.lat!, lng: s.lng!, label: s.siteNumber, href: `${projectHref}/sites/${encodeURIComponent(s.siteNumber)}`, status: s.status, active: s.id === site.id }));

  return (
    <>
      <section className="surface-dark text-gold-100">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumbs tone="dark" items={[{ href: localePath(locale), label: dict.nav.home }, { href: localePath(locale, "/projects"), label: dict.nav.projects }, { href: projectHref, label: projectName }, { label: siteTitle }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <SiteStatusBadge status={site.status} label={dict.status.site[site.status]} />
              <h1 className="display-1 mt-4 text-gold-100">
                {siteTitle}
                <span className="mt-2 block font-sans text-base font-medium text-gold-100/70 sm:text-lg">{dict.site.siteInProject.replace("{project}", projectName)}</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm text-gold-100/70">{dict.site.statusNote[site.status]}</p>
            </div>
            <div className="rounded-2xl border border-gold-300/15 bg-olive-900/40 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-100/55">{dict.site.totalPrice}</p>
              <p className="mt-1 font-display text-4xl font-semibold text-gold-200">
                {site.price ? formatINRShort(site.price, locale) : dict.common.onRequest}
                {site.price ? <span className="ml-2 font-sans text-sm font-medium text-gold-100/60">{formatINR(site.price)}</span> : null}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a href="#enquire" className="btn-gold flex-1">
                  <MessageSquareText className="h-4 w-4" /> {dict.site.getMoreDetails}
                </a>
                <CallButton phone={settings.phonePrimary} showNumber={false} label={dict.common.callNow} variant="outline-light" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x space-y-14 py-12 sm:space-y-20 sm:py-16">
        {images.length ? <Gallery images={images} alt={subject} /> : null}

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="display-3 text-olive-900">{dict.site.parameters}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {params2.map((p) => (
                <div key={p.label} className="card px-4 py-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">{p.label}</dt>
                  <dd className={cn("mt-1 text-olive-900", p.strong ? "font-display text-2xl font-semibold" : "font-semibold")}>{p.value}</dd>
                </div>
              ))}
            </dl>

            {pick(site, "description", locale) ? (
              <div className="mt-10">
                <h2 className="display-3 text-olive-900">{dict.site.description}</h2>
                <div className="prose-soft mt-4 text-base leading-relaxed text-ink-700">
                  {pick(site, "description", locale).split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {site.features.length ? (
              <div className="mt-10">
                <h2 className="display-3 text-olive-900">{dict.site.features}</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {site.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-white/70 px-4 py-3 text-sm text-ink-700 ring-1 ring-olive-900/6">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
                      {pickItem(f, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h3 className="font-display text-xl font-semibold text-olive-900">{dict.site.getMoreDetails}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{dict.site.getMoreDetailsText}</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href="#enquire" className="btn-gold">
                  <MessageSquareText className="h-4 w-4" /> {dict.site.getMoreDetails}
                </a>
                <CallButton phone={settings.phonePrimary} variant="olive" />
                <WhatsAppButton phone={wa} label={dict.common.whatsapp} text={waText} variant="outline" />
              </div>
            </div>
            <Link href={projectHref} className="btn-ghost justify-start px-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> {dict.site.backToProject}
            </Link>
          </aside>
        </section>

        {origin ? (
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="display-3 text-olive-900">{dict.site.location}</h2>
                <p className="mt-2 max-w-xl text-sm text-ink-500">{sitePin ? dict.site.locationText : dict.site.locationFallback}</p>
              </div>
              <div className="flex gap-2">
                <a href={googleMapsLink(origin.lat, origin.lng)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                  <ExternalLink className="h-4 w-4" /> {dict.common.openInMaps}
                </a>
                <a href={googleDirectionsLink(origin.lat, origin.lng)} target="_blank" rel="noopener noreferrer" className="btn-olive btn-sm">
                  <Navigation className="h-4 w-4" /> {dict.common.directions}
                </a>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="card h-[360px] overflow-hidden sm:h-[440px] lg:h-auto lg:min-h-[500px]">
                <ProjectMapLoader
                  main={{ lat: origin.lat, lng: origin.lng, label: sitePin ? subject : projectName }}
                  landmarks={distances.map((d) => ({ id: d.landmark.id, lat: d.landmark.lat, lng: d.landmark.lng, label: pick(d.landmark, "name", locale), category: d.landmark.category, distance: d.distance, drive: d.drive }))}
                  sites={sitePin ? mapSites : []}
                  focus={sitePin ? "layout" : "all"}
                  showLines={!sitePin}
                />
              </div>
              {distances.length ? (
                <div className="card p-6">
                  <h3 className="font-display text-xl font-semibold text-olive-900">{dict.projects.nearby}</h3>
                  <p className="mt-1 text-xs text-ink-500">{dict.projects.nearbyText}</p>
                  <div className="mt-3">
                    <LandmarkList items={distances} locale={locale} dict={dict} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <EnquiryPanel
          locale={locale}
          dict={dict}
          settings={settings}
          title={dict.site.enquiryTitle.replace("{site}", site.siteNumber)}
          text={dict.site.getMoreDetailsText}
          defaultProjectId={project.id}
          siteId={site.id}
          siteNumber={site.siteNumber}
          subject={subject}
          source={siteHref}
          tone="dark"
        />

        {others.length ? (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="display-3 text-olive-900">{dict.site.otherSites}</h2>
              <Link href={`${projectHref}#sites`} className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline">
                {dict.common.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((s) => (
                <li key={s.id}>
                  <Link href={`${projectHref}/sites/${encodeURIComponent(s.siteNumber)}`} className="card flex items-center gap-4 p-4 transition hover:shadow-lift">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-olive-900 font-display text-lg font-semibold text-gold-200">{s.siteNumber}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-olive-900">{s.dimension || "—"}</span>
                      <span className="block text-sm text-ink-500">
                        {s.facing ? dict.facing[s.facing] : ""}
                        {s.price ? ` · ${formatINRShort(s.price, locale)}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
