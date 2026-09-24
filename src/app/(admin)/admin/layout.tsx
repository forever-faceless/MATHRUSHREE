import type { Metadata } from "next";
import "@/app/globals.css";
import { fontClassNames } from "@/lib/fonts";

export const dynamic = "force-dynamic";
// Image uploads process several photos per request; allow more than the 10 s serverless default.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: { default: "Society admin", template: "%s · Mathrushree admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${fontClassNames} h-full antialiased`}>
      <body className="min-h-full bg-ivory-100 text-ink-900">{children}</body>
    </html>
  );
}
