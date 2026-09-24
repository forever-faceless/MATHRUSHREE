"use client";

import { Pencil, Plus, X } from "lucide-react";
import { useActionState, useState } from "react";
import { LANDMARK_CATEGORIES, type Landmark } from "@/lib/db/schema";
import type { ActionState } from "@/lib/forms";
import { estimateDriveMinutes, formatDistance, haversineKm } from "@/lib/geo";
import { en } from "@/lib/i18n/dictionaries/en";
import { ConfirmButton, FormStatus, Input, Select, SubmitButton } from "./ui";
import { CoordinateFields } from "./CoordinateFields";

type Props = {
  landmarks: Landmark[];
  origin: { lat: number; lng: number } | null;
  saveAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (id: number) => Promise<void>;
};

export function LandmarkEditor({ landmarks, origin, saveAction, deleteAction }: Props) {
  const [editing, setEditing] = useState<Landmark | null>(null);
  const [state, formAction] = useActionState<ActionState, FormData>(saveAction, undefined);
  const [seenState, setSeenState] = useState<ActionState>(state);
  if (state !== seenState) {
    // Leave edit mode once a save succeeds.
    setSeenState(state);
    if (state?.success) setEditing(null);
  }
  const e = state?.fieldErrors ?? {};

  return (
    <div className="space-y-6">
      {landmarks.length ? (
        <ul className="divide-y divide-olive-900/8 rounded-xl border border-olive-900/10 bg-white">
          {landmarks.map((l) => {
            const km = origin ? haversineKm(origin.lat, origin.lng, l.lat, l.lng) : null;
            return (
              <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-olive-900">
                    {l.nameEn} {l.nameKn ? <span className="font-normal text-ink-500">· {l.nameKn}</span> : null}
                  </p>
                  <p className="text-xs text-ink-500">
                    {en.landmark[l.category]} · {l.lat.toFixed(5)}, {l.lng.toFixed(5)}
                    {km != null ? ` · ${formatDistance(km, "en")} · ${l.driveMinutes ?? estimateDriveMinutes(km)} min${l.driveMinutes ? "" : " (est.)"}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(l)} className="btn-outline btn-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <ConfirmButton action={() => deleteAction(l.id)} label="Remove" confirmLabel="Confirm" />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-500">No landmarks yet. Add the bus stand, railway station, hospital, highway and schools near this layout. Distances are computed automatically.</p>
      )}

      <form key={editing?.id ?? "new"} action={formAction} className="space-y-5 rounded-2xl border border-olive-900/10 bg-ivory-50 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-olive-900">{editing ? `Edit “${editing.nameEn}”` : "Add a landmark"}</h3>
          {editing ? (
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost btn-sm">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          ) : null}
        </div>
        <FormStatus state={state} />
        <input type="hidden" name="id" value={editing?.id ?? 0} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Name (English)" name="nameEn" required defaultValue={editing?.nameEn} error={e.nameEn} placeholder="Hassan KSRTC Bus Stand" />
          <Input label="Name (ಕನ್ನಡ)" name="nameKn" defaultValue={editing?.nameKn} lang="kn" />
          <Select label="Type" name="category" defaultValue={editing?.category ?? "other"} options={LANDMARK_CATEGORIES.map((c) => ({ value: c, label: en.landmark[c] }))} />
        </div>
        <CoordinateFields lat={editing?.lat ?? null} lng={editing?.lng ?? null} label="Landmark location" required />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Drive time (minutes, optional)" name="driveMinutes" type="number" min="0" defaultValue={editing?.driveMinutes ?? ""} hint="Leave blank to estimate from the distance." />
        </div>
        <SubmitButton>
          <Plus className="h-4 w-4" /> {editing ? "Save landmark" : "Add landmark"}
        </SubmitButton>
      </form>
    </div>
  );
}
