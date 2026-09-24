"use client";

import { ExternalLink, FolderKanban, Home, LogOut, Menu, MessageSquareText, Quote, Settings, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/projects", label: "Projects & sites", icon: FolderKanban },
  { href: "/admin/leads", label: "Enquiries", icon: MessageSquareText },
  { href: "/admin/committee", label: "Committee", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/settings", label: "Society settings", icon: Settings },
];

export function AdminShell({ user, newLeads, children }: { user: string; newLeads: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    // Close the mobile menu after navigating (state derived from a prop change, no effect needed).
    setLastPath(pathname);
    setOpen(false);
  }

  const links = (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-gold-500/15 text-gold-200" : "text-gold-100/70 hover:bg-gold-300/10 hover:text-gold-100",
            )}
          >
            <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/leads" && newLeads > 0 ? <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-bold text-olive-900">{newLeads}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-2 border-t border-gold-300/10 pt-4">
      <a href="/en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gold-100/70 hover:bg-gold-300/10 hover:text-gold-100">
        <ExternalLink className="h-4 w-4" /> View website
      </a>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gold-100/70 hover:bg-gold-300/10 hover:text-gold-100">
          <LogOut className="h-4 w-4" /> Sign out <span className="ml-auto text-xs text-gold-100/40">{user}</span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="surface-dark hidden min-h-screen flex-col justify-between p-5 lg:flex">
        <div>
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/brand/logo-mark.png" alt="" width={44} height={40} className="h-10 w-auto" />
            <span className="font-display text-xl font-semibold text-gold-300">Mathrushree</span>
          </Link>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-100/40">Society admin</p>
          <div className="mt-8">{links}</div>
        </div>
        {footer}
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="surface-dark sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/brand/logo-mark.png" alt="" width={36} height={32} className="h-8 w-auto" />
            <span className="font-display text-lg font-semibold text-gold-300">Admin</span>
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gold-200" aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>
        {open ? (
          <div className="surface-dark space-y-4 border-b border-gold-300/10 p-4 lg:hidden">
            {links}
            {footer}
          </div>
        ) : null}
        <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
