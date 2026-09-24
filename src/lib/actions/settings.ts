"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { getSettings } from "@/lib/db/queries";
import { settings } from "@/lib/db/schema";
import { formFile, type ActionState, zodFieldErrors } from "@/lib/forms";
import { deleteStored, saveImage, UploadError } from "@/lib/storage";
import { settingsSchema } from "@/lib/validation";

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const data: Record<string, FormDataEntryValue | string> = {};
  for (const key of Object.keys(settingsSchema.shape)) data[key] = formData.get(key) ?? "";
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const existing = await getSettings();
  let heroImage: string | undefined;
  try {
    const file = formFile(formData, "heroImage");
    if (file) heroImage = await saveImage(file, "hero");
  } catch (error) {
    return { error: error instanceof UploadError ? error.message : "Hero image upload failed." };
  }
  if (formData.get("removeHero") === "on" && existing.heroImage) {
    await deleteStored(existing.heroImage);
    heroImage = "";
  }
  const db = await getDb();
  await db
    .update(settings)
    .set({ ...parsed.data, ...(heroImage !== undefined ? { heroImage } : {}), updatedAt: new Date() })
    .where(eq(settings.id, 1));
  if (heroImage && existing.heroImage && heroImage !== existing.heroImage) await deleteStored(existing.heroImage);
  revalidatePath("/", "layout");
  return { success: "Settings saved." };
}
