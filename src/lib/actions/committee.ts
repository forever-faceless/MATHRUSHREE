"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { getCommitteeMember } from "@/lib/db/queries";
import { committeeMembers } from "@/lib/db/schema";
import { formFile, type ActionState, zodFieldErrors } from "@/lib/forms";
import { deleteStored, saveImage, UploadError } from "@/lib/storage";
import { committeeSchema } from "@/lib/validation";

function read(formData: FormData) {
  return committeeSchema.safeParse({
    nameEn: formData.get("nameEn") ?? "",
    nameKn: formData.get("nameKn") ?? "",
    roleEn: formData.get("roleEn") ?? "",
    roleKn: formData.get("roleKn") ?? "",
    phone: formData.get("phone") ?? "",
    bioEn: formData.get("bioEn") ?? "",
    bioKn: formData.get("bioKn") ?? "",
    published: formData.get("published") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
}

export async function saveCommitteeMember(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = read(formData);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  let photo: string | undefined;
  const file = formFile(formData, "photo");
  try {
    if (file) photo = await saveImage(file, "committee");
  } catch (error) {
    return { error: error instanceof UploadError ? error.message : "Photo upload failed." };
  }
  const db = await getDb();
  if (id) {
    const existing = await getCommitteeMember(id);
    if (!existing) return { error: "Member not found." };
    await db
      .update(committeeMembers)
      .set({ ...parsed.data, ...(photo ? { photo } : {}) })
      .where(eq(committeeMembers.id, id));
    if (photo && existing.photo) await deleteStored(existing.photo);
    revalidatePath("/", "layout");
    return { success: "Member saved." };
  }
  await db.insert(committeeMembers).values({ ...parsed.data, photo: photo ?? "" });
  revalidatePath("/", "layout");
  redirect("/admin/committee");
}

export async function deleteCommitteeMember(id: number): Promise<void> {
  await requireAdmin();
  const existing = await getCommitteeMember(id);
  if (!existing) return;
  const db = await getDb();
  await db.delete(committeeMembers).where(eq(committeeMembers.id, id));
  await deleteStored(existing.photo);
  revalidatePath("/", "layout");
}

export async function removeCommitteePhoto(id: number): Promise<void> {
  await requireAdmin();
  const existing = await getCommitteeMember(id);
  if (!existing) return;
  const db = await getDb();
  await db.update(committeeMembers).set({ photo: "" }).where(eq(committeeMembers.id, id));
  await deleteStored(existing.photo);
  revalidatePath("/", "layout");
}
