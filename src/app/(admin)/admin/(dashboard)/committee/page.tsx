import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { CommitteeCard } from "@/components/site/CommitteeCard";
import { ConfirmButton, EmptyState, PageHeader } from "@/components/admin/ui";
import { deleteCommitteeMember } from "@/lib/actions/committee";
import { listCommittee } from "@/lib/db/queries";

export const metadata = { title: "Committee" };

export default async function AdminCommitteePage() {
  const members = await listCommittee(false);
  return (
    <>
      <PageHeader
        title="Managing committee"
        description="Members appear on the home page, the About page and the Committee page in the order set here."
        actions={
          <Link href="/admin/committee/new" className="btn-gold btn-sm">
            <Plus className="h-4 w-4" /> Add member
          </Link>
        }
      />
      {members.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((m) => (
            <div key={m.id} className="space-y-2">
              <CommitteeCard member={m} locale="en" compact />
              <div className="flex items-center gap-2 pl-1">
                {!m.published ? <span className="badge bg-olive-100 text-olive-700">Hidden</span> : null}
                <span className="text-xs text-ink-400">Order {m.sortOrder}</span>
                <Link href={`/admin/committee/${m.id}`} className="btn-outline btn-sm ml-auto">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <ConfirmButton action={deleteCommitteeMember.bind(null, m.id)} label="Remove" confirmLabel="Confirm" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No committee members yet"
          text="Add the president, secretary, treasurer and directors with a photo and a short bio."
          action={
            <Link href="/admin/committee/new" className="btn-gold">
              <Plus className="h-4 w-4" /> Add member
            </Link>
          }
        />
      )}
    </>
  );
}
