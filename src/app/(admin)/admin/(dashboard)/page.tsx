import { Plus } from "lucide-react";
import Link from "next/link";
import { LeadRow } from "@/components/admin/LeadRow";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { getDashboardStats } from "@/lib/db/queries";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick view of the society's listings and incoming enquiries."
        actions={
          <Link href="/admin/projects/new" className="btn-gold btn-sm">
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New enquiries" value={stats.leads.new} hint={`${stats.leads.contacted} contacted · ${stats.leads.qualified} qualified`} href="/admin/leads?status=new" />
        <StatCard label="Projects" value={stats.projects} href="/admin/projects" />
        <StatCard label="Sites listed" value={stats.sites} hint={`${stats.availableSites} available`} href="/admin/projects" />
        <StatCard label="Committee members" value={stats.committee} href="/admin/committee" />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-olive-900">Recent enquiries</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-gold-700 hover:underline">
            View all
          </Link>
        </div>
        {stats.recentLeads.length ? (
          <div className="space-y-3">
            {stats.recentLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} compact />
            ))}
          </div>
        ) : (
          <p className="card p-8 text-center text-sm text-ink-500">No enquiries yet. They will appear here as soon as a visitor submits the form.</p>
        )}
      </div>
    </>
  );
}
