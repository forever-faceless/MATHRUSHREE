import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { PageHeader, Section } from "@/components/admin/ui";
import { saveTestimonial } from "@/lib/actions/testimonials";
import { listAllProjects } from "@/lib/db/queries";

export const metadata = { title: "Add testimonial" };

export default async function NewTestimonialPage() {
  const projects = await listAllProjects();
  return (
    <>
      <PageHeader title="Add testimonial" back={{ href: "/admin/testimonials", label: "Testimonials" }} />
      <Section title="Testimonial">
        <TestimonialForm projects={projects.map((p) => ({ id: p.id, name: p.nameEn }))} action={saveTestimonial.bind(null, null)} />
      </Section>
    </>
  );
}
