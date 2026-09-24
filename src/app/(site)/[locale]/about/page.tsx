import { FileCheck2, Landmark, ScrollText, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CommitteeCard } from "@/components/site/CommitteeCard";
import { CtaBand } from "@/components/site/CtaBand";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getSettings, listCommittee } from "@/lib/db/queries";
import { getDictionary, isLocale, pick } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.about.title, description: dict.about.subtitle };
}

const valueIcons = [FileCheck2, Users, ScrollText, Landmark];

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [settings, committee] = await Promise.all([getSettings(), listCommittee()]);
  const about = pick(settings, "about", locale).split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <section className="surface-dark py-14 text-gold-100 sm:py-20">
        <div className="container-x">
          <SectionHeading as="h1" tone="dark" eyebrow={dict.common.registeredSociety} title={dict.about.title} subtitle={dict.about.subtitle} />
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">{dict.about.missionTitle}</p>
            <div className="prose-soft mt-4 text-[17px] leading-relaxed text-ink-700">
              {about.length ? about.map((p, i) => <p key={i}>{p}</p>) : <p>{dict.meta.description}</p>}
            </div>
            <div className="card mt-8 flex items-start gap-4 p-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-olive-900 text-gold-300">
                <ScrollText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-olive-900">{dict.about.registrationTitle}</h3>
                <p className="mt-1 text-sm text-ink-500">{dict.about.registrationText}</p>
                {settings.regNumber ? (
                  <p className="mt-2 text-sm font-semibold text-olive-900">
                    {dict.common.regNo} {settings.regNumber}
                    {settings.establishedYear ? ` · ${dict.common.established} ${settings.establishedYear}` : ""}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="surface-dark flex items-center justify-center rounded-3xl p-10">
            <Image src="/brand/logo-lockup.png" alt={pick(settings, "societyName", locale)} width={420} height={370} className="h-auto w-full max-w-sm" />
          </div>
        </div>
      </section>

      <section className="bg-ivory-200/60 py-14 sm:py-20">
        <div className="container-x">
          <SectionHeading title={dict.about.valuesTitle} align="center" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dict.about.values.map((v, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <div key={v.title} className="card p-6">
                  <Icon className="h-6 w-6 text-gold-600" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-xl font-semibold text-olive-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ProcessSteps dict={dict} title={dict.about.howTitle} />

      {committee.length ? (
        <section className="py-14 sm:py-20">
          <div className="container-x">
            <SectionHeading eyebrow={dict.nav.committee} title={dict.committee.title} subtitle={dict.committee.subtitle} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {committee.map((m) => (
                <CommitteeCard key={m.id} member={m} locale={locale} compact />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand locale={locale} dict={dict} settings={settings} />
    </>
  );
}
