import type { Settings } from "@/lib/db/schema";
import { listPublishedProjects } from "@/lib/db/queries";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { EnquiryForm } from "./EnquiryForm";

/**
 * Server wrapper: loads the project list and renders the enquiry form inside a
 * highlighted panel. Place it with id="enquire" so CTA buttons can scroll to it.
 */
export async function EnquiryPanel({
  locale,
  dict,
  settings,
  title,
  text,
  defaultProjectId,
  siteId,
  siteNumber,
  subject,
  source,
  className,
  tone = "light",
}: {
  locale: Locale;
  dict: Dictionary;
  settings: Settings;
  title?: string;
  text?: string;
  defaultProjectId?: number | null;
  siteId?: number | null;
  siteNumber?: string | null;
  subject?: string;
  source: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const projects = await listPublishedProjects();
  return (
    <section id="enquire" className={cn("scroll-mt-24", className)}>
      <div className={cn("rounded-3xl p-6 sm:p-10", tone === "dark" ? "surface-dark text-gold-100" : "card")}>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className={cn("eyebrow", tone === "dark" && "text-gold-300")}>{dict.nav.enquire}</p>
            <h2 className={cn("display-2 mt-3", tone === "dark" ? "text-gold-100" : "text-olive-900")}>{title ?? dict.enquiry.title}</h2>
            <p className={cn("mt-4 text-base leading-relaxed", tone === "dark" ? "text-gold-100/70" : "text-ink-500")}>{text ?? dict.enquiry.subtitle}</p>
          </div>
          <div className={cn(tone === "dark" && "rounded-2xl bg-ivory-50 p-5 text-ink-900 sm:p-6")}>
            <EnquiryForm
              locale={locale}
              t={dict.enquiry}
              projects={projects.map((p) => ({ id: p.id, name: pick(p, "name", locale) }))}
              defaultProjectId={defaultProjectId ?? null}
              siteId={siteId ?? null}
              siteNumber={siteNumber ?? null}
              subject={subject ?? pick(settings, "societyName", locale)}
              phone={settings.phonePrimary}
              whatsapp={settings.whatsapp || settings.phonePrimary}
              source={source}
              callLabel={dict.common.callNow}
              whatsappLabel={dict.common.whatsapp}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
