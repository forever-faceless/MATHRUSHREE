import { Phone } from "lucide-react";
import Image from "next/image";
import type { CommitteeMember } from "@/lib/db/schema";
import { pick, type Locale } from "@/lib/i18n";
import { cn, formatPhoneDisplay, telHref } from "@/lib/utils";

function initials(name: string): string {
  const cleaned = name.replace(/^(sri|smt|shri|dr|mr|mrs|ms)\.?\s+/i, "");
  return cleaned
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function CommitteeCard({ member, locale, compact = false }: { member: CommitteeMember; locale: Locale; compact?: boolean }) {
  const name = pick(member, "name", locale);
  const role = pick(member, "role", locale);
  const bio = pick(member, "bio", locale);
  return (
    <article className={cn("card flex gap-4 p-5", compact ? "items-center" : "flex-col items-start sm:flex-row")}>
      <div className={cn("relative shrink-0 overflow-hidden rounded-2xl bg-olive-900", compact ? "h-16 w-16" : "h-24 w-24")}>
        {member.photo ? (
          <Image src={member.photo} alt={name} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-gold-300">{initials(member.nameEn)}</span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className={cn("font-display font-semibold text-olive-900", compact ? "text-lg" : "text-xl")}>{name}</h3>
        {role ? <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-700">{role}</p> : null}
        {!compact && bio ? <p className="mt-3 text-sm leading-relaxed text-ink-500">{bio}</p> : null}
        {!compact && member.phone ? (
          <a href={telHref(member.phone)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-900 hover:text-gold-700">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {formatPhoneDisplay(member.phone)}
          </a>
        ) : null}
      </div>
    </article>
  );
}
