import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BulkSitesForm } from "@/components/admin/BulkSitesForm";
import { SitesTable } from "@/components/admin/SitesTable";
import { EmptyState, PageHeader, Section } from "@/components/admin/ui";
import { bulkCreateSites, bulkSetStatus, setSiteStatus } from "@/lib/actions/sites";
import { getProjectById, listSites } from "@/lib/db/queries";

export const metadata = { title: "Sites" };

export default async function ProjectSitesPage({ params }: PageProps<"/admin/projects/[id]/sites">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const project = await getProjectById(id);
  if (!project) notFound();
  const sites = await listSites(id);
  const available = sites.filter((s) => s.status === "available").length;

  return (
    <>
      <PageHeader
        title={`Sites · ${project.nameEn}`}
        description={`${sites.length} sites listed · ${available} available. Change a status directly in the table, or select several and apply a status at once.`}
        back={{ href: `/admin/projects/${id}`, label: project.nameEn }}
        actions={
          <Link href={`/admin/projects/${id}/sites/new`} className="btn-gold btn-sm">
            <Plus className="h-4 w-4" /> Add one site
          </Link>
        }
      />

      {sites.length ? (
        <SitesTable projectId={id} sites={sites} setStatusAction={setSiteStatus} bulkAction={bulkSetStatus.bind(null, id)} />
      ) : (
        <EmptyState title="No sites yet" text="Create a numbered run of sites below, or add sites one by one with full details." />
      )}

      <Section title="Create many sites at once" description="Generates a numbered run with shared parameters. Existing site numbers are skipped, so it is safe to run again for a different dimension." className="mt-8">
        <BulkSitesForm action={bulkCreateSites.bind(null, id)} />
      </Section>
    </>
  );
}
