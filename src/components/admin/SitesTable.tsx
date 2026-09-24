"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SiteStatusBadge } from "@/components/site/StatusBadge";
import { SITE_STATUSES, type Site, type SiteStatus } from "@/lib/db/schema";
import { en } from "@/lib/i18n/dictionaries/en";
import { formatINRShort, formatNumber } from "@/lib/utils";

export function SitesTable({ projectId, sites, setStatusAction, bulkAction }: { projectId: number; sites: Site[]; setStatusAction: (id: number, status: SiteStatus) => Promise<void>; bulkAction: (formData: FormData) => Promise<void> }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, start] = useTransition();
  const allSelected = sites.length > 0 && selected.size === sites.length;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={bulkAction} className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-olive-900/8 bg-olive-50 px-4 py-3 text-sm">
        <label className="inline-flex items-center gap-2 font-medium">
          <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(sites.map((s) => s.id)))} className="h-4 w-4 accent-gold-600" />
          Select all
        </label>
        <span className="text-ink-500">{selected.size} selected</span>
        <div className="ml-auto flex items-center gap-2">
          <select name="status" className="field w-auto py-1.5 text-sm" defaultValue="available">
            {SITE_STATUSES.map((s) => (
              <option key={s} value={s}>
                Mark as {en.status.site[s].toLowerCase()}
              </option>
            ))}
          </select>
          <button type="submit" disabled={selected.size === 0} className="btn-olive btn-sm">
            Apply
          </button>
        </div>
      </div>
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="siteId" value={id} />
      ))}
      <div className="overflow-x-auto">
        <table className="table-soft w-full min-w-[820px]">
          <thead>
            <tr>
              <th className="w-10" />
              <th>Site</th>
              <th>Dimension</th>
              <th>Area</th>
              <th>Facing</th>
              <th>Road</th>
              <th>Price</th>
              <th>Status</th>
              <th>GPS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id} className={selected.has(s.id) ? "bg-gold-100/40" : undefined}>
                <td>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 accent-gold-600" aria-label={`Select site ${s.siteNumber}`} />
                </td>
                <td className="font-display text-lg font-semibold text-olive-900">
                  {s.siteNumber}
                  {s.corner ? <span className="ml-2 badge bg-gold-100 text-gold-700">Corner</span> : null}
                </td>
                <td>{s.dimension || "—"}</td>
                <td>{s.areaSqft ? `${formatNumber(s.areaSqft)} sq ft` : "—"}</td>
                <td>{s.facing ? en.facing[s.facing] : "—"}</td>
                <td>{s.roadWidthFt ? `${s.roadWidthFt} ft` : "—"}</td>
                <td className="tabular-nums">{s.price ? formatINRShort(s.price) : "—"}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <SiteStatusBadge status={s.status} label={en.status.site[s.status]} />
                    <select
                      value={s.status}
                      disabled={pending}
                      onChange={(e) => start(() => setStatusAction(s.id, e.target.value as SiteStatus))}
                      className="field w-auto py-1 text-xs"
                      aria-label={`Change status of site ${s.siteNumber}`}
                    >
                      {SITE_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {en.status.site[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="text-xs text-ink-500">{s.lat != null && s.lng != null ? "Yes" : "—"}</td>
                <td className="text-right">
                  <Link href={`/admin/projects/${projectId}/sites/${s.id}`} className="btn-outline btn-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
