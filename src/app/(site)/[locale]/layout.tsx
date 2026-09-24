import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StickyBar } from "@/components/site/StickyBar";
import { getSettings } from "@/lib/db/queries";
import { fontClassNames } from "@/lib/fonts";
import { getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.siteName, template: `%s · ${dict.meta.shortName}` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: locale === "kn" ? "kn_IN" : "en_IN",
      images: [{ url: "/brand/logo.png", width: 1024, height: 1024 }],
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  return (
    <html
      lang={locale}
      className={cn(fontClassNames, "h-full antialiased")}
    >
      <body className="has-sticky-bar flex min-h-full flex-col bg-ivory-100">
        <SiteHeader locale={locale} dict={dict} settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} dict={dict} settings={settings} />
        <StickyBar
          locale={locale}
          phone={settings.phonePrimary}
          whatsapp={settings.whatsapp || settings.phonePrimary}
          labels={dict.stickyBar}
          whatsappText={dict.enquiry.whatsappPrefill.replace("{subject}", pick(settings, "societyName", locale))}
        />
      </body>
    </html>
  );
}
