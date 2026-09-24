"use client";

import { ArrowUpRight, Compass, Ruler } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Facing, SiteStatus } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { cn, formatINRShort, formatNumber } from "@/lib/utils";
import { SiteStatusBadge } from "./StatusBadge";

export type SiteRow = {
  id: number;
  siteNumber: string;
  dimension: string;
  areaSqft: number | null;
  facing: Facing | null;
  roadWidthFt: number | null;
  corner: boolean;
  status: SiteStatus;
  price: number | null;
  pricePerSqft: number | null;
  href: string;
};

type Labels = {
  siteNo: string;
  dimension: string;
  areaSqft: string;
  facing: string;
  road: string;
  price: string;
  status: string;
  onlyAvailable: string;
  facingFilter: string;
  dimensionFilter: string;
  all: string;
  clear: string;
  noResults: string;
  showing: string;
  corner: string;
  onRequest: string;
  sqft: string;
  statusLabels: Record<SiteStatus, string>;
  facingLabels: Record<Facing, string>;
};

export function SiteGrid({ sites, locale, labels }: { sites: SiteRow[]; locale: Locale; labels: Labels }) {
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [facing, setFacing] = useState<string>("");
  const [dimension, setDimension] = useState<string>("");

  const facings = useMemo(() => Array.from(new Set(sites.map((s) => s.facing).filter(Boolean))) as Facing[], [sites]);
  const dimensions = useMemo(() => Array.from(new Set(sites.map((s) => s.dimension).filter(Boolean))), [sites]);

  const filtered = useMemo(
    () =>
      sites.filter(
        (s) => (!onlyAvailable || s.status === "available") && (!facing || s.facing === facing) && (!dimension || s.dimension === dimension),
      ),
    [sites, onlyAvailable, facing, dimension],
  );

  const hasFilters = onlyAvailable || facing || dimension;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setOnlyAvailable((v) => !v)}
          aria-pressed={onlyAvailable}
          className={cn(
            "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition",
            onlyAvailable ? "border-success-600 bg-success-100 text-success-600" : "border-olive-900/15 bg-white text-ink-700 hover:border-olive-900/40",
          )}
        >
          {labels.onlyAvailable}
        </button>
        {facings.length > 1 ? (
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-500">
            <Compass className="h-4 w-4" aria-hidden="true" />
            <select value={facing} onChange={(e) => setFacing(e.target.value)} className="field w-auto py-2 pr-8 text-[13px]" aria-label={labels.facingFilter}>
              <option value="">{labels.facingFilter}: {labels.all}</option>
              {facings.map((f) => (
                <option key={f} value={f}>
                  {labels.facingLabels[f]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {dimensions.length > 1 ? (
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-500">
            <Ruler className="h-4 w-4" aria-hidden="true" />
            <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="field w-auto py-2 pr-8 text-[13px]" aria-label={labels.dimensionFilter}>
              <option value="">{labels.dimensionFilter}: {labels.all}</option>
              {dimensions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {hasFilters ? (
          <button type="button" onClick={() => { setOnlyAvailable(false); setFacing(""); setDimension(""); }} className="text-[13px] font-semibold text-gold-700 hover:underline">
            {labels.clear}
          </button>
        ) : null}
        <span className="ml-auto text-[13px] text-ink-500">{labels.showing.replace("{count}", String(filtered.length)).replace("{total}", String(sites.length))}</span>
      </div>

      {filtered.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-ink-500">{labels.noResults}</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card mt-6 hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="table-soft w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th>{labels.siteNo}</th>
                    <th>{labels.dimension}</th>
                    <th>{labels.areaSqft}</th>
                    <th>{labels.facing}</th>
                    <th>{labels.road}</th>
                    <th>{labels.status}</th>
                    <th className="text-right">{labels.price}</th>
                    <th aria-label="open" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="group transition hover:bg-gold-100/40">
                      <td>
                        <Link href={s.href} className="font-display text-lg font-semibold text-olive-900">
                          {s.siteNumber}
                        </Link>
                        {s.corner ? <span className="ml-2 badge bg-gold-100 text-gold-700">{labels.corner}</span> : null}
                      </td>
                      <td className="font-medium">{s.dimension || "—"}</td>
                      <td>{s.areaSqft ? `${formatNumber(s.areaSqft)} ${labels.sqft}` : "—"}</td>
                      <td>{s.facing ? labels.facingLabels[s.facing] : "—"}</td>
                      <td>{s.roadWidthFt ? `${s.roadWidthFt} ft` : "—"}</td>
                      <td>
                        <SiteStatusBadge status={s.status} label={labels.statusLabels[s.status]} />
                      </td>
                      <td className="text-right font-semibold tabular-nums text-olive-900">{s.price ? formatINRShort(s.price, locale) : labels.onRequest}</td>
                      <td className="text-right">
                        <Link href={s.href} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gold-700 transition group-hover:bg-gold-500 group-hover:text-olive-900" aria-label={`${labels.siteNo} ${s.siteNumber}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 md:hidden">
            {filtered.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="card flex items-center gap-4 p-4 active:bg-gold-100/40">
                  <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-olive-900 text-gold-200">
                    <span className="text-[9px] uppercase tracking-wider opacity-70">{labels.siteNo}</span>
                    <span className="font-display text-xl font-semibold leading-none">{s.siteNumber}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-olive-900">{s.dimension || "—"}</span>
                      {s.areaSqft ? <span className="text-sm text-ink-500">· {formatNumber(s.areaSqft)} {labels.sqft}</span> : null}
                      {s.corner ? <span className="badge bg-gold-100 text-gold-700">{labels.corner}</span> : null}
                    </span>
                    <span className="mt-1 block text-sm text-ink-500">
                      {s.facing ? labels.facingLabels[s.facing] : ""}
                      {s.roadWidthFt ? ` · ${s.roadWidthFt} ft ${labels.road.toLowerCase()}` : ""}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <SiteStatusBadge status={s.status} label={labels.statusLabels[s.status]} />
                      <span className="font-semibold tabular-nums text-olive-900">{s.price ? formatINRShort(s.price, locale) : labels.onRequest}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
