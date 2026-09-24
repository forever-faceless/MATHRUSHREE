import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  nameLine1: string;
  nameLine2: string;
  className?: string;
  /** "dark" renders on the olive header; "light" on ivory surfaces. */
  tone?: "dark" | "light";
  compact?: boolean;
};

export function Logo({ href, nameLine1, nameLine2, className, tone = "dark", compact = false }: Props) {
  return (
    <Link href={href} className={cn("group flex items-center gap-3", className)} aria-label={`${nameLine1} ${nameLine2}`}>
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={56}
        height={50}
        priority
        className={cn("h-11 w-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.03] sm:h-12", compact && "h-9 sm:h-10")}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.35rem] font-semibold tracking-wide sm:text-2xl",
            tone === "dark" ? "text-gold-300" : "text-olive-900",
            compact && "text-lg sm:text-xl",
          )}
        >
          {nameLine1}
        </span>
        <span
          className={cn(
            "mt-1 hidden text-[10px] font-medium uppercase tracking-[0.16em] sm:block sm:text-[11px]",
            tone === "dark" ? "text-gold-200/70" : "text-ink-500",
          )}
        >
          {nameLine2}
        </span>
      </span>
    </Link>
  );
}
