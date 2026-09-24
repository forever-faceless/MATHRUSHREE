import { notFound } from "next/navigation";
import { CommitteeForm } from "@/components/admin/CommitteeForm";
import { PageHeader, Section } from "@/components/admin/ui";
import { removeCommitteePhoto, saveCommitteeMember } from "@/lib/actions/committee";
import { getCommitteeMember } from "@/lib/db/queries";
import { ConfirmButton } from "@/components/admin/ui";

export default async function EditCommitteeMemberPage({ params }: PageProps<"/admin/committee/[id]">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const member = await getCommitteeMember(id);
  if (!member) notFound();
  return (
    <>
      <PageHeader title={member.nameEn} back={{ href: "/admin/committee", label: "Committee" }} />
      <Section title="Member details">
        <CommitteeForm member={member} action={saveCommitteeMember.bind(null, id)} />
        {member.photo ? (
          <div className="mt-6 border-t border-olive-900/8 pt-5">
            <ConfirmButton action={removeCommitteePhoto.bind(null, id)} label="Remove photo" confirmLabel="Confirm remove" />
          </div>
        ) : null}
      </Section>
    </>
  );
}
