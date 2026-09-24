import { Eye, EyeOff, LandPlot, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { BrandImage } from "@/components/site/BrandImage";
import { ProjectStatusBadge } from "@/components/site/StatusBadge";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { listAllProjects } from "@/lib/db/queries";
import { en } from "@/lib/i18n/dictionaries/en";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await listAllProjects();
  return (
    <>
      <PageHeader
        title="Projects & sites"
        description="Each project is a layout. Open a project to edit its details, photos, landmarks and the sites inside it."
        actions={
          <Link href="/admin/projects/new" className="btn-gold btn-sm">
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />
      {projects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="card overflow-hidden">
              <BrandImage src={p.coverImage} alt={p.nameEn} wrapperClassName="aspect-[16/9]" sizes="(min-width: 1280px) 33vw, 50vw" />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <ProjectStatusBadge status={p.status} label={en.status.project[p.status]} />
                  {p.published ? (
                    <span className="badge bg-success-100 text-success-600">
                      <Eye className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="badge bg-olive-100 text-olive-700">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </span>
                  )}
                  {p.featured ? <span className="badge bg-gold-100 text-gold-700">Featured</span> : null}
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold text-olive-900">{p.nameEn}</h2>
                {p.nameKn ? <p className="text-sm text-ink-500">{p.nameKn}</p> : null}
                <p className="mt-2 text-sm text-ink-500">
                  {p.siteCount} sites listed · {p.availableCount} available
                  {p.totalSites ? ` · ${p.totalSites} total` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/projects/${p.id}`} className="btn-olive btn-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <Link href={`/admin/projects/${p.id}/sites`} className="btn-outline btn-sm">
                    <LandPlot className="h-3.5 w-3.5" /> Sites
                  </Link>
                  <a href={`/en/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
                    View
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          text="Create your first layout. You can add sites, photos and nearby landmarks after saving."
          action={
            <Link href="/admin/projects/new" className="btn-gold">
              <Plus className="h-4 w-4" /> New project
            </Link>
          }
        />
      )}
    </>
  );
}
