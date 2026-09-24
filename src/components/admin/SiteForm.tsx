"use client";

import { useActionState } from "react";
import { FACINGS, SITE_STATUSES, type Site } from "@/lib/db/schema";
import { bilingualToLines, type ActionState } from "@/lib/forms";
import { en } from "@/lib/i18n/dictionaries/en";
import { Checkbox, FormStatus, Input, Select, SubmitButton, Textarea } from "./ui";
import { CoordinateFields } from "./CoordinateFields";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function SiteForm({ site, action, submitLabel = "Save site", origin }: { site?: Site | null; action: Action; submitLabel?: string; origin?: { lat: number; lng: number } | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  const e = state?.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-8">
      <FormStatus state={state} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Site number" name="siteNumber" required defaultValue={site?.siteNumber} error={e.siteNumber} placeholder="12 or A-12" />
        <Select label="Status" name="status" defaultValue={site?.status ?? "available"} options={SITE_STATUSES.map((s) => ({ value: s, label: en.status.site[s] }))} />
        <Select label="Facing" name="facing" defaultValue={site?.facing ?? ""} options={[{ value: "", label: "—" }, ...FACINGS.map((f) => ({ value: f, label: en.facing[f] }))]} />
        <Input label="Sort order" name="sortOrder" type="number" defaultValue={site?.sortOrder ?? 0} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Width (ft)" name="widthFt" type="number" step="0.5" min="0" defaultValue={site?.widthFt ?? ""} />
        <Input label="Depth (ft)" name="depthFt" type="number" step="0.5" min="0" defaultValue={site?.depthFt ?? ""} />
        <Input label="Dimension label" name="dimension" defaultValue={site?.dimension} placeholder="30 × 40" hint="Filled from width × depth if left blank." />
        <Input label="Area (sq ft)" name="areaSqft" type="number" min="0" defaultValue={site?.areaSqft ?? ""} hint="Filled from width × depth if left blank." />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Road width (ft)" name="roadWidthFt" type="number" min="0" defaultValue={site?.roadWidthFt ?? ""} />
        <Input label="Rate per sq ft (₹)" name="pricePerSqft" type="number" min="0" defaultValue={site?.pricePerSqft ?? ""} />
        <Input label="Total price (₹)" name="price" type="number" min="0" step="1000" defaultValue={site?.price ?? ""} hint="Leave blank to show “On request”." />
        <div className="self-end">
          <Checkbox label="Corner site" name="corner" defaultChecked={site?.corner ?? false} />
        </div>
      </div>
      <CoordinateFields lat={site?.lat ?? null} lng={site?.lng ?? null} fallback={origin ?? undefined} label="Site GPS pin (optional)" />
      <div className="grid gap-5 md:grid-cols-2">
        <Textarea label="Description (English)" name="descriptionEn" rows={4} defaultValue={site?.descriptionEn} />
        <Textarea label="Description (ಕನ್ನಡ)" name="descriptionKn" rows={4} defaultValue={site?.descriptionKn} lang="kn" />
      </div>
      <Textarea label="Highlights (one per line)" name="features" rows={4} defaultValue={bilingualToLines(site?.features)} hint="Format: English | ಕನ್ನಡ" placeholder={"Corner site with two road frontages | ಎರಡು ರಸ್ತೆ ಮುಖದ ಮೂಲೆ ನಿವೇಶನ"} />
      <div className="border-t border-olive-900/8 pt-6">
        <SubmitButton variant="gold">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
