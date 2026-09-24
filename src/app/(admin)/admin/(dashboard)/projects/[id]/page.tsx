import { ExternalLink, LandPlot } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandmarkEditor } from "@/components/admin/LandmarkEditor";
import { MediaManager } from "@/components/admin/MediaManager";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ConfirmButton, PageHeader, Section } from "@/components/admin/ui";
import { deleteLandmark, saveLandmark } from "@/lib/actions/landmarks";
import { deleteProject, removeProjectImage, setProjectCover, updateProject, uploadProjectMedia } from "@/lib/actions/projects";
import { getProjectById, listLandmarks, listSites } from "@/lib/db/queries";
import { isValidLatLng } from "@/lib/geo";

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id: rawId } = await params;
  const { created } = await searchParams;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const project = await getProjectById(id);
  if (!project) notFound();
  const [landmarks, sites] = await Promise.all([listLandmarks(id), listSites(id)]);
  const origin = isValidLatLng(project.lat, project.lng) ? { lat: project.lat!, lng: project.lng! } : null;

  return (
    <>
      <PageHeader
        title={project.nameEn}
        description={created ? "Project created. Now add photos, the layout plan, nearby landmarks and the sites." : `${sites.length} sites listed · ${landmarks.length} landmarks`}
        back={{ href: "/admin/projects", label: "Projects" }}
        actions={
          <>
            <Link href={`/admin/projects/${id}/sites`} className="btn-gold btn-sm">
              <LandPlot className="h-4 w-4" /> Manage sites ({sites.length})
            </Link>
            <a href={`/en/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
              <ExternalLink className="h-4 w-4" /> View on website
            </a>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {[
          ["#details", "Details"],
          ["#media", "Photos & plan"],
          ["#landmarks", "Nearby landmarks"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full border border-olive-900/15 bg-white px-3.5 py-1.5 font-semibold text-ink-700 hover:border-olive-900/40">
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-8">
        <Section id="details" title="Project details">
          <ProjectForm project={project} action={updateProject.bind(null, id)} />
        </Section>

        <Section id="media" title="Photos, layout plan & brochure" description="Upload JPG, PNG or WebP photos. They are resized and converted automatically.">
          <MediaManager project={project} uploadAction={uploadProjectMedia.bind(null, id)} removeAction={removeProjectImage.bind(null, id)} setCoverAction={setProjectCover.bind(null, id)} />
        </Section>

        <Section id="landmarks" title="Nearby landmarks & distances" description={origin ? "Distances are measured from the layout's GPS location above." : "Set the layout GPS location in Details first so distances can be calculated."}>
          <LandmarkEditor landmarks={landmarks} origin={origin} saveAction={saveLandmark.bind(null, id)} deleteAction={deleteLandmark} />
        </Section>

        <Section title="Danger zone" description="Deleting a project also deletes all its sites, landmarks and photos. Enquiries are kept.">
          <ConfirmButton action={deleteProject.bind(null, id)} label="Delete this project" confirmLabel="Yes, delete everything" size="md" />
        </Section>
      </div>
    </>
  );
}
