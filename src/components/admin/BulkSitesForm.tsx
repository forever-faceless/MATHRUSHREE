"use client";

import { Rows3 } from "lucide-react";
import { useActionState } from "react";
import { FACINGS, SITE_STATUSES } from "@/lib/db/schema";
import type { ActionState } from "@/lib/forms";
import { en } from "@/lib/i18n/dictionaries/en";
import { FormStatus, Input, Select, SubmitButton } from "./ui";

export function BulkSitesForm({ action }: { action: (prev: ActionState, formData: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  return (
    <form action={formAction} className="space-y-5">
      <FormStatus state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Prefix (optional)" name="prefix" placeholder="A-" />
        <Input label="From number" name="from" type="number" min="0" defaultValue={1} required />
        <Input label="To number" name="to" type="number" min="0" defaultValue={20} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Width (ft)" name="widthFt" type="number" step="0.5" min="0" defaultValue={30} />
        <Input label="Depth (ft)" name="depthFt" type="number" step="0.5" min="0" defaultValue={40} />
        <Input label="Dimension label" name="dimension" placeholder="30 × 40" hint="Auto from width × depth." />
        <Input label="Area (sq ft)" name="areaSqft" type="number" min="0" hint="Auto from width × depth." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select label="Facing" name="facing" defaultValue="" options={[{ value: "", label: "—" }, ...FACINGS.map((f) => ({ value: f, label: en.facing[f] }))]} />
        <Input label="Road width (ft)" name="roadWidthFt" type="number" min="0" defaultValue={30} />
        <Input label="Rate per sq ft (₹)" name="pricePerSqft" type="number" min="0" hint="Total price = rate × area." />
        <Input label="Or fixed price (₹)" name="price" type="number" min="0" step="1000" />
        <Select label="Status" name="status" defaultValue="available" options={SITE_STATUSES.map((s) => ({ value: s, label: en.status.site[s] }))} />
      </div>
      <SubmitButton>
        <Rows3 className="h-4 w-4" /> Create sites
      </SubmitButton>
    </form>
  );
}
