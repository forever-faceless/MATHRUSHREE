import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageHeader, Section } from "@/components/admin/ui";
import { createProject } from "@/lib/actions/projects";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader title="New project" description="Save the basics first. Photos, layout plan, landmarks and sites are added on the next screen." back={{ href: "/admin/projects", label: "Projects" }} />
      <Section title="Project details">
        <ProjectForm action={createProject} submitLabel="Create project" />
      </Section>
    </>
  );
}
