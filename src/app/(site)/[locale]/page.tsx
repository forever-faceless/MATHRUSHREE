import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommitteeCard } from "@/components/site/CommitteeCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Hero } from "@/components/site/Hero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StatBand } from "@/components/site/StatBand";
import { TestimonialCard } from "@/components/site/TestimonialCard";
import { WhyUs } from "@/components/site/WhyUs";
import { getSettings, listCommittee, listFeaturedProjects, listTestimonials } from "@/lib/db/queries";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [settings, projects, committee, testimonials] = await Promise.all([
    getSettings(),
    listFeaturedProjects(3),
    listCommittee(),
    listTestimonials(),
  ]);

  return (
    <>
      <Hero locale={locale} dict={dict} settings={settings} />
      <StatBand dict={dict} settings={settings} />

      <section className="py-16 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow={dict.nav.projects} title={dict.home.featuredTitle} subtitle={dict.home.featuredSubtitle} />
            <Link href={localePath(locale, "/projects")} className="btn-outline self-start sm:self-auto">
              {dict.common.viewAllProjects}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {projects.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} locale={locale} dict={dict} priority={i === 0} />
              ))}
            </div>
          ) : (
            <p className="card mt-10 p-8 text-center text-ink-500">{dict.projects.noProjects}</p>
          )}
        </div>
      </section>

      <WhyUs dict={dict} />
      <ProcessSteps dict={dict} />

      {committee.length ? (
        <section className="py-16 sm:py-24">
          <div className="container-x">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading eyebrow={dict.nav.committee} title={dict.home.committeeTitle} subtitle={dict.home.committeeSubtitle} />
              <Link href={localePath(locale, "/committee")} className="btn-outline self-start sm:self-auto">
                {dict.home.meetCommittee}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {committee.slice(0, 4).map((m) => (
                <CommitteeCard key={m.id} member={m} locale={locale} compact />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonials.length ? (
        <section className="bg-ivory-200/60 py-16 sm:py-24">
          <div className="container-x">
            <SectionHeading eyebrow={dict.home.statMembers} title={dict.home.testimonialsTitle} align="center" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <TestimonialCard key={t.id} item={t} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand locale={locale} dict={dict} settings={settings} />
    </>
  );
}
