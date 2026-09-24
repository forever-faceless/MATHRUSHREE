import type { Settings } from "@/lib/db/schema";
import type { Dictionary } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

export function StatBand({ dict, settings }: { dict: Dictionary; settings: Settings }) {
  const years = settings.establishedYear ? new Date().getFullYear() - settings.establishedYear : 0;
  const stats = [
    { label: dict.home.statMembers, value: settings.statMembers },
    { label: dict.home.statSites, value: settings.statSitesAllotted },
    { label: dict.home.statProjects, value: settings.statProjectsCompleted },
    { label: dict.home.statYears, value: years },
  ].filter((s) => s.value > 0);
  if (!stats.length) return null;
  return (
    <section className="relative z-10 -mt-8 pb-4">
      <div className="container-x">
        <dl className="card grid grid-cols-2 divide-y divide-olive-900/8 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-6 text-center sm:py-7">
              <dd className="font-display text-4xl font-semibold text-olive-900 sm:text-[2.75rem]">
                {formatNumber(s.value)}
                <span className="text-gold-500">+</span>
              </dd>
              <dt className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
