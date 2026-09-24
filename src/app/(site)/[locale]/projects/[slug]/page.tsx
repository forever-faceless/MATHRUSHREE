import { Check, Download, ExternalLink, FileCheck2, LandPlot, MapPin, Navigation, Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { EnquiryPanel } from "@/components/site/EnquiryPanel";
import { Gallery } from "@/components/site/Gallery";
import { computeDistances, LandmarkList } from "@/components/site/LandmarkList";
import { CallButton, WhatsAppButton } from "@/components/site/PhoneLinks";
import { ProjectMapLoader } from "@/components/site/ProjectMapLoader";
import { SiteGrid, type SiteRow } from "@/components/site/SiteGrid";
import { ProjectStatusBadge } from "@/components/site/StatusBadge";
import { getProjectBySlug, getSettings, listLandmarks, listSites } from "@/lib/db/queries";
import { googleDirectionsLink, googleMapsLink, isValidLatLng } from "@/lib/geo";
import { getDictionary, isLocale, localePath, pick, pickItem } from "@/lib/i18n";
import { formatINRShort, formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: pick(project, "name", locale),
    description: pick(project, "tagline", locale) || pick(project, "description", locale).slice(0, 160),
    openGraph: project.coverImage ? { images: [{ url: project.coverImage }] } : undefined,
  };
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const [settings, landmarks, sites] = await Promise.all([getSettings(), listLandmarks(project.id), listSites(project.id)]);

  const name = pick(project, "name", locale);
  const hasPin = isValidLatLng(project.lat, project.lng);
  const origin = hasPin ? { lat: project.lat!, lng: project.lng! } : null;
  const distances = origin ? computeDistances(origin, landmarks, locale) : [];
  const images = [project.coverImage, ...project.gallery].filter(Boolean);
  const available = sites.filter((s) => s.status === "available").length;
  const totalSites = project.totalSites ?? sites.length;
  const paragraphs = pick(project, "description", locale).split(/\n{2,}/).filter(Boolean);
  const projectsHref = localePath(locale, "/projects");
  const projectHref = localePath(locale, `/projects/${project.slug}`);
  const wa = settings.whatsapp || settings.phonePrimary;
  const waText = dict.enquiry.whatsappPrefill.replace("{subject}", name);

  const siteRows: SiteRow[] = sites.map((s) => ({
    id: s.id,
    siteNumber: s.siteNumber,
    dimension: s.dimension,
    areaSqft: s.areaSqft,
    facing: s.facing,
    roadWidthFt: s.roadWidthFt,
    corner: s.corner,
    status: s.status,
    price: s.price,
    pricePerSqft: s.pricePerSqft,
    href: `${projectHref}/sites/${encodeURIComponent(s.siteNumber)}`,
  }));

  const mapSites = sites
    .filter((s) => isValidLatLng(s.lat, s.lng))
    .map((s) => ({ id: s.id, lat: s.lat!, lng: s.lng!, label: s.siteNumber, href: `${projectHref}/sites/${encodeURIComponent(s.siteNumber)}`, status: s.status }));

  const facts: { label: string; value: string }[] = [
    { label: dict.projects.projectStatus, value: dict.status.project[project.status] },
    { label: dict.projects.totalSites, value: totalSites ? formatNumber(totalSites) : "—" },
    { label: dict.projects.availableSites, value: project.status === "sold_out" ? "0" : sites.length ? formatNumber(available) : "—" },
    { label: dict.projects.area, value: project.totalAreaAcres ? `${project.totalAreaAcres} ${dict.common.acres}` : "—" },
    {
      label: dict.projects.priceFrom,
      value: project.priceFrom ? formatINRShort(project.priceFrom, locale) : project.pricePerSqft ? `₹${formatNumber(project.pricePerSqft)} ${dict.common.perSqft}` : dict.common.onRequest,
    },
  ];

  return (
    <>
      {/* ---------- Header band ---------- */}
      <section className="surface-dark text-gold-100">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumbs tone="dark" items={[{ href: localePath(locale), label: dict.nav.home }, { href: projectsHref, label: dict.nav.projects }, { label: name }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.status} label={dict.status.project[project.status]} />
                {project.featured ? <span className="badge bg-gold-500 text-olive-900">{dict.common.featured}</span> : null}
              </div>
              <h1 className="display-1 mt-4 text-gold-100">{name}</h1>
              {pick(project, "tagline", locale) ? <p className="mt-4 max-w-2xl text-lg text-gold-100/75">{pick(project, "tagline", locale)}</p> : null}
              {pick(project, "location", locale) ? (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-gold-200">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {pick(project, "location", locale)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <CallButton phone={settings.phonePrimary} variant="gold" />
              <div className="flex gap-3">
                <WhatsAppButton phone={wa} label={dict.common.whatsapp} text={waText} variant="outline-light" />
                <a href="#enquire" className="btn-outline-light">
                  {dict.projects.enquireProject}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gold-300/10 bg-olive-950/40">
          <dl className="container-x grid grid-cols-2 gap-y-4 py-5 sm:grid-cols-5">
            {facts.map((f) => (
              <div key={f.label} className="px-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-100/55">{f.label}</dt>
                <dd className="mt-1 font-display text-xl font-semibold text-gold-200">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container-x space-y-16 py-12 sm:space-y-24 sm:py-16">
        {/* ---------- Gallery ---------- */}
        {images.length ? <Gallery images={images} alt={name} /> : null}

        {/* ---------- Overview + key details ---------- */}
        <section className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <p className="eyebrow">{dict.projects.overview}</p>
            <div className="prose-soft mt-4 text-base leading-relaxed text-ink-700 sm:text-[17px]">
              {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p className="text-ink-500">—</p>}
            </div>

            {project.amenities.length ? (
              <div className="mt-10">
                <h2 className="display-3 text-olive-900">{dict.projects.amenities}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {project.amenities.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-white/70 px-4 py-3 text-sm text-ink-700 ring-1 ring-olive-900/6">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
                      {pickItem(a, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {project.approvals.length ? (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-olive-900">
                  <FileCheck2 className="h-5 w-5 text-gold-600" aria-hidden="true" />
                  {dict.projects.approvals}
                </h2>
                <ul className="mt-4 space-y-3">
                  {project.approvals.map((a, i) => (
                    <li key={i} className="border-t border-olive-900/8 pt-3 first:border-t-0 first:pt-0">
                      <p className="text-sm font-semibold text-olive-900">{pickItem(a, locale)}</p>
                      {a.number ? <p className="mt-0.5 text-xs tabular-nums text-ink-500">{a.number}</p> : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-ink-500">{dict.projects.approvalsNote}</p>
              </div>
            ) : null}

            {project.brochureUrl || project.videoUrl ? (
              <div className="flex flex-col gap-2">
                {project.brochureUrl ? (
                  <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn-olive justify-start">
                    <Download className="h-4 w-4" /> {dict.projects.brochure}
                  </a>
                ) : null}
                {project.videoUrl ? (
                  <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline justify-start">
                    <Play className="h-4 w-4" /> {dict.projects.video}
                  </a>
                ) : null}
              </div>
            ) : null}
          </aside>
        </section>

        {/* ---------- Layout plan ---------- */}
        {project.layoutPlanImage ? (
          <section>
            <h2 className="display-3 text-olive-900">{dict.projects.layoutPlan}</h2>
            <a href={project.layoutPlanImage} target="_blank" rel="noopener noreferrer" className="card mt-5 block overflow-hidden">
              <div className="relative aspect-[16/11] bg-ivory-100">
                <Image src={project.layoutPlanImage} alt={`${name} – ${dict.projects.layoutPlan}`} fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-contain" />
              </div>
            </a>
          </section>
        ) : null}

        {/* ---------- Map + distances ---------- */}
        {origin ? (
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="display-3 text-olive-900">{dict.projects.mapTitle}</h2>
                <p className="mt-2 max-w-xl text-sm text-ink-500">{dict.projects.mapText}</p>
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
              <div className="card h-[380px] overflow-hidden sm:h-[460px] lg:h-auto lg:min-h-[520px]">
                <ProjectMapLoader
                  main={{ lat: origin.lat, lng: origin.lng, label: name, sub: pick(project, "location", locale) }}
                  landmarks={distances.map((d) => ({ id: d.landmark.id, lat: d.landmark.lat, lng: d.landmark.lng, label: pick(d.landmark, "name", locale), category: d.landmark.category, distance: d.distance, drive: d.drive }))}
                  sites={mapSites}
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

        {/* ---------- Sites ---------- */}
        <section id="sites" className="scroll-mt-24">
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-900 text-gold-300">
              <LandPlot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="display-3 text-olive-900">{dict.projects.sitesTitle}</h2>
              <p className="mt-1 text-sm text-ink-500">{dict.projects.sitesSubtitle}</p>
            </div>
          </div>
          <div className="mt-7">
            {sites.length ? (
              <SiteGrid
                sites={siteRows}
                locale={locale}
                labels={{
                  siteNo: dict.projects.siteNo,
                  dimension: dict.projects.dimension,
                  areaSqft: dict.projects.areaSqft,
                  facing: dict.facing.label,
                  road: dict.projects.road,
                  price: dict.common.price,
                  status: dict.projects.projectStatus,
                  onlyAvailable: dict.projects.onlyAvailable,
                  facingFilter: dict.projects.facingFilter,
                  dimensionFilter: dict.projects.dimensionFilter,
                  all: dict.common.all,
                  clear: dict.common.clear,
                  noResults: dict.common.noResults,
                  showing: dict.projects.showingSites,
                  corner: dict.common.corner,
                  onRequest: dict.common.onRequest,
                  sqft: dict.common.sqft,
                  statusLabels: dict.status.site,
                  facingLabels: dict.facing,
                }}
              />
            ) : (
              <p className="card p-8 text-center text-ink-500">{project.status === "sold_out" ? dict.projects.allSold : dict.projects.noSites}</p>
            )}
          </div>
        </section>

        {/* ---------- Enquiry ---------- */}
        <EnquiryPanel locale={locale} dict={dict} settings={settings} defaultProjectId={project.id} subject={name} source={projectHref} tone="dark" />
      </div>

      <CtaBand locale={locale} dict={dict} settings={settings} subject={name} />
      <div className="sr-only">
        <Link href={projectsHref}>{dict.nav.projects}</Link>
      </div>
    </>
  );
}
