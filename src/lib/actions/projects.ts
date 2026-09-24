"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { getProjectById, slugExists } from "@/lib/db/queries";
import { projects } from "@/lib/db/schema";
import { formFile, formFiles, parseApprovalLines, parseBilingualLines, type ActionState, zodFieldErrors } from "@/lib/forms";
import { deleteStored, saveDocument, saveImage, UploadError } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { projectSchema } from "@/lib/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

function readProjectForm(formData: FormData) {
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  return projectSchema.safeParse({
    nameEn,
    nameKn: formData.get("nameKn") ?? "",
    slug: slugify(rawSlug || nameEn),
    taglineEn: formData.get("taglineEn") ?? "",
    taglineKn: formData.get("taglineKn") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
    descriptionKn: formData.get("descriptionKn") ?? "",
    locationEn: formData.get("locationEn") ?? "",
    locationKn: formData.get("locationKn") ?? "",
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
    totalAreaAcres: formData.get("totalAreaAcres") ?? "",
    totalSites: formData.get("totalSites") ?? "",
    status: formData.get("status") ?? "ongoing",
    priceFrom: formData.get("priceFrom") ?? "",
    pricePerSqft: formData.get("pricePerSqft") ?? "",
    brochureUrl: formData.get("brochureUrl") ?? "",
    videoUrl: formData.get("videoUrl") ?? "",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = readProjectForm(formData);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  if (await slugExists(parsed.data.slug)) {
    return { error: "A project with this URL slug already exists.", fieldErrors: { slug: "Already in use" } };
  }
  const db = await getDb();
  const [row] = await db
    .insert(projects)
    .values({
      ...parsed.data,
      amenities: parseBilingualLines(String(formData.get("amenities") ?? "")),
      approvals: parseApprovalLines(String(formData.get("approvals") ?? "")),
    })
    .returning({ id: projects.id });
  revalidateAll();
  redirect(`/admin/projects/${row.id}?created=1`);
}

export async function updateProject(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const existing = await getProjectById(id);
  if (!existing) return { error: "Project not found." };
  const parsed = readProjectForm(formData);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  if (await slugExists(parsed.data.slug, id)) {
    return { error: "A project with this URL slug already exists.", fieldErrors: { slug: "Already in use" } };
  }
  const db = await getDb();
  await db
    .update(projects)
    .set({
      ...parsed.data,
      amenities: parseBilingualLines(String(formData.get("amenities") ?? "")),
      approvals: parseApprovalLines(String(formData.get("approvals") ?? "")),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));
  revalidateAll();
  return { success: "Project saved." };
}

export async function uploadProjectMedia(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const existing = await getProjectById(id);
  if (!existing) return { error: "Project not found." };
  const db = await getDb();
  const patch: Partial<typeof projects.$inferInsert> = {};
  try {
    const cover = formFile(formData, "coverImage");
    if (cover) {
      patch.coverImage = await saveImage(cover, "projects");
      if (existing.coverImage) await deleteStored(existing.coverImage);
    }
    const plan = formFile(formData, "layoutPlanImage");
    if (plan) {
      patch.layoutPlanImage = await saveImage(plan, "plans");
      if (existing.layoutPlanImage) await deleteStored(existing.layoutPlanImage);
    }
    const brochure = formFile(formData, "brochure");
    if (brochure) {
      patch.brochureUrl = await saveDocument(brochure, "brochures");
      if (existing.brochureUrl.startsWith("/uploads/")) await deleteStored(existing.brochureUrl);
    }
    const gallery = formFiles(formData, "gallery");
    if (gallery.length) {
      const urls: string[] = [];
      for (const file of gallery.slice(0, 20)) urls.push(await saveImage(file, "gallery"));
      patch.gallery = [...existing.gallery, ...urls];
    }
  } catch (error) {
    if (error instanceof UploadError) return { error: error.message };
    console.error(error);
    return { error: "Upload failed. Please try smaller images." };
  }
  if (Object.keys(patch).length === 0) return { error: "Choose at least one file to upload." };
  await db.update(projects).set({ ...patch, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidateAll();
  return { success: "Media uploaded." };
}

export async function removeProjectImage(id: number, url: string, kind: "gallery" | "cover" | "plan"): Promise<void> {
  await requireAdmin();
  const existing = await getProjectById(id);
  if (!existing) return;
  const db = await getDb();
  if (kind === "gallery") {
    await db
      .update(projects)
      .set({ gallery: existing.gallery.filter((g) => g !== url), updatedAt: new Date() })
      .where(eq(projects.id, id));
  } else if (kind === "cover") {
    await db.update(projects).set({ coverImage: "", updatedAt: new Date() }).where(eq(projects.id, id));
  } else {
    await db.update(projects).set({ layoutPlanImage: "", updatedAt: new Date() }).where(eq(projects.id, id));
  }
  await deleteStored(url);
  revalidateAll();
}

export async function setProjectCover(id: number, url: string): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  await db.update(projects).set({ coverImage: url, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidateAll();
}

export async function deleteProject(id: number): Promise<void> {
  await requireAdmin();
  const existing = await getProjectById(id);
  if (!existing) return;
  const db = await getDb();
  await db.delete(projects).where(eq(projects.id, id));
  for (const url of [existing.coverImage, existing.layoutPlanImage, ...existing.gallery]) await deleteStored(url);
  revalidateAll();
  redirect("/admin/projects");
}

export async function toggleProjectPublished(id: number, published: boolean): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  await db.update(projects).set({ published, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidateAll();
}
