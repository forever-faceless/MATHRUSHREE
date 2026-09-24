"use server";

import { headers } from "next/headers";
import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { leadSchema } from "@/lib/validation";
import { normalisePhone } from "@/lib/utils";

export type EnquiryState =
  | { status: "idle" }
  | { status: "success"; leadId: number }
  | { status: "error"; code: "invalid_phone" | "invalid_name" | "consent_required" | "too_many" | "generic" };

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    projectId: formData.get("projectId") ?? "",
    siteId: formData.get("siteId") ?? "",
    purpose: formData.get("purpose") ?? "self_use",
    budget: formData.get("budget") ?? "",
    timeline: formData.get("timeline") ?? "",
    message: formData.get("message") ?? "",
    locale: formData.get("locale") ?? "en",
    source: formData.get("source") ?? "",
    consent: formData.get("consent") === "on",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const paths = parsed.error.issues.map((i) => String(i.path[0]));
    if (paths.includes("website")) return { status: "success", leadId: 0 }; // bot: pretend success
    if (paths.includes("phone")) return { status: "error", code: "invalid_phone" };
    if (paths.includes("name")) return { status: "error", code: "invalid_name" };
    if (paths.includes("consent")) return { status: "error", code: "consent_required" };
    return { status: "error", code: "generic" };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "local").split(",")[0].trim();
  const phone = normalisePhone(parsed.data.phone);
  if (rateLimited(ip) || rateLimited(`phone:${phone}`)) {
    return { status: "error", code: "too_many" };
  }

  try {
    const db = await getDb();
    const [row] = await db
      .insert(leads)
      .values({
        name: parsed.data.name,
        phone,
        email: parsed.data.email,
        projectId: parsed.data.projectId,
        siteId: parsed.data.siteId,
        purpose: parsed.data.purpose,
        budget: parsed.data.budget,
        timeline: parsed.data.timeline,
        message: parsed.data.message,
        locale: parsed.data.locale,
        source: parsed.data.source,
      })
      .returning({ id: leads.id });
    return { status: "success", leadId: row.id };
  } catch (error) {
    console.error("enquiry insert failed", error);
    return { status: "error", code: "generic" };
  }
}
