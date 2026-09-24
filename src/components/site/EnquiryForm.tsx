"use client";

import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/lib/actions/enquiry";
import type { LeadPurpose } from "@/lib/db/schema";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { cn, formatPhoneDisplay, telHref, whatsappHref } from "@/lib/utils";
import { WhatsAppIcon } from "./PhoneLinks";

export type EnquiryFormProps = {
  locale: Locale;
  t: Dictionary["enquiry"];
  projects: { id: number; name: string }[];
  defaultProjectId?: number | null;
  siteId?: number | null;
  siteNumber?: string | null;
  subject: string;
  phone: string;
  whatsapp: string;
  source: string;
  compact?: boolean;
  callLabel: string;
  whatsappLabel: string;
};

const initial: EnquiryState = { status: "idle" };

export function EnquiryForm(props: EnquiryFormProps) {
  const { locale, t, projects, defaultProjectId, siteId, siteNumber, subject, phone, whatsapp, source, compact, callLabel, whatsappLabel } = props;
  const [state, action, pending] = useActionState(submitEnquiry, initial);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-success-600/20 bg-success-100/60 p-6 sm:p-8" role="status">
        <CheckCircle2 className="h-9 w-9 text-success-600" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-semibold text-olive-900">{t.successTitle}</h3>
        <p className="mt-2 text-sm text-ink-700">{t.successText}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {phone ? (
            <a href={telHref(phone)} className="btn-olive">
              <Phone className="h-4 w-4" /> {formatPhoneDisplay(phone)}
            </a>
          ) : null}
          {whatsapp ? (
            <a href={whatsappHref(whatsapp, t.whatsappPrefill.replace("{subject}", subject))} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <WhatsAppIcon /> {whatsappLabel}
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const error = state.status === "error" ? state.code : null;
  const errorText =
    error === "invalid_phone" ? t.invalidPhone
    : error === "invalid_name" ? t.invalidName
    : error === "consent_required" ? t.consentRequired
    : error === "too_many" ? t.tooMany
    : error ? t.errorGeneric
    : null;

  const purposes: LeadPurpose[] = ["self_use", "investment", "other"];

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      {siteId ? <input type="hidden" name="siteId" value={siteId} /> : null}
      {/* Honeypot — hidden from people, filled by bots. */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor="enq-name" className="label">
            {t.name} <span className="text-danger-600">*</span>
          </label>
          <input id="enq-name" name="name" required autoComplete="name" className={cn("field", error === "invalid_name" && "field-error")} maxLength={80} />
        </div>
        <div>
          <label htmlFor="enq-phone" className="label">
            {t.phone} <span className="text-danger-600">*</span>
          </label>
          <input
            id="enq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="98765 43210"
            className={cn("field tabular-nums", error === "invalid_phone" && "field-error")}
            maxLength={16}
          />
          <p className="help">{t.phoneHint}</p>
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor="enq-project" className="label">
            {t.project}
          </label>
          {siteNumber && defaultProjectId ? (
            <>
              <input type="hidden" name="projectId" value={defaultProjectId} />
              <div className="field bg-ivory-100 text-ink-700">
                {projects.find((p) => p.id === defaultProjectId)?.name} · {t.site.replace(/\s*\(.*\)$/, "")} {siteNumber}
              </div>
            </>
          ) : (
            <select id="enq-project" name="projectId" defaultValue={defaultProjectId ?? ""} className="field">
              <option value="">{t.anyProject}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label htmlFor="enq-purpose" className="label">
            {t.purpose}
          </label>
          <select id="enq-purpose" name="purpose" className="field" defaultValue="self_use">
            {purposes.map((p) => (
              <option key={p} value={p}>
                {t.purposes[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor="enq-budget" className="label">
            {t.budget}
          </label>
          <select id="enq-budget" name="budget" className="field" defaultValue="">
            <option value="">—</option>
            {t.budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="enq-timeline" className="label">
            {t.timeline}
          </label>
          <select id="enq-timeline" name="timeline" className="field" defaultValue="">
            <option value="">—</option>
            {t.timelines.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="enq-email" className="label">
          {t.email}
        </label>
        <input id="enq-email" name="email" type="email" autoComplete="email" className="field" maxLength={120} />
      </div>

      <div>
        <label htmlFor="enq-message" className="label">
          {t.message}
        </label>
        <textarea id="enq-message" name="message" rows={3} className="field" placeholder={t.messagePlaceholder} maxLength={1500} />
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input type="checkbox" name="consent" defaultChecked className="mt-1 h-4 w-4 rounded border-olive-900/30 accent-gold-600" />
        <span>{t.consent}</span>
      </label>

      {errorText ? (
        <p className="rounded-xl border border-danger-600/20 bg-danger-100 px-4 py-3 text-sm font-medium text-danger-600" role="alert">
          {errorText}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="btn-gold sm:min-w-48">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? t.submitting : t.submit}
        </button>
        {phone ? (
          <p className="text-sm text-ink-500">
            {t.orCall}{" "}
            <a href={telHref(phone)} className="font-semibold text-olive-900 hover:underline">
              {formatPhoneDisplay(phone)}
            </a>
          </p>
        ) : null}
        <span className="sr-only">{callLabel}</span>
      </div>
    </form>
  );
}
