"use client";

import { ImagePlus, Star, X } from "lucide-react";
import Image from "next/image";
import { useActionState, useTransition } from "react";
import type { Project } from "@/lib/db/schema";
import type { ActionState } from "@/lib/forms";
import { ImageInput } from "./ImageInput";
import { FormStatus, SubmitButton } from "./ui";

type Props = {
  project: Project;
  uploadAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  removeAction: (url: string, kind: "gallery" | "cover" | "plan") => Promise<void>;
  setCoverAction: (url: string) => Promise<void>;
};

export function MediaManager({ project, uploadAction, removeAction, setCoverAction }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(uploadAction, undefined);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <FormStatus state={state} />
      <form action={formAction} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="coverImage">
            Cover photo
          </label>
          <ImageInput id="coverImage" name="coverImage" />
          <p className="help">Landscape photo, shown on cards and at the top of the project page.</p>
        </div>
        <div>
          <label className="label" htmlFor="gallery">
            Gallery photos (multiple)
          </label>
          <ImageInput id="gallery" name="gallery" multiple maxFiles={10} />
          <p className="help">Up to 10 photos at a time. Photos are shrunk in your browser before upload, so phone photos are fine.</p>
        </div>
        <div>
          <label className="label" htmlFor="layoutPlanImage">
            Layout plan (image)
          </label>
          <ImageInput id="layoutPlanImage" name="layoutPlanImage" />
        </div>
        <div>
          <label className="label" htmlFor="brochure">
            Brochure (PDF)
          </label>
          <input id="brochure" name="brochure" type="file" accept="application/pdf" className="field file:mr-3 file:rounded-full file:border-0 file:bg-olive-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gold-200" />
        </div>
        <div className="md:col-span-2">
          <SubmitButton>
            <ImagePlus className="h-4 w-4" /> Upload selected files
          </SubmitButton>
        </div>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <Thumb title="Cover photo" src={project.coverImage} onRemove={() => start(() => removeAction(project.coverImage, "cover"))} pending={pending} />
        <Thumb title="Layout plan" src={project.layoutPlanImage} onRemove={() => start(() => removeAction(project.layoutPlanImage, "plan"))} pending={pending} contain />
      </div>

      {project.brochureUrl ? (
        <p className="text-sm text-ink-700">
          Brochure:{" "}
          <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-700 hover:underline">
            open PDF
          </a>
        </p>
      ) : null}

      <div>
        <p className="label">Gallery ({project.gallery.length})</p>
        {project.gallery.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {project.gallery.map((url) => (
              <li key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-olive-100">
                <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-olive-950/80 to-transparent p-2">
                  <button type="button" disabled={pending} onClick={() => start(() => setCoverAction(url))} className="inline-flex items-center gap-1 rounded-full bg-ivory-50/90 px-2 py-1 text-[11px] font-semibold text-olive-900" title="Use as cover">
                    <Star className="h-3 w-3" /> Cover
                  </button>
                  <button type="button" disabled={pending} onClick={() => start(() => removeAction(url, "gallery"))} className="inline-flex items-center gap-1 rounded-full bg-danger-600 px-2 py-1 text-[11px] font-semibold text-white" title="Remove">
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">No gallery photos yet.</p>
        )}
      </div>
    </div>
  );
}

function Thumb({ title, src, onRemove, pending, contain }: { title: string; src: string; onRemove: () => void; pending: boolean; contain?: boolean }) {
  return (
    <div>
      <p className="label">{title}</p>
      {src ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-olive-100">
          <Image src={src} alt="" fill sizes="400px" className={contain ? "object-contain" : "object-cover"} />
          <button type="button" disabled={pending} onClick={onRemove} className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-danger-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            <X className="h-3 w-3" /> Remove
          </button>
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-olive-900/20 text-sm text-ink-400">Not uploaded</div>
      )}
    </div>
  );
}
