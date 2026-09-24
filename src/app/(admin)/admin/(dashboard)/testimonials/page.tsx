import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { ConfirmButton, EmptyState, PageHeader } from "@/components/admin/ui";
import { deleteTestimonial } from "@/lib/actions/testimonials";
import { listTestimonials } from "@/lib/db/queries";

export const metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const items = await listTestimonials(false);
  return (
    <>
      <PageHeader
        title="Member testimonials"
        description="Short quotes from members build trust with new visitors. Three are shown on the home page."
        actions={
          <Link href="/admin/testimonials/new" className="btn-gold btn-sm">
            <Plus className="h-4 w-4" /> Add testimonial
          </Link>
        }
      />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <article key={t.id} className="card p-5">
              <p className="font-display text-lg text-olive-900">“{t.quoteEn}”</p>
              {t.quoteKn ? (
                <p className="mt-2 text-sm text-ink-500" lang="kn">
                  {t.quoteKn}
                </p>
              ) : null}
              <p className="mt-3 text-sm font-semibold text-olive-900">
                {t.nameEn} {t.locationEn ? <span className="font-normal text-ink-500">· {t.locationEn}</span> : null}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {!t.published ? <span className="badge bg-olive-100 text-olive-700">Hidden</span> : null}
                <Link href={`/admin/testimonials/${t.id}`} className="btn-outline btn-sm ml-auto">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <ConfirmButton action={deleteTestimonial.bind(null, t.id)} label="Remove" confirmLabel="Confirm" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No testimonials yet" text="Ask a few members for a sentence about their experience and add them here." />
      )}
    </>
  );
}
