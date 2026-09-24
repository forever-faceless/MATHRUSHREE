import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/db/schema";
import { pick, type Locale } from "@/lib/i18n";

export function TestimonialCard({ item, locale }: { item: Testimonial; locale: Locale }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Quote className="h-6 w-6 text-gold-500" aria-hidden="true" />
      <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed text-olive-900 sm:text-xl">{pick(item, "quote", locale)}</blockquote>
      <figcaption className="mt-5 border-t border-olive-900/8 pt-4 text-sm">
        <span className="font-semibold text-olive-900">{pick(item, "name", locale)}</span>
        {pick(item, "location", locale) ? <span className="text-ink-500"> · {pick(item, "location", locale)}</span> : null}
      </figcaption>
    </figure>
  );
}
