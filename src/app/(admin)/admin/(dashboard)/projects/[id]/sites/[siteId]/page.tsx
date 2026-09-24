import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteForm } from "@/components/admin/SiteForm";
import { SiteImages } from "@/components/admin/SiteImages";
import { ConfirmButton, PageHeader, Section } from "@/components/admin/ui";
import { deleteSite, removeSiteImage, updateSite, uploadSiteImages } from "@/lib/actions/sites";
import { getProjectById, getSiteById } from "@/lib/db/queries";
import { isValidLatLng } from "@/lib/geo";

export default async function EditSitePage({ params, searchParams }: PageProps<"/admin/projects/[id]/sites/[siteId]">) {
  const { id: rawId, siteId: rawSiteId } = await params;
  const { created } = await searchParams;
  const id = Number(rawId);
  const siteId = Number(rawSiteId);
  if (!Number.isInteger(id) || !Number.isInteger(siteId)) notFound();
  const [project, site] = await Promise.all([getProjectById(id), getSiteById(siteId)]);
  if (!project || !site || site.projectId !== id) notFound();
  const origin = isValidLatLng(project.lat, project.lng) ? { lat: project.lat!, lng: project.lng! } : null;

  return (
    <>
      <PageHeader
        title={`Site ${site.siteNumber}`}
        description={created ? "Site created. You can add photos below." : `${project.nameEn} · ${site.dimension || "—"} · ${site.status}`}
        back={{ href: `/admin/projects/${id}/sites`, label: "Sites" }}
        actions={
          <a href={`/en/projects/${project.slug}/sites/${encodeURIComponent(site.siteNumber)}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
            <ExternalLink className="h-4 w-4" /> View on website
          </a>
        }
      />
      <div className="space-y-8">
        <Section title="Site details">
          <SiteForm site={site} action={updateSite.bind(null, siteId)} origin={origin} />
        </Section>
        <Section title="Photos">
          <SiteImages images={site.images} uploadAction={uploadSiteImages.bind(null, siteId)} removeAction={removeSiteImage.bind(null, siteId)} />
        </Section>
        <Section title="Danger zone">
          <ConfirmButton action={deleteSite.bind(null, siteId)} label="Delete this site" confirmLabel="Yes, delete site" size="md" />
        </Section>
      </div>
    </>
  );
}
