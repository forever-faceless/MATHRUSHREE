import { notFound } from "next/navigation";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { PageHeader, Section } from "@/components/admin/ui";
import { saveTestimonial } from "@/lib/actions/testimonials";
import { getTestimonial, listAllProjects } from "@/lib/db/queries";

export default async function EditTestimonialPage({ params }: PageProps<"/admin/testimonials/[id]">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const [item, projects] = await Promise.all([getTestimonial(id), listAllProjects()]);
  if (!item) notFound();
  return (
    <>
      <PageHeader title={item.nameEn} back={{ href: "/admin/testimonials", label: "Testimonials" }} />
      <Section title="Testimonial">
        <TestimonialForm item={item} projects={projects.map((p) => ({ id: p.id, name: p.nameEn }))} action={saveTestimonial.bind(null, id)} />
      </Section>
    </>
  );
}
