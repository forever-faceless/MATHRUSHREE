"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { landmarks } from "@/lib/db/schema";
import { type ActionState, zodFieldErrors } from "@/lib/forms";
import { landmarkSchema } from "@/lib/validation";

export async function saveLandmark(projectId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = landmarkSchema.safeParse({
    nameEn: formData.get("nameEn") ?? "",
    nameKn: formData.get("nameKn") ?? "",
    category: formData.get("category") ?? "other",
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
    driveMinutes: formData.get("driveMinutes") ?? "",
  });
  if (!parsed.success) {
    return { error: "Check the landmark fields (latitude and longitude are required).", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const id = Number(formData.get("id") ?? 0);
  const db = await getDb();
  if (id > 0) {
    await db.update(landmarks).set(parsed.data).where(eq(landmarks.id, id));
  } else {
    await db.insert(landmarks).values({ ...parsed.data, projectId });
  }
  revalidatePath("/", "layout");
  return { success: id > 0 ? "Landmark updated." : "Landmark added." };
}

export async function deleteLandmark(id: number): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  await db.delete(landmarks).where(eq(landmarks.id, id));
  revalidatePath("/", "layout");
}
