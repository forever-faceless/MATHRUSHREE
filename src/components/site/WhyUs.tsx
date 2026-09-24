import { FileCheck2, MapPinned, ShieldCheck, Users } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import { SectionHeading } from "./SectionHeading";

const icons = [ShieldCheck, FileCheck2, MapPinned, Users];

export function WhyUs({ dict }: { dict: Dictionary }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading eyebrow={dict.meta.shortName} title={dict.home.whyTitle} subtitle={dict.home.whySubtitle} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.why.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={item.title} className="card p-6 transition-shadow hover:shadow-lift">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-olive-900 text-gold-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-olive-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
