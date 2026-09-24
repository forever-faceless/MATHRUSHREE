import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="surface-dark flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Image src="/brand/logo-lockup.png" alt="Mathrushree Housing Co-operative Society Limited, Hassan" width={280} height={236} priority className="h-auto w-56" />
        </div>
        <div className="card mt-8 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-olive-900">Society login</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage projects, sites, committee and enquiries.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
        <p className="mt-6 text-center text-xs text-gold-100/50">
          <Link href="/en" className="hover:text-gold-300">
            ← Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
