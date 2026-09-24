import { getSession } from "@/lib/auth";
import { listLeads } from "@/lib/db/queries";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const leads = await listLeads();
  const header = ["Date", "Name", "Phone", "Email", "Project", "Site", "Purpose", "Budget", "Timeline", "Message", "Language", "Status", "Notes", "Source"];
  const lines = [header.join(",")];
  for (const l of leads) {
    lines.push(
      [l.createdAt.toISOString(), l.name, l.phone, l.email, l.projectName ?? "", l.siteNumber ?? "", l.purpose, l.budget, l.timeline, l.message, l.locale, l.status, l.notes, l.source]
        .map(csvCell)
        .join(","),
    );
  }
  const body = "﻿" + lines.join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
