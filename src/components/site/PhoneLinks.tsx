import { Phone } from "lucide-react";
import { cn, formatPhoneDisplay, telHref, whatsappHref } from "@/lib/utils";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4", className)} fill="currentColor">
      <path d="M12.04 2C6.55 2 2.1 6.43 2.1 11.9c0 1.9.5 3.76 1.46 5.38L2 22l4.85-1.5a9.98 9.98 0 0 0 5.19 1.45c5.49 0 9.94-4.43 9.94-9.9C22 6.43 17.53 2 12.04 2Zm0 18.13c-1.63 0-3.22-.44-4.6-1.27l-.33-.2-2.88.9.94-2.78-.22-.34a8.06 8.06 0 0 1-1.25-4.34c0-4.47 3.65-8.1 8.14-8.1 4.48 0 8.13 3.63 8.13 8.1 0 4.47-3.65 8.03-7.93 8.03Zm4.46-6.03c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21a7.3 7.3 0 0 1-1.36-1.68c-.14-.24-.02-.37.1-.49.11-.11.25-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.71 2.6 4.15 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

type ButtonProps = {
  phone: string;
  label?: string;
  showNumber?: boolean;
  className?: string;
  variant?: "gold" | "olive" | "outline" | "outline-light" | "ghost";
  size?: "sm" | "md";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  gold: "btn-gold",
  olive: "btn-olive",
  outline: "btn-outline",
  "outline-light": "btn-outline-light",
  ghost: "btn-ghost",
};

export function CallButton({ phone, label, showNumber = true, className, variant = "gold", size = "md" }: ButtonProps) {
  if (!phone) return null;
  return (
    <a href={telHref(phone)} className={cn(variantClass[variant], size === "sm" && "btn-sm", className)}>
      <Phone className="h-4 w-4" aria-hidden="true" />
      <span>{showNumber ? formatPhoneDisplay(phone) : label}</span>
      {showNumber && label ? <span className="sr-only">{label}</span> : null}
    </a>
  );
}

export function WhatsAppButton({
  phone,
  label,
  text,
  className,
  variant = "outline",
  size = "md",
}: ButtonProps & { text?: string }) {
  if (!phone) return null;
  return (
    <a
      href={whatsappHref(phone, text)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(variantClass[variant], size === "sm" && "btn-sm", className)}
    >
      <WhatsAppIcon />
      <span>{label ?? "WhatsApp"}</span>
    </a>
  );
}

/** Inline phone number link for body text and footers. */
export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  if (!phone) return null;
  return (
    <a href={telHref(phone)} className={cn("font-semibold tabular-nums hover:underline", className)}>
      {formatPhoneDisplay(phone)}
    </a>
  );
}
