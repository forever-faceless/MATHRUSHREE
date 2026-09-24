"use client";

import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/forms";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="text-[13px] font-semibold text-gold-700 hover:underline">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="display-2 mt-1 text-olive-900">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Section({ title, description, children, className, id }: { title: string; description?: string; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("card scroll-mt-24 p-5 sm:p-7", className)}>
      <div className="mb-5 border-b border-olive-900/8 pb-4">
        <h2 className="font-display text-xl font-semibold text-olive-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, name, error, hint, children, className }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-danger-600">{error}</p> : hint ? <p className="help">{hint}</p> : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string; wrapperClassName?: string };
export function Input({ label, name, error, hint, wrapperClassName, className, ...rest }: InputProps) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={wrapperClassName}>
      <input id={name} name={name} className={cn("field", error && "field-error", className)} {...rest} />
    </Field>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; error?: string; hint?: string; wrapperClassName?: string };
export function Textarea({ label, name, error, hint, wrapperClassName, className, ...rest }: TextareaProps) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={wrapperClassName}>
      <textarea id={name} name={name} className={cn("field min-h-24", error && "field-error", className)} {...rest} />
    </Field>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; error?: string; hint?: string; wrapperClassName?: string; options: { value: string; label: string }[] };
export function Select({ label, name, error, hint, wrapperClassName, className, options, ...rest }: SelectProps) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={wrapperClassName}>
      <select id={name} name={name} className={cn("field", error && "field-error", className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-olive-900/10 bg-white px-3.5 py-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-gold-600" />
      <span>
        <span className="font-medium text-ink-900">{label}</span>
        {hint ? <span className="block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}

export function FormStatus({ state }: { state: ActionState }) {
  const [hidden, setHidden] = useState(false);
  const [seen, setSeen] = useState<ActionState>(state);
  if (state !== seen) {
    // A new result arrived: show it again.
    setSeen(state);
    setHidden(false);
  }
  useEffect(() => {
    if (!state?.success) return;
    const t = setTimeout(() => setHidden(true), 4000);
    return () => clearTimeout(t);
  }, [state]);
  if (!state || hidden) return null;
  if (state.error) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-danger-600/20 bg-danger-100 px-4 py-3 text-sm font-medium text-danger-600" role="alert">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-success-600/20 bg-success-100 px-4 py-3 text-sm font-medium text-success-600" role="status">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {state.success}
      </p>
    );
  }
  return null;
}

export function SubmitButton({ children, className, variant = "olive" }: { children: React.ReactNode; className?: string; variant?: "olive" | "gold" | "outline" }) {
  const { pending } = useFormStatus();
  const cls = variant === "gold" ? "btn-gold" : variant === "outline" ? "btn-outline" : "btn-olive";
  return (
    <button type="submit" disabled={pending} className={cn(cls, className)}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** Two-step delete: first click arms, second click runs the action. No native dialogs. */
export function ConfirmButton({ action, label = "Delete", confirmLabel = "Confirm delete", className, size = "sm" }: { action: () => Promise<void>; label?: string; confirmLabel?: string; className?: string; size?: "sm" | "md" }) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => (armed ? start(() => action()) : setArmed(true))}
      className={cn(
        "btn",
        size === "sm" && "btn-sm",
        armed ? "bg-danger-600 text-white hover:bg-danger-600/90" : "border border-danger-600/30 bg-transparent text-danger-600 hover:bg-danger-100",
        className,
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {armed ? confirmLabel : label}
    </button>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <p className="font-display text-xl font-semibold text-olive-900">{title}</p>
      {text ? <p className="mt-2 max-w-md text-sm text-ink-500">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, href }: { label: string; value: string | number; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-olive-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-5 transition hover:shadow-lift">
      {body}
    </Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}
