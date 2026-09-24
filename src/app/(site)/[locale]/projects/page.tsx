import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/CtaBand";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getSettings, listPublishedProjects } from "@/lib/db/queries";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/db/schema";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.projects.title, description: dict.projects.subtitle };
}

export default async function ProjectsPage({ params, searchParams }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { status } = await searchParams;
  const dict = getDictionary(locale);
  const [settings, projects] = await Promise.all([getSettings(), listPublishedProjects()]);
  const active = typeof status === "string" && (PROJECT_STATUSES as readonly string[]).includes(status) ? (status as ProjectStatus) : null;
  const visible = active ? projects.filter((p) => p.status === active) : projects;
  const present = PROJECT_STATUSES.filter((s) => projects.some((p) => p.status === s));

  return (
    <>
      <section className="surface-dark py-14 text-gold-100 sm:py-20">
        <div className="container-x">
          <SectionHeading as="h1" tone="dark" eyebrow={dict.meta.shortName} title={dict.projects.title} subtitle={dict.projects.subtitle} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-x">
          {present.length > 1 ? (
            <div className="mb-8 flex flex-wrap gap-2">
              <Link href={localePath(locale, "/projects")} className={cn("rounded-full border px-4 py-2 text-[13px] font-semibold transition", !active ? "border-olive-900 bg-olive-900 text-gold-200" : "border-olive-900/15 bg-white text-ink-700 hover:border-olive-900/40")}>
                {dict.common.all}
              </Link>
              {present.map((s) => (
                <Link key={s} href={`${localePath(locale, "/projects")}?status=${s}`} className={cn("rounded-full border px-4 py-2 text-[13px] font-semibold transition", active === s ? "border-olive-900 bg-olive-900 text-gold-200" : "border-olive-900/15 bg-white text-ink-700 hover:border-olive-900/40")}>
                  {dict.status.project[s]}
                </Link>
              ))}
            </div>
          ) : null}

          {visible.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <ProjectCard key={p.id} project={p} locale={locale} dict={dict} priority={i < 3} />
              ))}
            </div>
          ) : (
            <p className="card p-10 text-center text-ink-500">{dict.projects.noProjects}</p>
          )}
        </div>
      </section>

      <CtaBand locale={locale} dict={dict} settings={settings} />
    </>
  );
}
