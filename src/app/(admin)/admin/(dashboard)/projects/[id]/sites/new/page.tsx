import { notFound } from "next/navigation";
import { SiteForm } from "@/components/admin/SiteForm";
import { PageHeader, Section } from "@/components/admin/ui";
import { createSite } from "@/lib/actions/sites";
import { getProjectById } from "@/lib/db/queries";
import { isValidLatLng } from "@/lib/geo";

export const metadata = { title: "New site" };

export default async function NewSitePage({ params }: PageProps<"/admin/projects/[id]/sites/new">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const project = await getProjectById(id);
  if (!project) notFound();
  const origin = isValidLatLng(project.lat, project.lng) ? { lat: project.lat!, lng: project.lng! } : null;
  return (
    <>
      <PageHeader title="Add a site" description={`In ${project.nameEn}. Photos can be added after saving.`} back={{ href: `/admin/projects/${id}/sites`, label: "Sites" }} />
      <Section title="Site details">
        <SiteForm action={createSite.bind(null, id)} submitLabel="Create site" origin={origin} />
      </Section>
    </>
  );
}
