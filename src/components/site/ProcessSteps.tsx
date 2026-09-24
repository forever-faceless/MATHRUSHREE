import type { Dictionary } from "@/lib/i18n";
import { SectionHeading } from "./SectionHeading";

export function ProcessSteps({ dict, title }: { dict: Dictionary; title?: string }) {
  return (
    <section className="surface-dark py-16 text-gold-100 sm:py-24">
      <div className="container-x">
        <SectionHeading tone="dark" title={title ?? dict.home.processTitle} align="center" />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.process.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-gold-300/12 bg-olive-900/40 p-6 backdrop-blur-sm">
              <span className="font-display text-5xl font-semibold text-gold-500/60">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-gold-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gold-100/65">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
