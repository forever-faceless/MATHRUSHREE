import Link from "next/link";
import { en } from "@/lib/i18n/dictionaries/en";
import { kn } from "@/lib/i18n/dictionaries/kn";

/** Bilingual on purpose: not-found pages receive no params, so we speak both languages. */
export default function NotFound() {
  return (
    <section className="container-x py-24 text-center sm:py-32">
      <p className="font-display text-7xl font-semibold text-gold-500">404</p>
      <h1 className="display-2 mt-4 text-olive-900">{en.notFound.title}</h1>
      <p className="mt-2 font-display text-2xl text-olive-700" lang="kn">
        {kn.notFound.title}
      </p>
      <p className="mx-auto mt-6 max-w-md text-ink-500">{en.notFound.text}</p>
      <p className="mx-auto mt-1 max-w-md text-ink-500" lang="kn">
        {kn.notFound.text}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/en" className="btn-olive">
          {en.notFound.home}
        </Link>
        <Link href="/kn" className="btn-outline" lang="kn">
          {kn.notFound.home}
        </Link>
      </div>
    </section>
  );
}
