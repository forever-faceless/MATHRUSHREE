import { Download } from "lucide-react";
import Link from "next/link";
import { LeadRow } from "@/components/admin/LeadRow";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { countLeadsByStatus, listLeads } from "@/lib/db/queries";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export const metadata = { title: "Enquiries" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const { status } = await searchParams;
  const active = typeof status === "string" && (LEAD_STATUSES as readonly string[]).includes(status) ? (status as LeadStatus) : undefined;
  const [leads, counts] = await Promise.all([listLeads(active), countLeadsByStatus()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Every form submission from the website. Call or WhatsApp with one tap, then update the status so the committee knows who has been contacted."
        actions={
          // A route handler returns a CSV download, so this is a plain anchor rather than a client navigation.
          <a href="/admin/leads/export" className="btn-outline btn-sm" download>
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/leads" className={cn("rounded-full border px-4 py-2 text-[13px] font-semibold", !active ? "border-olive-900 bg-olive-900 text-gold-200" : "border-olive-900/15 bg-white text-ink-700")}>
          All ({total})
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link key={s} href={`/admin/leads?status=${s}`} className={cn("rounded-full border px-4 py-2 text-[13px] font-semibold capitalize", active === s ? "border-olive-900 bg-olive-900 text-gold-200" : "border-olive-900/15 bg-white text-ink-700")}>
            {s} ({counts[s]})
          </Link>
        ))}
      </div>
      {leads.length ? (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <EmptyState title="No enquiries here" text="Enquiries submitted through the website will show up in this list." />
      )}
    </>
  );
}
