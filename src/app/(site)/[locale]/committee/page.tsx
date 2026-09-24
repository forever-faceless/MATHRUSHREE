import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommitteeCard } from "@/components/site/CommitteeCard";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getSettings, listCommittee } from "@/lib/db/queries";
import { getDictionary, isLocale, pick } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/committee">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.committee.title, description: dict.committee.subtitle };
}

export default async function CommitteePage({ params }: PageProps<"/[locale]/committee">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [settings, committee] = await Promise.all([getSettings(), listCommittee()]);

  return (
    <>
      <section className="surface-dark py-14 text-gold-100 sm:py-20">
        <div className="container-x">
          <SectionHeading as="h1" tone="dark" eyebrow={pick(settings, "societyName", locale)} title={dict.committee.title} subtitle={dict.committee.subtitle} />
        </div>
      </section>
      <section className="py-14 sm:py-20">
        <div className="container-x">
          <p className="max-w-3xl text-[17px] leading-relaxed text-ink-700">{dict.committee.intro}</p>
          {committee.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {committee.map((m) => (
                <CommitteeCard key={m.id} member={m} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="card mt-10 p-8 text-center text-ink-500">{dict.committee.empty}</p>
          )}
        </div>
      </section>
      <CtaBand locale={locale} dict={dict} settings={settings} />
    </>
  );
}
