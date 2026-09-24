"use client";

import { useActionState, useState } from "react";
import { PROJECT_STATUSES, type Project } from "@/lib/db/schema";
import { approvalsToLines, bilingualToLines, type ActionState } from "@/lib/forms";
import { HASSAN_CENTRE } from "@/lib/geo";
import { slugify } from "@/lib/utils";
import { Checkbox, FormStatus, Input, Select, SubmitButton, Textarea } from "./ui";
import { CoordinateFields } from "./CoordinateFields";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function ProjectForm({ project, action, submitLabel = "Save project" }: { project?: Project | null; action: Action; submitLabel?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  const [slug, setSlug] = useState(project?.slug ?? "");
  const e = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      <FormStatus state={state} />

      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Project name (English)" name="nameEn" required defaultValue={project?.nameEn} error={e.nameEn} onBlur={(ev) => !slug && setSlug(slugify(ev.currentTarget.value))} />
        <Input label="Project name (ಕನ್ನಡ)" name="nameKn" defaultValue={project?.nameKn} lang="kn" />
        <Input label="URL slug" name="slug" value={slug} onChange={(ev) => setSlug(ev.target.value)} error={e.slug} hint={`Website address: /en/projects/${slug || "…"}`} />
        <Select label="Status" name="status" defaultValue={project?.status ?? "ongoing"} options={PROJECT_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))} />
        <Input label="Tagline (English)" name="taglineEn" defaultValue={project?.taglineEn} hint="One line shown under the name, e.g. “HUDA-approved layout beside the ring road”." />
        <Input label="Tagline (ಕನ್ನಡ)" name="taglineKn" defaultValue={project?.taglineKn} lang="kn" />
        <Input label="Location (English)" name="locationEn" defaultValue={project?.locationEn} placeholder="Near Ring Road, Hassan" />
        <Input label="Location (ಕನ್ನಡ)" name="locationKn" defaultValue={project?.locationKn} lang="kn" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Textarea label="Description (English)" name="descriptionEn" rows={7} defaultValue={project?.descriptionEn} hint="Separate paragraphs with a blank line." />
        <Textarea label="Description (ಕನ್ನಡ)" name="descriptionKn" rows={7} defaultValue={project?.descriptionKn} lang="kn" />
      </div>

      <CoordinateFields lat={project?.lat ?? null} lng={project?.lng ?? null} fallback={HASSAN_CENTRE} label="Layout GPS location" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Total area (acres)" name="totalAreaAcres" type="number" step="0.01" min="0" defaultValue={project?.totalAreaAcres ?? ""} />
        <Input label="Total sites in layout" name="totalSites" type="number" min="0" defaultValue={project?.totalSites ?? ""} />
        <Input label="Price from (₹)" name="priceFrom" type="number" min="0" step="1000" defaultValue={project?.priceFrom ?? ""} hint="Lowest site price, shown on cards." />
        <Input label="Rate per sq ft (₹)" name="pricePerSqft" type="number" min="0" defaultValue={project?.pricePerSqft ?? ""} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Textarea
          label="Amenities (one per line)"
          name="amenities"
          rows={6}
          defaultValue={bilingualToLines(project?.amenities)}
          hint="Format: English | ಕನ್ನಡ  — the Kannada half is optional."
          placeholder={"30 ft asphalted roads | 30 ಅಡಿ ಡಾಂಬರು ರಸ್ತೆಗಳು\nUnderground drainage | ಭೂಗತ ಒಳಚರಂಡಿ"}
        />
        <Textarea
          label="Approvals & documents (one per line)"
          name="approvals"
          rows={6}
          defaultValue={approvalsToLines(project?.approvals)}
          hint="Format: Name | ಕನ್ನಡ | Reference number  — both Kannada and number are optional."
          placeholder={"Layout approval – HUDA | ಲೇಔಟ್ ಅನುಮೋದನೆ – HUDA | HUDA/LAY/2024/012\nEncumbrance certificate – 30 years"}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Video link (YouTube, optional)" name="videoUrl" type="url" defaultValue={project?.videoUrl} />
        <Input label="Brochure link (optional)" name="brochureUrl" defaultValue={project?.brochureUrl} hint="Or upload a PDF in the Media section after saving." />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Checkbox label="Published" name="published" defaultChecked={project?.published ?? true} hint="Visible on the website." />
        <Checkbox label="Featured" name="featured" defaultChecked={project?.featured ?? false} hint="Shown first on the home page." />
        <Input label="Sort order" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} hint="Lower numbers appear first." />
      </div>

      <div className="flex gap-3 border-t border-olive-900/8 pt-6">
        <SubmitButton variant="gold">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
