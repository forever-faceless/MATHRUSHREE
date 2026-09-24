import type { MetadataRoute } from "next";
import { listPublishedProjects, listSites } from "@/lib/db/queries";
import { locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];
  const staticPaths = ["", "/projects", "/about", "/committee", "/contact", "/enquire"];
  for (const locale of locales) {
    for (const p of staticPaths) {
      entries.push({ url: `${base}/${locale}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    }
  }
  const projects = await listPublishedProjects();
  for (const project of projects) {
    const sites = await listSites(project.id);
    for (const locale of locales) {
      entries.push({ url: `${base}/${locale}/projects/${project.slug}`, lastModified: project.updatedAt, changeFrequency: "weekly", priority: 0.8 });
      for (const site of sites) {
        entries.push({ url: `${base}/${locale}/projects/${project.slug}/sites/${encodeURIComponent(site.siteNumber)}`, lastModified: site.updatedAt, changeFrequency: "weekly", priority: 0.5 });
      }
    }
  }
  return entries;
}
