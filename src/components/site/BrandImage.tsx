import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Applied to the wrapper; use it to set aspect ratio and rounding. */
  wrapperClassName?: string;
  fallbackLabel?: string;
};

/**
 * Fill-mode image with a branded placeholder when no image has been uploaded yet.
 * The wrapper must be positioned and sized by the caller (e.g. aspect-[4/3]).
 */
export function BrandImage({ src, alt, className, sizes = "100vw", priority, wrapperClassName, fallbackLabel }: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-olive-800", wrapperClassName)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />
      ) : (
        <div className="surface-dark absolute inset-0 flex flex-col items-center justify-center gap-3 text-gold-300/80">
          <svg viewBox="0 0 64 56" className="h-12 w-12" fill="none" aria-hidden="true">
            <path d="M32 4 6 26h7v24h38V26h7L32 4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="M26 50V34h12v16" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          {fallbackLabel ? <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{fallbackLabel}</span> : null}
        </div>
      )}
    </div>
  );
}
