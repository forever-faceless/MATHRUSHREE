import { ArrowUpRight, LandPlot, MapPin } from "lucide-react";
import Link from "next/link";
import type { ProjectWithCounts } from "@/lib/db/queries";
import { localePath, pick, type Dictionary, type Locale } from "@/lib/i18n";
import { formatINRShort, formatNumber } from "@/lib/utils";
import { BrandImage } from "./BrandImage";
import { ProjectStatusBadge } from "./StatusBadge";

export function ProjectCard({ project, locale, dict, priority }: { project: ProjectWithCounts; locale: Locale; dict: Dictionary; priority?: boolean }) {
  const name = pick(project, "name", locale);
  const href = localePath(locale, `/projects/${project.slug}`);
  const total = project.totalSites ?? project.siteCount;
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift">
      <Link href={href} className="block" aria-label={name}>
        <BrandImage
          src={project.coverImage}
          alt={name}
          wrapperClassName="aspect-[4/3]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-700 group-hover:scale-[1.04]"
          priority={priority}
        />
      </Link>
      <div className="absolute left-4 top-4 flex gap-2">
        <ProjectStatusBadge status={project.status} label={dict.status.project[project.status]} className="bg-ivory-50/95 shadow-soft" />
        {project.featured ? <span className="badge bg-gold-500 text-olive-900 shadow-soft">{dict.common.featured}</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="display-3 text-olive-900">
          <Link href={href} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>
        {project.locationEn || project.locationKn ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
            {pick(project, "location", locale)}
          </p>
        ) : null}
        {pick(project, "tagline", locale) ? <p className="mt-3 text-sm leading-relaxed text-ink-700">{pick(project, "tagline", locale)}</p> : null}
        <div className="h-5" aria-hidden="true" />

        <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-olive-900/8 pt-4 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-ink-400">{dict.projects.totalSites}</dt>
            <dd className="mt-1 font-semibold text-olive-900">{total ? formatNumber(total) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-ink-400">{dict.projects.availableSites}</dt>
            <dd className="mt-1 font-semibold text-olive-900">{project.status === "sold_out" ? "0" : project.siteCount ? formatNumber(project.availableCount) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-ink-400">{dict.projects.area}</dt>
            <dd className="mt-1 font-semibold text-olive-900">{project.totalAreaAcres ? `${project.totalAreaAcres} ${dict.common.acres}` : "—"}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {project.priceFrom ? (
              <>
                {dict.projects.priceFrom} <span className="font-semibold text-olive-900">{formatINRShort(project.priceFrom, locale)}</span>
              </>
            ) : project.pricePerSqft ? (
              <>
                <span className="font-semibold text-olive-900">₹{formatNumber(project.pricePerSqft)}</span> {dict.common.perSqft}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <LandPlot className="h-4 w-4 text-gold-600" /> {dict.common.price}: {dict.common.onRequest}
              </span>
            )}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 transition group-hover:text-gold-600">
            {dict.common.viewProject}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
