"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { getTestimonial } from "@/lib/db/queries";
import { testimonials } from "@/lib/db/schema";
import { formFile, type ActionState, zodFieldErrors } from "@/lib/forms";
import { deleteStored, saveImage, UploadError } from "@/lib/storage";
import { testimonialSchema } from "@/lib/validation";

export async function saveTestimonial(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse({
    nameEn: formData.get("nameEn") ?? "",
    nameKn: formData.get("nameKn") ?? "",
    locationEn: formData.get("locationEn") ?? "",
    locationKn: formData.get("locationKn") ?? "",
    quoteEn: formData.get("quoteEn") ?? "",
    quoteKn: formData.get("quoteKn") ?? "",
    projectId: formData.get("projectId") ?? "",
    published: formData.get("published") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  let photo: string | undefined;
  const file = formFile(formData, "photo");
  try {
    if (file) photo = await saveImage(file, "testimonials");
  } catch (error) {
    return { error: error instanceof UploadError ? error.message : "Photo upload failed." };
  }
  const db = await getDb();
  if (id) {
    const existing = await getTestimonial(id);
    if (!existing) return { error: "Testimonial not found." };
    await db
      .update(testimonials)
      .set({ ...parsed.data, ...(photo ? { photo } : {}) })
      .where(eq(testimonials.id, id));
    if (photo && existing.photo) await deleteStored(existing.photo);
    revalidatePath("/", "layout");
    return { success: "Saved." };
  }
  await db.insert(testimonials).values({ ...parsed.data, photo: photo ?? "" });
  revalidatePath("/", "layout");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(id: number): Promise<void> {
  await requireAdmin();
  const existing = await getTestimonial(id);
  if (!existing) return;
  const db = await getDb();
  await db.delete(testimonials).where(eq(testimonials.id, id));
  await deleteStored(existing.photo);
  revalidatePath("/", "layout");
}
