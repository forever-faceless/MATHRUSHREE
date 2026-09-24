import { CommitteeForm } from "@/components/admin/CommitteeForm";
import { PageHeader, Section } from "@/components/admin/ui";
import { saveCommitteeMember } from "@/lib/actions/committee";

export const metadata = { title: "Add committee member" };

export default function NewCommitteeMemberPage() {
  return (
    <>
      <PageHeader title="Add committee member" back={{ href: "/admin/committee", label: "Committee" }} />
      <Section title="Member details">
        <CommitteeForm action={saveCommitteeMember.bind(null, null)} />
      </Section>
    </>
  );
}
