"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { CommitteeMember } from "@/lib/db/schema";
import type { ActionState } from "@/lib/forms";
import { ImageInput } from "./ImageInput";
import { Checkbox, FormStatus, Input, SubmitButton, Textarea } from "./ui";

export function CommitteeForm({ member, action }: { member?: CommitteeMember | null; action: (prev: ActionState, formData: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  const e = state?.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-6">
      <FormStatus state={state} />
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Name (English)" name="nameEn" required defaultValue={member?.nameEn} error={e.nameEn} placeholder="Sri H. K. Ramesh" />
        <Input label="Name (ಕನ್ನಡ)" name="nameKn" defaultValue={member?.nameKn} lang="kn" />
        <Input label="Role (English)" name="roleEn" defaultValue={member?.roleEn} placeholder="President" />
        <Input label="Role (ಕನ್ನಡ)" name="roleKn" defaultValue={member?.roleKn} lang="kn" placeholder="ಅಧ್ಯಕ್ಷರು" />
        <Input label="Phone (optional, shown publicly)" name="phone" type="tel" defaultValue={member?.phone} />
        <Input label="Sort order" name="sortOrder" type="number" defaultValue={member?.sortOrder ?? 0} hint="President first, then vice president, secretary…" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Textarea label="Short bio (English)" name="bioEn" rows={3} defaultValue={member?.bioEn} />
        <Textarea label="Short bio (ಕನ್ನಡ)" name="bioKn" rows={3} defaultValue={member?.bioKn} lang="kn" />
      </div>
      <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-end">
        {member?.photo ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-olive-100">
            <Image src={member.photo} alt="" fill sizes="96px" className="object-cover" />
          </div>
        ) : null}
        <div>
          <label htmlFor="photo" className="label">
            Photo
          </label>
          <ImageInput id="photo" name="photo" />
          <p className="help">Square portrait works best. Initials are shown when there is no photo.</p>
        </div>
      </div>
      <Checkbox label="Published" name="published" defaultChecked={member?.published ?? true} />
      <div className="border-t border-olive-900/8 pt-6">
        <SubmitButton variant="gold">{member ? "Save member" : "Add member"}</SubmitButton>
      </div>
    </form>
  );
}
