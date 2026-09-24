"use client";

import { useActionState } from "react";
import type { Testimonial } from "@/lib/db/schema";
import type { ActionState } from "@/lib/forms";
import { Checkbox, FormStatus, Input, Select, SubmitButton, Textarea } from "./ui";

export function TestimonialForm({ item, projects, action }: { item?: Testimonial | null; projects: { id: number; name: string }[]; action: (prev: ActionState, formData: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  const e = state?.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-6">
      <FormStatus state={state} />
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Member name (English)" name="nameEn" required defaultValue={item?.nameEn} error={e.nameEn} />
        <Input label="Member name (ಕನ್ನಡ)" name="nameKn" defaultValue={item?.nameKn} lang="kn" />
        <Input label="Location / context (English)" name="locationEn" defaultValue={item?.locationEn} placeholder="Mathrushree Gardens, member since 2018" />
        <Input label="Location / context (ಕನ್ನಡ)" name="locationKn" defaultValue={item?.locationKn} lang="kn" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Textarea label="Quote (English)" name="quoteEn" rows={4} defaultValue={item?.quoteEn} />
        <Textarea label="Quote (ಕನ್ನಡ)" name="quoteKn" rows={4} defaultValue={item?.quoteKn} lang="kn" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Select label="Related project (optional)" name="projectId" defaultValue={item?.projectId ? String(item.projectId) : ""} options={[{ value: "", label: "—" }, ...projects.map((p) => ({ value: String(p.id), label: p.name }))]} />
        <Input label="Sort order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        <div className="self-end">
          <Checkbox label="Published" name="published" defaultChecked={item?.published ?? true} />
        </div>
      </div>
      <div>
        <label htmlFor="photo" className="label">
          Photo (optional)
        </label>
        <input id="photo" name="photo" type="file" accept="image/*" className="field file:mr-3 file:rounded-full file:border-0 file:bg-olive-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gold-200" />
      </div>
      <div className="border-t border-olive-900/8 pt-6">
        <SubmitButton variant="gold">{item ? "Save testimonial" : "Add testimonial"}</SubmitButton>
      </div>
    </form>
  );
}
