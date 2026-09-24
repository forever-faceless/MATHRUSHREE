import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className={cn("eyebrow", tone === "dark" && "text-gold-300")}>{eyebrow}</p> : null}
      <Tag className={cn("display-2 mt-3", tone === "dark" ? "text-gold-100" : "text-olive-900")}>{title}</Tag>
      {subtitle ? <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-gold-100/70" : "text-ink-500")}>{subtitle}</p> : null}
      <div className={cn("gold-rule mt-6", align === "center" && "mx-auto")} />
    </div>
  );
}
