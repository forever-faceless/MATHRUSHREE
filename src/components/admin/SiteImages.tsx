"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useActionState, useTransition } from "react";
import type { ActionState } from "@/lib/forms";
import { FormStatus, SubmitButton } from "./ui";

export function SiteImages({ images, uploadAction, removeAction }: { images: string[]; uploadAction: (prev: ActionState, formData: FormData) => Promise<ActionState>; removeAction: (url: string) => Promise<void> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(uploadAction, undefined);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-5">
      <FormStatus state={state} />
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="images" className="label">
            Add photos of this site
          </label>
          <input id="images" name="images" type="file" accept="image/*" multiple className="field file:mr-3 file:rounded-full file:border-0 file:bg-olive-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gold-200" />
        </div>
        <SubmitButton>
          <ImagePlus className="h-4 w-4" /> Upload
        </SubmitButton>
      </form>
      {images.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url) => (
            <li key={url} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-olive-100">
              <Image src={url} alt="" fill sizes="200px" className="object-cover" />
              <button type="button" disabled={pending} onClick={() => start(() => removeAction(url))} className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-danger-600 px-2 py-1 text-[11px] font-semibold text-white">
                <X className="h-3 w-3" /> Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-500">No photos yet. The project&apos;s photos are shown until you add some.</p>
      )}
    </div>
  );
}
