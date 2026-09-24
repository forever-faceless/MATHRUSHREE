/**
 * Seeds DEMO content so the site looks alive on first run.
 * Everything here (names, phone numbers, approval numbers, coordinates) is placeholder
 * data to be replaced from the admin panel. Run with: npm run db:seed
 * Add --reset to wipe existing content first.
 */
import { getDb } from "../src/lib/db/client";
import {
  committeeMembers,
  landmarks,
  leads,
  projects,
  settings,
  sites,
  testimonials,
  type Facing,
  type NewSite,
  type SiteStatus,
} from "../src/lib/db/schema";

async function main() {
  const db = await getDb();
  const reset = process.argv.includes("--reset");

  const existing = await db.query.projects.findFirst();
  if (existing && !reset) {
    console.log("Database already has content. Use `npm run db:seed -- --reset` to replace it.");
    return;
  }
  if (reset) {
    await db.delete(leads);
    await db.delete(testimonials);
    await db.delete(sites);
    await db.delete(landmarks);
    await db.delete(projects);
    await db.delete(committeeMembers);
    await db.delete(settings);
  }

  await db
    .insert(settings)
    .values({
      id: 1,
      taglineEn: "Approved layouts. Clear titles. A society you can meet in person.",
      taglineKn: "ಅನುಮೋದಿತ ಲೇಔಟ್‌ಗಳು. ಸ್ಪಷ್ಟ ಹಕ್ಕುಪತ್ರ. ಖುದ್ದಾಗಿ ಭೇಟಿಯಾಗಬಹುದಾದ ಸೊಸೈಟಿ.",
      phonePrimary: "9448012345",
      phoneSecondary: "8172233445",
      whatsapp: "9448012345",
      email: "info@mathrushreehassan.in",
      addressEn: "Mathrushree Housing Co-operative Society Ltd., 1st Floor, Society Building, B.M. Road, Hassan – 573201, Karnataka",
      addressKn: "ಮಾತೃಶ್ರೀ ಹೌಸಿಂಗ್ ಕೋ-ಆಪರೇಟಿವ್ ಸೊಸೈಟಿ ಲಿ., 1ನೇ ಮಹಡಿ, ಸೊಸೈಟಿ ಕಟ್ಟಡ, ಬಿ.ಎಂ. ರಸ್ತೆ, ಹಾಸನ – 573201, ಕರ್ನಾಟಕ",
      regNumber: "HSN/HSG/2016-17/123",
      establishedYear: 2016,
      aboutEn:
        "Mathrushree Housing Co-operative Society Limited was formed in Hassan by a group of residents who wanted a safer way to own a residential site: land bought in the society's name, approvals obtained before a single plot is sold, and allotment done openly among members.\n\nToday the society has delivered several layouts around Hassan town. Every layout is developed with proper roads, drainage, water supply and street lighting before handover, and every allotment ends with a registered sale deed and khata in the member's name.",
      aboutKn:
        "ಮಾತೃಶ್ರೀ ಹೌಸಿಂಗ್ ಕೋ-ಆಪರೇಟಿವ್ ಸೊಸೈಟಿ ಲಿಮಿಟೆಡ್ ಅನ್ನು ಹಾಸನದ ನಿವಾಸಿಗಳ ಗುಂಪೊಂದು ವಸತಿ ನಿವೇಶನವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಹೊಂದುವ ಉದ್ದೇಶದಿಂದ ಸ್ಥಾಪಿಸಿತು: ಸೊಸೈಟಿಯ ಹೆಸರಿನಲ್ಲಿ ಜಮೀನು ಖರೀದಿ, ಒಂದೇ ಒಂದು ನಿವೇಶನ ಮಾರುವ ಮೊದಲು ಅನುಮೋದನೆ, ಮತ್ತು ಸದಸ್ಯರ ನಡುವೆ ಮುಕ್ತ ಹಂಚಿಕೆ.\n\nಇಂದು ಸೊಸೈಟಿ ಹಾಸನ ನಗರದ ಸುತ್ತ ಹಲವು ಲೇಔಟ್‌ಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದೆ. ಪ್ರತಿ ಲೇಔಟ್‌ನಲ್ಲಿ ಹಸ್ತಾಂತರಕ್ಕೆ ಮೊದಲು ಸರಿಯಾದ ರಸ್ತೆ, ಒಳಚರಂಡಿ, ನೀರು ಸರಬರಾಜು ಮತ್ತು ಬೀದಿ ದೀಪಗಳನ್ನು ಅಳವಡಿಸಲಾಗುತ್ತದೆ. ಪ್ರತಿ ಹಂಚಿಕೆಯೂ ಸದಸ್ಯರ ಹೆಸರಿನಲ್ಲಿ ನೋಂದಾಯಿತ ಕ್ರಯಪತ್ರ ಮತ್ತು ಖಾತೆಯೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳುತ್ತದೆ.",
      heroImage: "/demo/hero.webp",
      officeLat: 13.0048,
      officeLng: 76.1012,
      workingHoursEn: "Mon – Sat, 10:00 AM – 6:00 PM",
      workingHoursKn: "ಸೋಮ – ಶನಿ, ಬೆಳಿಗ್ಗೆ 10:00 – ಸಂಜೆ 6:00",
      statMembers: 850,
      statSitesAllotted: 1240,
      statProjectsCompleted: 4,
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: { heroImage: "/demo/hero.webp", phonePrimary: "9448012345", whatsapp: "9448012345" },
    });

  const amenities = [
    { en: "30 ft and 40 ft asphalted roads", kn: "30 ಮತ್ತು 40 ಅಡಿ ಡಾಂಬರು ರಸ್ತೆಗಳು" },
    { en: "Underground drainage", kn: "ಭೂಗತ ಒಳಚರಂಡಿ" },
    { en: "Overhead tank and piped water to every site", kn: "ಓವರ್‌ಹೆಡ್ ಟ್ಯಾಂಕ್ ಮತ್ತು ಪ್ರತಿ ನಿವೇಶನಕ್ಕೆ ಕೊಳವೆ ನೀರು" },
    { en: "Street lights on every road", kn: "ಪ್ರತಿ ರಸ್ತೆಯಲ್ಲಿ ಬೀದಿ ದೀಪಗಳು" },
    { en: "Children's park and open spaces", kn: "ಮಕ್ಕಳ ಉದ್ಯಾನವನ ಮತ್ತು ತೆರೆದ ಸ್ಥಳಗಳು" },
    { en: "Avenue plantation", kn: "ರಸ್ತೆ ಬದಿ ಸಸಿ ನೆಡುವಿಕೆ" },
    { en: "Compound wall with gated entry", kn: "ಆವರಣ ಗೋಡೆ ಮತ್ತು ಗೇಟ್ ಪ್ರವೇಶ" },
    { en: "Individual electricity connections", kn: "ಪ್ರತ್ಯೇಕ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ" },
  ];

  const approvals = [
    { en: "Layout approval – Hassan Urban Development Authority (HUDA)", kn: "ಲೇಔಟ್ ಅನುಮೋದನೆ – ಹಾಸನ ನಗರಾಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ", number: "HUDA/LAY/2023-24/041" },
    { en: "Land conversion order – Deputy Commissioner, Hassan", kn: "ಭೂ ಪರಿವರ್ತನೆ ಆದೇಶ – ಜಿಲ್ಲಾಧಿಕಾರಿ, ಹಾಸನ", number: "ALN(H)SR 118/2022-23" },
    { en: "Khata and up-to-date tax receipts", kn: "ಖಾತೆ ಮತ್ತು ನವೀಕೃತ ತೆರಿಗೆ ರಶೀದಿಗಳು", number: "" },
    { en: "Encumbrance certificate – 30 years", kn: "ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ – 30 ವರ್ಷ", number: "" },
  ];

  const [enclave] = await db
    .insert(projects)
    .values({
      slug: "mathrushree-enclave-phase-2",
      nameEn: "Mathrushree Enclave, Phase 2",
      nameKn: "ಮಾತೃಶ್ರೀ ಎನ್‌ಕ್ಲೇವ್, ಹಂತ 2",
      taglineEn: "HUDA-approved layout beside the Hassan ring road",
      taglineKn: "ಹಾಸನ ರಿಂಗ್ ರಸ್ತೆಯ ಪಕ್ಕದ HUDA ಅನುಮೋದಿತ ಲೇಔಟ್",
      descriptionEn:
        "Phase 2 of Mathrushree Enclave extends the society's most popular layout with 240 residential sites on 18.5 acres, minutes from the ring road and the NH-75 junction.\n\nThe layout offers 30×40, 30×50 and 40×60 sites with 30 ft and 40 ft roads, underground drainage and piped water. A central park and avenue trees are part of the approved plan. Registration is done in the member's name on full payment.",
      descriptionKn:
        "ಮಾತೃಶ್ರೀ ಎನ್‌ಕ್ಲೇವ್‌ನ ಹಂತ 2 ಸೊಸೈಟಿಯ ಅತ್ಯಂತ ಜನಪ್ರಿಯ ಲೇಔಟ್ ಅನ್ನು 18.5 ಎಕರೆಯಲ್ಲಿ 240 ವಸತಿ ನಿವೇಶನಗಳೊಂದಿಗೆ ವಿಸ್ತರಿಸುತ್ತದೆ. ರಿಂಗ್ ರಸ್ತೆ ಮತ್ತು NH-75 ಜಂಕ್ಷನ್‌ನಿಂದ ಕೆಲವೇ ನಿಮಿಷಗಳ ದೂರ.\n\nಲೇಔಟ್‌ನಲ್ಲಿ 30×40, 30×50 ಮತ್ತು 40×60 ನಿವೇಶನಗಳು, 30 ಮತ್ತು 40 ಅಡಿ ರಸ್ತೆಗಳು, ಭೂಗತ ಒಳಚರಂಡಿ ಮತ್ತು ಕೊಳವೆ ನೀರು ಲಭ್ಯ. ಕೇಂದ್ರ ಉದ್ಯಾನವನ ಮತ್ತು ರಸ್ತೆ ಬದಿ ಮರಗಳು ಅನುಮೋದಿತ ಯೋಜನೆಯ ಭಾಗ. ಪೂರ್ಣ ಪಾವತಿಯ ನಂತರ ಸದಸ್ಯರ ಹೆಸರಿನಲ್ಲಿ ನೋಂದಣಿ.",
      locationEn: "Near Ring Road, Hassan",
      locationKn: "ರಿಂಗ್ ರಸ್ತೆ ಬಳಿ, ಹಾಸನ",
      lat: 13.023,
      lng: 76.127,
      totalAreaAcres: 18.5,
      totalSites: 240,
      status: "ongoing",
      approvals,
      amenities,
      coverImage: "/demo/enclave-cover.webp",
      gallery: ["/demo/enclave-1.webp", "/demo/enclave-2.webp", "/demo/enclave-3.webp"],
      layoutPlanImage: "/demo/layout-plan.webp",
      priceFrom: 1740000,
      pricePerSqft: 1450,
      featured: true,
      published: true,
      sortOrder: 1,
    })
    .returning({ id: projects.id });

  const [gardens] = await db
    .insert(projects)
    .values({
      slug: "mathrushree-gardens",
      nameEn: "Mathrushree Gardens",
      nameKn: "ಮಾತೃಶ್ರೀ ಗಾರ್ಡನ್ಸ್",
      taglineEn: "Our first completed layout on Salagame Road, fully allotted",
      taglineKn: "ಸಾಲಗಾಮೆ ರಸ್ತೆಯಲ್ಲಿ ನಮ್ಮ ಮೊದಲ ಪೂರ್ಣಗೊಂಡ ಲೇಔಟ್, ಸಂಪೂರ್ಣ ಹಂಚಿಕೆ",
      descriptionEn:
        "Mathrushree Gardens was the society's first layout: 120 sites on 9 acres along Salagame Road. All sites were allotted and registered to members, and today more than sixty families have built homes here.\n\nThe layout stands as a reference for how the society works: land title verified before purchase, approvals before allotment, and infrastructure completed before handover.",
      descriptionKn:
        "ಮಾತೃಶ್ರೀ ಗಾರ್ಡನ್ಸ್ ಸೊಸೈಟಿಯ ಮೊದಲ ಲೇಔಟ್: ಸಾಲಗಾಮೆ ರಸ್ತೆಯಲ್ಲಿ 9 ಎಕರೆಯಲ್ಲಿ 120 ನಿವೇಶನಗಳು. ಎಲ್ಲಾ ನಿವೇಶನಗಳನ್ನು ಸದಸ್ಯರಿಗೆ ಹಂಚಿ ನೋಂದಣಿ ಮಾಡಲಾಗಿದೆ. ಇಂದು ಅರವತ್ತಕ್ಕೂ ಹೆಚ್ಚು ಕುಟುಂಬಗಳು ಇಲ್ಲಿ ಮನೆ ಕಟ್ಟಿಕೊಂಡಿವೆ.\n\nಈ ಲೇಔಟ್ ಸೊಸೈಟಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂಬುದಕ್ಕೆ ಉದಾಹರಣೆ: ಖರೀದಿಗೆ ಮೊದಲು ಹಕ್ಕು ಪರಿಶೀಲನೆ, ಹಂಚಿಕೆಗೆ ಮೊದಲು ಅನುಮೋದನೆ, ಹಸ್ತಾಂತರಕ್ಕೆ ಮೊದಲು ಮೂಲಸೌಕರ್ಯ.",
      locationEn: "Salagame Road, Hassan",
      locationKn: "ಸಾಲಗಾಮೆ ರಸ್ತೆ, ಹಾಸನ",
      lat: 12.987,
      lng: 76.085,
      totalAreaAcres: 9,
      totalSites: 120,
      status: "sold_out",
      approvals: approvals.slice(0, 2).map((a, i) => ({ ...a, number: i === 0 ? "HUDA/LAY/2017-18/012" : "ALN(H)SR 62/2016-17" })),
      amenities: amenities.slice(0, 6),
      coverImage: "/demo/gardens-cover.webp",
      gallery: ["/demo/gardens-1.webp"],
      featured: false,
      published: true,
      sortOrder: 3,
    })
    .returning({ id: projects.id });

  const [greens] = await db
    .insert(projects)
    .values({
      slug: "mathrushree-greens-dudda",
      nameEn: "Mathrushree Greens, Dudda",
      nameKn: "ಮಾತೃಶ್ರೀ ಗ್ರೀನ್ಸ್, ದುದ್ದ",
      taglineEn: "Upcoming layout on the Hassan–Belur road, bookings opening soon",
      taglineKn: "ಹಾಸನ–ಬೇಲೂರು ರಸ್ತೆಯಲ್ಲಿ ಮುಂಬರುವ ಲೇಔಟ್, ಬುಕಿಂಗ್ ಶೀಘ್ರದಲ್ಲೇ",
      descriptionEn:
        "Mathrushree Greens is planned on 14 acres near Dudda on the Hassan–Belur road. Land purchase is complete and the layout plan has been submitted for approval. Sites will be listed here once approval is received. Members can register interest now to get priority in allotment.",
      descriptionKn:
        "ಮಾತೃಶ್ರೀ ಗ್ರೀನ್ಸ್ ಹಾಸನ–ಬೇಲೂರು ರಸ್ತೆಯ ದುದ್ದ ಬಳಿ 14 ಎಕರೆಯಲ್ಲಿ ಯೋಜಿಸಲಾಗಿದೆ. ಜಮೀನು ಖರೀದಿ ಪೂರ್ಣಗೊಂಡಿದ್ದು ಲೇಔಟ್ ನಕ್ಷೆಯನ್ನು ಅನುಮೋದನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ. ಅನುಮೋದನೆ ದೊರೆತ ಕೂಡಲೇ ನಿವೇಶನಗಳನ್ನು ಇಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಲಾಗುವುದು. ಹಂಚಿಕೆಯಲ್ಲಿ ಆದ್ಯತೆ ಪಡೆಯಲು ಸದಸ್ಯರು ಈಗಲೇ ಆಸಕ್ತಿ ನೋಂದಾಯಿಸಬಹುದು.",
      locationEn: "Dudda, Hassan–Belur Road",
      locationKn: "ದುದ್ದ, ಹಾಸನ–ಬೇಲೂರು ರಸ್ತೆ",
      lat: 13.065,
      lng: 76.03,
      totalAreaAcres: 14,
      totalSites: 180,
      status: "upcoming",
      approvals: [{ en: "Layout plan submitted to HUDA for approval", kn: "ಲೇಔಟ್ ನಕ್ಷೆಯನ್ನು HUDA ಅನುಮೋದನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ", number: "" }],
      amenities: amenities.slice(0, 5),
      coverImage: "/demo/greens-cover.webp",
      gallery: [],
      featured: true,
      published: true,
      sortOrder: 2,
    })
    .returning({ id: projects.id });

  // Landmarks (approximate demo coordinates around Hassan town)
  await db.insert(landmarks).values([
    { projectId: enclave.id, nameEn: "Hassan KSRTC Bus Stand", nameKn: "ಹಾಸನ ಕೆಎಸ್ಆರ್‌ಟಿಸಿ ಬಸ್ ನಿಲ್ದಾಣ", category: "bus_stand", lat: 13.0033, lng: 76.1046, driveMinutes: 12, sortOrder: 1 },
    { projectId: enclave.id, nameEn: "Hassan Railway Station", nameKn: "ಹಾಸನ ರೈಲು ನಿಲ್ದಾಣ", category: "railway", lat: 13.0112, lng: 76.1141, driveMinutes: 8, sortOrder: 2 },
    { projectId: enclave.id, nameEn: "NH-75 (B.M. Road) junction", nameKn: "NH-75 (ಬಿ.ಎಂ. ರಸ್ತೆ) ಜಂಕ್ಷನ್", category: "highway", lat: 13.018, lng: 76.123, driveMinutes: 3, sortOrder: 3 },
    { projectId: enclave.id, nameEn: "HIMS Hospital", nameKn: "ಹಿಮ್ಸ್ ಆಸ್ಪತ್ರೆ", category: "hospital", lat: 13.0035, lng: 76.0919, driveMinutes: 15, sortOrder: 4 },
    { projectId: enclave.id, nameEn: "Malnad College of Engineering", nameKn: "ಮಲೆನಾಡು ಇಂಜಿನಿಯರಿಂಗ್ ಕಾಲೇಜು", category: "college", lat: 12.999, lng: 76.121, driveMinutes: 10, sortOrder: 5 },
    { projectId: enclave.id, nameEn: "Hasanamba Temple", nameKn: "ಹಾಸನಾಂಬ ದೇವಸ್ಥಾನ", category: "temple", lat: 13.0085, lng: 76.1, driveMinutes: 12, sortOrder: 6 },
    { projectId: enclave.id, nameEn: "Hassan Industrial Area (KIADB)", nameKn: "ಹಾಸನ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ (KIADB)", category: "industrial", lat: 13.029, lng: 76.14, driveMinutes: 5, sortOrder: 7 },
    { projectId: enclave.id, nameEn: "Hassan city centre (N.R. Circle)", nameKn: "ಹಾಸನ ನಗರ ಕೇಂದ್ರ (ಎನ್.ಆರ್. ವೃತ್ತ)", category: "city_centre", lat: 13.0072, lng: 76.0996, driveMinutes: 12, sortOrder: 0 },
    { projectId: gardens.id, nameEn: "Hassan KSRTC Bus Stand", nameKn: "ಹಾಸನ ಕೆಎಸ್ಆರ್‌ಟಿಸಿ ಬಸ್ ನಿಲ್ದಾಣ", category: "bus_stand", lat: 13.0033, lng: 76.1046, driveMinutes: 10, sortOrder: 1 },
    { projectId: gardens.id, nameEn: "HIMS Hospital", nameKn: "ಹಿಮ್ಸ್ ಆಸ್ಪತ್ರೆ", category: "hospital", lat: 13.0035, lng: 76.0919, driveMinutes: 7, sortOrder: 2 },
    { projectId: gardens.id, nameEn: "Hassan city centre (N.R. Circle)", nameKn: "ಹಾಸನ ನಗರ ಕೇಂದ್ರ (ಎನ್.ಆರ್. ವೃತ್ತ)", category: "city_centre", lat: 13.0072, lng: 76.0996, driveMinutes: 9, sortOrder: 0 },
    { projectId: greens.id, nameEn: "Hassan city centre (N.R. Circle)", nameKn: "ಹಾಸನ ನಗರ ಕೇಂದ್ರ (ಎನ್.ಆರ್. ವೃತ್ತ)", category: "city_centre", lat: 13.0072, lng: 76.0996, driveMinutes: 20, sortOrder: 0 },
    { projectId: greens.id, nameEn: "Hassan–Belur State Highway", nameKn: "ಹಾಸನ–ಬೇಲೂರು ರಾಜ್ಯ ಹೆದ್ದಾರಿ", category: "highway", lat: 13.062, lng: 76.032, driveMinutes: 2, sortOrder: 1 },
    { projectId: greens.id, nameEn: "Hassan Railway Station", nameKn: "ಹಾಸನ ರೈಲು ನಿಲ್ದಾಣ", category: "railway", lat: 13.0112, lng: 76.1141, driveMinutes: 25, sortOrder: 2 },
  ]);

  // Sites for the ongoing project: three dimensions, mixed facings and statuses.
  const dims = [
    { w: 30, d: 40 },
    { w: 30, d: 50 },
    { w: 40, d: 60 },
  ];
  const facings: Facing[] = ["E", "W", "N", "S", "NE", "SE"];
  const statuses: SiteStatus[] = ["available", "available", "available", "booked", "available", "sold", "available", "reserved"];
  const rate = 1450;
  const rows: NewSite[] = [];
  const baseLat = 13.0222;
  const baseLng = 76.1262;
  for (let n = 1; n <= 48; n++) {
    const dim = dims[n % 7 === 0 ? 2 : n % 3 === 0 ? 1 : 0];
    const area = dim.w * dim.d;
    const corner = n % 8 === 1;
    const facing = facings[n % facings.length];
    const status = statuses[n % statuses.length];
    const premium = corner ? 1.05 : 1;
    const row = Math.floor((n - 1) / 8);
    const col = (n - 1) % 8;
    rows.push({
      projectId: enclave.id,
      siteNumber: String(n),
      dimension: `${dim.w} × ${dim.d}`,
      widthFt: dim.w,
      depthFt: dim.d,
      areaSqft: area,
      facing,
      roadWidthFt: col === 0 || col === 7 ? 40 : 30,
      corner,
      status,
      pricePerSqft: rate,
      price: Math.round((area * rate * premium) / 1000) * 1000,
      lat: n <= 24 ? baseLat + row * 0.00032 : null,
      lng: n <= 24 ? baseLng + col * 0.00028 : null,
      images: n === 1 ? ["/demo/site-1.webp", "/demo/site-2.webp"] : n % 9 === 0 ? ["/demo/site-2.webp"] : [],
      features: corner
        ? [
            { en: "Corner site with two road frontages", kn: "ಎರಡು ರಸ್ತೆ ಮುಖದ ಮೂಲೆ ನಿವೇಶನ" },
            { en: "40 ft main road", kn: "40 ಅಡಿ ಮುಖ್ಯ ರಸ್ತೆ" },
          ]
        : facing === "E"
          ? [{ en: "East facing, ideal for vaastu-compliant homes", kn: "ಪೂರ್ವ ದಿಕ್ಕು, ವಾಸ್ತು ಪ್ರಕಾರ ಮನೆಗೆ ಸೂಕ್ತ" }]
          : [],
      descriptionEn: n === 1 ? "Corner site at the layout entrance, facing the 40 ft main road and next to the proposed park." : "",
      descriptionKn: n === 1 ? "ಲೇಔಟ್ ಪ್ರವೇಶದ್ವಾರದ ಮೂಲೆ ನಿವೇಶನ, 40 ಅಡಿ ಮುಖ್ಯ ರಸ್ತೆಗೆ ಮುಖ ಮಾಡಿದೆ, ಉದ್ದೇಶಿತ ಉದ್ಯಾನವನದ ಪಕ್ಕ." : "",
      sortOrder: n,
    });
  }
  await db.insert(sites).values(rows);

  await db.insert(committeeMembers).values([
    { nameEn: "Sri H. K. Ramesh", nameKn: "ಶ್ರೀ ಎಚ್. ಕೆ. ರಮೇಶ್", roleEn: "President", roleKn: "ಅಧ್ಯಕ್ಷರು", phone: "9448012345", bioEn: "Founding member of the society and a retired bank officer. Oversees land acquisition and approvals.", bioKn: "ಸೊಸೈಟಿಯ ಸ್ಥಾಪಕ ಸದಸ್ಯರು ಮತ್ತು ನಿವೃತ್ತ ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿ. ಜಮೀನು ಖರೀದಿ ಮತ್ತು ಅನುಮೋದನೆಗಳ ಮೇಲ್ವಿಚಾರಣೆ.", sortOrder: 1 },
    { nameEn: "Smt. Lakshmi Devi B.", nameKn: "ಶ್ರೀಮತಿ ಲಕ್ಷ್ಮೀ ದೇವಿ ಬಿ.", roleEn: "Vice President", roleKn: "ಉಪಾಧ್ಯಕ್ಷರು", phone: "", bioEn: "Educationist and long-time Hassan resident. Leads member relations and the allotment committee.", bioKn: "ಶಿಕ್ಷಣ ತಜ್ಞೆ ಮತ್ತು ಹಾಸನದ ದೀರ್ಘಕಾಲದ ನಿವಾಸಿ. ಸದಸ್ಯರ ಸಂಬಂಧ ಮತ್ತು ಹಂಚಿಕೆ ಸಮಿತಿಯ ನೇತೃತ್ವ.", sortOrder: 2 },
    { nameEn: "Sri B. S. Manjunath", nameKn: "ಶ್ರೀ ಬಿ. ಎಸ್. ಮಂಜುನಾಥ್", roleEn: "Secretary", roleKn: "ಕಾರ್ಯದರ್ಶಿ", phone: "8172233445", bioEn: "Manages the society office, records and registrations. Your first point of contact for site visits.", bioKn: "ಸೊಸೈಟಿ ಕಚೇರಿ, ದಾಖಲೆಗಳು ಮತ್ತು ನೋಂದಣಿಗಳ ನಿರ್ವಹಣೆ. ನಿವೇಶನ ಭೇಟಿಗೆ ನಿಮ್ಮ ಮೊದಲ ಸಂಪರ್ಕ.", sortOrder: 3 },
    { nameEn: "Sri K. R. Nagaraj", nameKn: "ಶ್ರೀ ಕೆ. ಆರ್. ನಾಗರಾಜ್", roleEn: "Treasurer", roleKn: "ಖಜಾಂಚಿ", phone: "", bioEn: "Chartered accountant. Responsible for accounts, audits and member payment schedules.", bioKn: "ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್. ಲೆಕ್ಕಪತ್ರ, ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ಸದಸ್ಯರ ಪಾವತಿ ವೇಳಾಪಟ್ಟಿಯ ಜವಾಬ್ದಾರಿ.", sortOrder: 4 },
    { nameEn: "Sri S. Devaraj", nameKn: "ಶ್ರೀ ಎಸ್. ದೇವರಾಜ್", roleEn: "Director", roleKn: "ನಿರ್ದೇಶಕರು", phone: "", bioEn: "Civil engineer. Supervises layout development, roads and drainage works.", bioKn: "ಸಿವಿಲ್ ಇಂಜಿನಿಯರ್. ಲೇಔಟ್ ಅಭಿವೃದ್ಧಿ, ರಸ್ತೆ ಮತ್ತು ಒಳಚರಂಡಿ ಕಾಮಗಾರಿಗಳ ಮೇಲ್ವಿಚಾರಣೆ.", sortOrder: 5 },
    { nameEn: "Smt. Sowmya Gowda", nameKn: "ಶ್ರೀಮತಿ ಸೌಮ್ಯಾ ಗೌಡ", roleEn: "Director", roleKn: "ನಿರ್ದೇಶಕರು", phone: "", bioEn: "Advocate. Handles title verification and registration documentation.", bioKn: "ವಕೀಲರು. ಹಕ್ಕು ಪರಿಶೀಲನೆ ಮತ್ತು ನೋಂದಣಿ ದಾಖಲೆಗಳ ನಿರ್ವಹಣೆ.", sortOrder: 6 },
    { nameEn: "Sri T. N. Prakash", nameKn: "ಶ್ರೀ ಟಿ. ಎನ್. ಪ್ರಕಾಶ್", roleEn: "Director", roleKn: "ನಿರ್ದೇಶಕರು", phone: "", bioEn: "Farmer and member since the first layout. Represents members from the surrounding villages.", bioKn: "ರೈತರು ಮತ್ತು ಮೊದಲ ಲೇಔಟ್‌ನಿಂದ ಸದಸ್ಯರು. ಸುತ್ತಮುತ್ತಲ ಹಳ್ಳಿಗಳ ಸದಸ್ಯರ ಪ್ರತಿನಿಧಿ.", sortOrder: 7 },
  ]);

  await db.insert(testimonials).values([
    { nameEn: "Ravi Kumar M.", nameKn: "ರವಿ ಕುಮಾರ್ ಎಂ.", locationEn: "Mathrushree Gardens", locationKn: "ಮಾತೃಶ್ರೀ ಗಾರ್ಡನ್ಸ್", quoteEn: "We got our sale deed and khata within a month of the final payment. Every document was shown to us before we paid anything.", quoteKn: "ಅಂತಿಮ ಪಾವತಿಯ ಒಂದು ತಿಂಗಳೊಳಗೆ ಕ್ರಯಪತ್ರ ಮತ್ತು ಖಾತೆ ಸಿಕ್ಕಿತು. ಪಾವತಿಗೆ ಮೊದಲೇ ಪ್ರತಿ ದಾಖಲೆಯನ್ನೂ ತೋರಿಸಿದರು.", projectId: gardens.id, sortOrder: 1 },
    { nameEn: "Shobha and Girish", nameKn: "ಶೋಭಾ ಮತ್ತು ಗಿರೀಶ್", locationEn: "Members since 2018", locationKn: "2018 ರಿಂದ ಸದಸ್ಯರು", quoteEn: "The committee members live in Hassan and pick up the phone. That is what made us comfortable buying through the society.", quoteKn: "ಸಮಿತಿ ಸದಸ್ಯರು ಹಾಸನದಲ್ಲೇ ಇದ್ದಾರೆ, ಫೋನ್ ಎತ್ತುತ್ತಾರೆ. ಸೊಸೈಟಿ ಮೂಲಕ ಖರೀದಿಸಲು ನಮಗೆ ಧೈರ್ಯ ಬಂದದ್ದು ಇದರಿಂದಲೇ.", projectId: null, sortOrder: 2 },
    { nameEn: "Dr. Anitha R.", nameKn: "ಡಾ. ಅನಿತಾ ಆರ್.", locationEn: "Mathrushree Enclave", locationKn: "ಮಾತೃಶ್ರೀ ಎನ್‌ಕ್ಲೇವ್", quoteEn: "Roads, drains and street lights were finished before handover, exactly as promised in the layout plan.", quoteKn: "ಲೇಔಟ್ ನಕ್ಷೆಯಲ್ಲಿ ಭರವಸೆ ನೀಡಿದಂತೆಯೇ, ಹಸ್ತಾಂತರಕ್ಕೆ ಮೊದಲೇ ರಸ್ತೆ, ಚರಂಡಿ ಮತ್ತು ಬೀದಿ ದೀಪ ಪೂರ್ಣಗೊಂಡವು.", projectId: enclave.id, sortOrder: 3 },
  ]);

  await db.insert(leads).values([
    { name: "Suresh Gowda", phone: "9880011223", projectId: enclave.id, siteId: null, purpose: "self_use", budget: "₹20–35 lakh", timeline: "1–3 months", message: "Looking for an east-facing 30×40 site.", locale: "kn", source: "/kn/projects/mathrushree-enclave-phase-2", status: "new" },
    { name: "Priya N.", phone: "9743322110", email: "priya@example.com", projectId: enclave.id, siteId: null, purpose: "investment", budget: "₹35–50 lakh", timeline: "Within 1 month", message: "", locale: "en", source: "/en/projects/mathrushree-enclave-phase-2/sites/1", status: "contacted", notes: "Called on Monday, visiting Saturday 11am." },
  ]);

  console.log("Seeded demo content: 3 projects, 48 sites, 14 landmarks, 7 committee members, 3 testimonials, 2 leads.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
