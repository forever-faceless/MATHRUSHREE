"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { Settings } from "@/lib/db/schema";
import type { ActionState } from "@/lib/forms";
import { HASSAN_CENTRE } from "@/lib/geo";
import { ImageInput } from "./ImageInput";
import { Checkbox, FormStatus, Input, SubmitButton, Textarea } from "./ui";
import { CoordinateFields } from "./CoordinateFields";

export function SettingsForm({ settings, action }: { settings: Settings; action: (prev: ActionState, formData: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  const e = state?.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-10">
      <FormStatus state={state} />

      <div className="space-y-5">
        <h2 className="font-display text-xl font-semibold text-olive-900">Contact details</h2>
        <p className="text-sm text-ink-500">The primary phone number appears in the header, hero, footer, every project page and the mobile call bar.</p>
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Primary phone" name="phonePrimary" type="tel" defaultValue={settings.phonePrimary} error={e.phonePrimary} placeholder="94480 12345" />
          <Input label="Secondary phone (optional)" name="phoneSecondary" type="tel" defaultValue={settings.phoneSecondary} />
          <Input label="WhatsApp number" name="whatsapp" type="tel" defaultValue={settings.whatsapp} hint="Leave blank to use the primary phone." />
          <Input label="Email" name="email" type="email" defaultValue={settings.email} />
          <Input label="Office hours (English)" name="workingHoursEn" defaultValue={settings.workingHoursEn} placeholder="Mon – Sat, 10:00 AM – 6:00 PM" />
          <Input label="Office hours (ಕನ್ನಡ)" name="workingHoursKn" defaultValue={settings.workingHoursKn} lang="kn" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Textarea label="Office address (English)" name="addressEn" rows={3} defaultValue={settings.addressEn} />
          <Textarea label="Office address (ಕನ್ನಡ)" name="addressKn" rows={3} defaultValue={settings.addressKn} lang="kn" />
        </div>
        <CoordinateFields lat={settings.officeLat} lng={settings.officeLng} fallback={HASSAN_CENTRE} label="Office GPS location" names={{ lat: "officeLat", lng: "officeLng" }} />
      </div>

      <div className="space-y-5">
        <h2 className="font-display text-xl font-semibold text-olive-900">Society identity</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Society name (English)" name="societyNameEn" required defaultValue={settings.societyNameEn} error={e.societyNameEn} />
          <Input label="Society name (ಕನ್ನಡ)" name="societyNameKn" defaultValue={settings.societyNameKn} lang="kn" />
          <Input label="Tagline (English)" name="taglineEn" defaultValue={settings.taglineEn} />
          <Input label="Tagline (ಕನ್ನಡ)" name="taglineKn" defaultValue={settings.taglineKn} lang="kn" />
          <Input label="Registration number" name="regNumber" defaultValue={settings.regNumber} hint="Shown in the footer, hero and About page as a trust signal." />
          <Input label="Year established" name="establishedYear" type="number" min="1900" max="2100" defaultValue={settings.establishedYear ?? ""} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Textarea label="About the society (English)" name="aboutEn" rows={7} defaultValue={settings.aboutEn} hint="Separate paragraphs with a blank line." />
          <Textarea label="About the society (ಕನ್ನಡ)" name="aboutKn" rows={7} defaultValue={settings.aboutKn} lang="kn" />
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="font-display text-xl font-semibold text-olive-900">Home page</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Hero headline (English)" name="heroTitleEn" defaultValue={settings.heroTitleEn} hint="Leave blank to use the default headline." />
          <Input label="Hero headline (ಕನ್ನಡ)" name="heroTitleKn" defaultValue={settings.heroTitleKn} lang="kn" />
          <Textarea label="Hero sub-text (English)" name="heroSubtitleEn" rows={2} defaultValue={settings.heroSubtitleEn} />
          <Textarea label="Hero sub-text (ಕನ್ನಡ)" name="heroSubtitleKn" rows={2} defaultValue={settings.heroSubtitleKn} lang="kn" />
        </div>
        <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-end">
          {settings.heroImage ? (
            <div className="relative h-24 w-40 overflow-hidden rounded-xl bg-olive-100">
              <Image src={settings.heroImage} alt="" fill sizes="160px" className="object-cover" />
            </div>
          ) : null}
          <div className="space-y-3">
            <div>
              <label htmlFor="heroImage" className="label">
                Hero background photo
              </label>
              <ImageInput id="heroImage" name="heroImage" />
              <p className="help">A wide photo of a layout or of Hassan works best. It is darkened automatically for legibility.</p>
            </div>
            {settings.heroImage ? <Checkbox label="Remove current hero photo" name="removeHero" /> : null}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Input label="Members (count)" name="statMembers" type="number" min="0" defaultValue={settings.statMembers} />
          <Input label="Sites allotted (count)" name="statSitesAllotted" type="number" min="0" defaultValue={settings.statSitesAllotted} />
          <Input label="Projects completed (count)" name="statProjectsCompleted" type="number" min="0" defaultValue={settings.statProjectsCompleted} />
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="font-display text-xl font-semibold text-olive-900">Social links (optional)</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Facebook" name="facebookUrl" type="url" defaultValue={settings.facebookUrl} />
          <Input label="Instagram" name="instagramUrl" type="url" defaultValue={settings.instagramUrl} />
          <Input label="YouTube" name="youtubeUrl" type="url" defaultValue={settings.youtubeUrl} />
        </div>
      </div>

      <div className="border-t border-olive-900/8 pt-6">
        <SubmitButton variant="gold">Save settings</SubmitButton>
      </div>
    </form>
  );
}
