"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { getProjectById, getSiteById, siteNumberExists } from "@/lib/db/queries";
import { FACINGS, SITE_STATUSES, sites, type SiteStatus } from "@/lib/db/schema";
import { formFiles, parseBilingualLines, type ActionState, zodFieldErrors } from "@/lib/forms";
import { deleteStored, saveImage, UploadError } from "@/lib/storage";
import { siteSchema } from "@/lib/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

function readSiteForm(formData: FormData) {
  const width = formData.get("widthFt");
  const depth = formData.get("depthFt");
  const dimension = String(formData.get("dimension") ?? "").trim() || (width && depth ? `${width} × ${depth}` : "");
  let area = formData.get("areaSqft");
  if ((area == null || area === "") && width && depth) area = String(Number(width) * Number(depth));
  return siteSchema.safeParse({
    siteNumber: formData.get("siteNumber") ?? "",
    dimension,
    widthFt: width ?? "",
    depthFt: depth ?? "",
    areaSqft: area ?? "",
    facing: formData.get("facing") ?? "",
    roadWidthFt: formData.get("roadWidthFt") ?? "",
    corner: formData.get("corner") === "on",
    status: formData.get("status") ?? "available",
    price: formData.get("price") ?? "",
    pricePerSqft: formData.get("pricePerSqft") ?? "",
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
    descriptionKn: formData.get("descriptionKn") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
}

export async function createSite(projectId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  if (!(await getProjectById(projectId))) return { error: "Project not found." };
  const parsed = readSiteForm(formData);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  if (await siteNumberExists(projectId, parsed.data.siteNumber)) {
    return { error: `Site ${parsed.data.siteNumber} already exists in this project.`, fieldErrors: { siteNumber: "Duplicate" } };
  }
  const db = await getDb();
  const [row] = await db
    .insert(sites)
    .values({
      ...parsed.data,
      facing: parsed.data.facing || null,
      projectId,
      features: parseBilingualLines(String(formData.get("features") ?? "")),
    })
    .returning({ id: sites.id });
  revalidateAll();
  redirect(`/admin/projects/${projectId}/sites/${row.id}?created=1`);
}

export async function updateSite(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const existing = await getSiteById(id);
  if (!existing) return { error: "Site not found." };
  const parsed = readSiteForm(formData);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  if (await siteNumberExists(existing.projectId, parsed.data.siteNumber, id)) {
    return { error: `Site ${parsed.data.siteNumber} already exists in this project.`, fieldErrors: { siteNumber: "Duplicate" } };
  }
  const db = await getDb();
  await db
    .update(sites)
    .set({
      ...parsed.data,
      facing: parsed.data.facing || null,
      features: parseBilingualLines(String(formData.get("features") ?? "")),
      updatedAt: new Date(),
    })
    .where(eq(sites.id, id));
  revalidateAll();
  return { success: "Site saved." };
}

export async function uploadSiteImages(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const existing = await getSiteById(id);
  if (!existing) return { error: "Site not found." };
  const files = formFiles(formData, "images");
  if (!files.length) return { error: "Choose at least one image." };
  const urls: string[] = [];
  try {
    for (const file of files.slice(0, 12)) urls.push(await saveImage(file, "sites"));
  } catch (error) {
    if (error instanceof UploadError) return { error: error.message };
    return { error: "Upload failed." };
  }
  const db = await getDb();
  await db.update(sites).set({ images: [...existing.images, ...urls], updatedAt: new Date() }).where(eq(sites.id, id));
  revalidateAll();
  return { success: `${urls.length} image(s) uploaded.` };
}

export async function removeSiteImage(id: number, url: string): Promise<void> {
  await requireAdmin();
  const existing = await getSiteById(id);
  if (!existing) return;
  const db = await getDb();
  await db
    .update(sites)
    .set({ images: existing.images.filter((u) => u !== url), updatedAt: new Date() })
    .where(eq(sites.id, id));
  await deleteStored(url);
  revalidateAll();
}

export async function setSiteStatus(id: number, status: SiteStatus): Promise<void> {
  await requireAdmin();
  if (!SITE_STATUSES.includes(status)) return;
  const db = await getDb();
  await db.update(sites).set({ status, updatedAt: new Date() }).where(eq(sites.id, id));
  revalidateAll();
}

export async function deleteSite(id: number): Promise<void> {
  await requireAdmin();
  const existing = await getSiteById(id);
  if (!existing) return;
  const db = await getDb();
  await db.delete(sites).where(eq(sites.id, id));
  for (const url of existing.images) await deleteStored(url);
  revalidateAll();
  redirect(`/admin/projects/${existing.projectId}/sites`);
}

/**
 * Creates a numbered run of sites with shared parameters, skipping numbers that already exist.
 * Example: prefix "A-", from 1 to 40, 30 × 40, East facing, ₹1,450 per sq ft.
 */
export async function bulkCreateSites(projectId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  if (!(await getProjectById(projectId))) return { error: "Project not found." };
  const from = Number(formData.get("from") ?? 1);
  const to = Number(formData.get("to") ?? 0);
  const prefix = String(formData.get("prefix") ?? "").trim();
  const width = Number(formData.get("widthFt") ?? 0) || null;
  const depth = Number(formData.get("depthFt") ?? 0) || null;
  const areaInput = Number(formData.get("areaSqft") ?? 0) || null;
  const area = areaInput ?? (width && depth ? width * depth : null);
  const dimension = String(formData.get("dimension") ?? "").trim() || (width && depth ? `${width} × ${depth}` : "");
  const facingRaw = String(formData.get("facing") ?? "");
  const facing = (FACINGS as readonly string[]).includes(facingRaw) ? (facingRaw as (typeof FACINGS)[number]) : null;
  const roadWidth = Number(formData.get("roadWidthFt") ?? 0) || null;
  const pricePerSqft = Number(formData.get("pricePerSqft") ?? 0) || null;
  const priceInput = Number(formData.get("price") ?? 0) || null;
  const statusRaw = String(formData.get("status") ?? "available");
  const status = (SITE_STATUSES as readonly string[]).includes(statusRaw) ? (statusRaw as SiteStatus) : "available";

  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from || to - from > 999) {
    return { error: "Enter a valid number range (at most 1,000 sites at a time)." };
  }

  const db = await getDb();
  const existing = await db.query.sites.findMany({
    where: eq(sites.projectId, projectId),
    columns: { siteNumber: true },
  });
  const taken = new Set(existing.map((s) => s.siteNumber));
  const rows = [];
  for (let n = from; n <= to; n++) {
    const siteNumber = `${prefix}${n}`;
    if (taken.has(siteNumber)) continue;
    rows.push({
      projectId,
      siteNumber,
      dimension,
      widthFt: width,
      depthFt: depth,
      areaSqft: area,
      facing,
      roadWidthFt: roadWidth,
      status,
      pricePerSqft,
      price: priceInput ?? (pricePerSqft && area ? Math.round(pricePerSqft * area) : null),
      sortOrder: n,
    });
  }
  if (!rows.length) return { error: "All site numbers in that range already exist." };
  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(sites).values(rows.slice(i, i + 100));
  }
  revalidateAll();
  return { success: `${rows.length} sites created.` };
}

export async function bulkSetStatus(projectId: number, formData: FormData): Promise<void> {
  await requireAdmin();
  const statusRaw = String(formData.get("status") ?? "");
  if (!(SITE_STATUSES as readonly string[]).includes(statusRaw)) return;
  const ids = formData
    .getAll("siteId")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (!ids.length) return;
  const db = await getDb();
  for (const id of ids) {
    await db
      .update(sites)
      .set({ status: statusRaw as SiteStatus, updatedAt: new Date() })
      .where(and(eq(sites.id, id), eq(sites.projectId, projectId)));
  }
  revalidateAll();
}
