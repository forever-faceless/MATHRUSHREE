import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <p className="font-display text-5xl font-semibold text-gold-500">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-olive-900">Not found</h1>
      <p className="mt-2 text-sm text-ink-500">This item may have been deleted.</p>
      <Link href="/admin" className="btn-olive mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}
