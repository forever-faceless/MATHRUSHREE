"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => setIndex((i) => (i == null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, close, step]);

  if (!images.length) return null;
  const [first, ...rest] = images;

  return (
    <>
      <div className={cn("grid gap-3", rest.length ? "md:grid-cols-[2fr_1fr]" : "", className)}>
        <button type="button" onClick={() => setIndex(0)} className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-olive-800" aria-label={`${alt} 1`}>
          <Image src={first} alt={`${alt} 1`} fill priority sizes="(min-width: 768px) 66vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </button>
        {rest.length ? (
          // Two stacked thumbnails match the main image height on desktop; three in a row on mobile.
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:grid-rows-2">
            {rest.slice(0, 3).map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i + 1)}
                className={cn("group relative aspect-[16/10] overflow-hidden rounded-2xl bg-olive-800", i === 2 && "md:hidden")}
                aria-label={`${alt} ${i + 2}`}
              >
                <Image src={src} alt={`${alt} ${i + 2}`} fill sizes="(min-width: 768px) 33vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                {i === 1 && rest.length > 2 ? (
                  <span className="absolute inset-0 hidden items-center justify-center bg-olive-950/60 font-display text-2xl font-semibold text-gold-200 md:flex">+{rest.length - 2}</span>
                ) : null}
                {i === 2 && rest.length > 3 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-olive-950/60 font-display text-2xl font-semibold text-gold-200 md:hidden">+{rest.length - 3}</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {index != null ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-olive-950/95 p-4" role="dialog" aria-modal="true" onClick={close}>
          <button type="button" onClick={close} className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-olive-800 text-gold-200 hover:bg-olive-700" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 ? (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-olive-800 text-gold-200 hover:bg-olive-700" aria-label="Previous">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-olive-800 text-gold-200 hover:bg-olive-700" aria-label="Next">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div className="relative h-[80vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[index]} alt={`${alt} ${index + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="absolute bottom-4 text-sm text-gold-200/70">
            {index + 1} / {images.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
