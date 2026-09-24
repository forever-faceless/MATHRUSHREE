# Mathrushree Housing Co-operative Society — website & admin

Live at **https://mathrushree.vercel.app** (admin at `/admin`). Hosted on Vercel with a Turso database and a
Vercel Blob store, all in the Mumbai region.

Bilingual (English / ಕನ್ನಡ) website for Mathrushree Housing Co-operative Society Limited, Hassan, with a
private admin panel for uploading projects (layouts), the sites inside them, GPS locations with distances to
key landmarks, the managing committee, testimonials, and an enquiry inbox for qualified leads.

## What is inside

| Area | Highlights |
| --- | --- |
| Public site | Home, Projects, Project detail, Site detail, About, Committee, Contact, Enquire. Every page exists at `/en/…` and `/kn/…`. |
| Maps | Leaflet + OpenStreetMap (no API key). Layout pin, per-site pins, dashed lines to landmarks, straight-line distance and estimated drive time, "Open in Google Maps" and "Get directions" buttons. |
| Leads | Enquiry form on every project and site page (site pre-selected). Validates Indian mobile numbers, has a honeypot and rate limit, stores leads in the database. Admin gets one-tap Call / WhatsApp buttons, status tracking, notes and CSV export. |
| Phone-first | The society phone number is in the header, hero, CTA band, footer, every project/site page and a sticky Call / WhatsApp / Enquire bar on mobile. |
| Admin | `/admin` — projects (bilingual fields, photos, layout plan, brochure PDF, approvals, amenities), landmarks with a "paste from Google Maps" coordinate helper, sites (single or bulk-generate a numbered run, quick status changes), committee, testimonials, enquiries, society settings. |
| Storage | SQLite file locally, Turso (libSQL) in production. Images on local disk locally, Vercel Blob or Cloudinary in production. All switch by environment variable only. |

## Run it locally

```bash
npm install
npm run assets     # cuts the logo out of its background, builds favicon + demo placeholder images
npm run db:seed    # loads DEMO content (3 projects, 48 sites, landmarks, committee, testimonials)
npm run dev
```

Open http://localhost:3000 (redirects to `/en`, or `/kn` if the browser prefers Kannada).

Admin: http://localhost:3000/admin — credentials are in `.env.local` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
Change them before going live.

> Everything the seed inserts is placeholder data: phone numbers, registration number, approval numbers,
> committee names, coordinates and prices. Replace it from the admin panel, or run
> `npm run db:seed -- --reset` after editing `scripts/seed.ts`.

## Environment variables

See `.env.example`. The important ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `file:./data/local.db` locally, `libsql://…turso.io` in production |
| `TURSO_AUTH_TOKEN` | Turso token (production only) |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin login |
| `AUTH_SECRET` | Long random string that signs the admin session cookie |
| `UPLOAD_DIR` | Folder for uploaded images when neither Blob nor Cloudinary is configured |
| `BLOB_READ_WRITE_TOKEN` | Injected by Vercel when a Blob store is connected; uploads then go to Vercel Blob |
| `CLOUDINARY_URL` | When set, uploads go to Cloudinary (takes precedence over Blob) |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for the sitemap and Open Graph tags |

## Deploy for (almost) free

1. **Hosting — Vercel** (Hobby plan). Import the repository at vercel.com/new and deploy.
   Then in the project settings add `ADMIN_USERNAME`, `ADMIN_PASSWORD` and a long random `AUTH_SECRET`.

2. **Database — Turso** via the Vercel Marketplace (Storage → Turso, free plan). It injects
   `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` into the project; the app reads both.
   Migrations in `drizzle/` run automatically on first request. To load the demo content, pull the
   variables locally (`vercel env pull`) and run `npm run db:seed`, or start empty and add content in the admin.
   You can also create the database at turso.tech and set `DATABASE_URL` + `TURSO_AUTH_TOKEN` by hand.

3. **Images — Vercel Blob** (Storage → Blob, included on Hobby). Connecting a store injects
   `BLOB_READ_WRITE_TOKEN`; nothing else to configure. Cloudinary works as an alternative via `CLOUDINARY_URL`.

Redeploy once after connecting storage so the new variables are picked up.

Any Node host works too (`npm run build && npm start`); with a persistent disk you can skip Cloudinary and keep `UPLOAD_DIR`.

## Day-to-day content management

- **New layout:** Admin → Projects → New project. Save the basics, then upload photos, the layout plan and
  brochure, add landmarks, and create sites (use "Create many sites at once" for a numbered run such as 1–120 of 30×40).
- **GPS coordinates:** in Google Maps, right-click the spot → click the coordinates to copy → paste into
  the "Paste from Google Maps" box; latitude and longitude fill in automatically.
- **Distances:** landmarks are stored per project (bus stand, railway station, highway, hospital, schools…).
  The site computes straight-line distance and an estimated drive time; enter minutes manually to override.
- **Bilingual text:** every field has an English and a ಕನ್ನಡ version. Kannada falls back to English when empty.
  Lists such as amenities are one item per line in the form `English | ಕನ್ನಡ`.
- **Leads:** Admin → Enquiries. Call or WhatsApp with one tap, set the status (new → contacted → qualified → closed), add notes, export CSV.

## Project structure

```
src/app/(site)/[locale]/     public pages (en / kn)
src/app/(admin)/admin/       admin panel
src/app/uploads/[...path]/   serves locally stored uploads
src/components/site/         public UI (map, gallery, site grid, enquiry form, …)
src/components/admin/        admin UI (forms, tables, media manager)
src/lib/db/                  Drizzle schema, client (auto-migrates), queries
src/lib/actions/             server actions (auth, projects, sites, landmarks, leads, …)
src/lib/i18n/                dictionaries and locale helpers
src/lib/storage.ts           image processing + local/Cloudinary storage
src/proxy.ts                 locale redirect + admin session guard
drizzle/                     SQL migrations (generated from src/lib/db/schema.ts)
scripts/                     assets.ts (logo/favicon/placeholders), seed.ts (demo data)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck`, `npm run lint` | TypeScript and ESLint |
| `npm run db:generate` | Generate a new migration after editing `schema.ts` |
| `npm run db:seed [-- --reset]` | Insert demo content (optionally wiping existing content) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run assets` | Rebuild logo cut-outs, favicon and placeholder images |
