import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryPanel } from "@/components/site/EnquiryPanel";
import { CallButton, WhatsAppButton } from "@/components/site/PhoneLinks";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getProjectBySlug, getSettings } from "@/lib/db/queries";
import { getDictionary, isLocale, localePath, pick } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/enquire">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.enquiry.title, description: dict.enquiry.subtitle };
}

export default async function EnquirePage({ params, searchParams }: PageProps<"/[locale]/enquire">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { project: projectSlug } = await searchParams;
  const dict = getDictionary(locale);
  const settings = await getSettings();
  const project = typeof projectSlug === "string" ? await getProjectBySlug(projectSlug) : null;
  const wa = settings.whatsapp || settings.phonePrimary;

  return (
    <>
      <section className="surface-dark py-14 text-gold-100 sm:py-20">
        <div className="container-x flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading as="h1" tone="dark" eyebrow={pick(settings, "societyName", locale)} title={dict.enquiry.title} subtitle={dict.enquiry.subtitle} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <CallButton phone={settings.phonePrimary} variant="gold" />
            <WhatsAppButton phone={wa} label={dict.common.whatsapp} variant="outline-light" text={dict.enquiry.whatsappPrefill.replace("{subject}", pick(settings, "societyName", locale))} />
          </div>
        </div>
      </section>
      <div className="container-x py-12 sm:py-16">
        <EnquiryPanel
          locale={locale}
          dict={dict}
          settings={settings}
          defaultProjectId={project?.id ?? null}
          subject={project ? pick(project, "name", locale) : undefined}
          source={localePath(locale, "/enquire")}
        />
      </div>
    </>
  );
}
