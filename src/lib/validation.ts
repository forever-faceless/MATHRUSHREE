import { z } from "zod";
import { FACINGS, LANDMARK_CATEGORIES, LEAD_PURPOSES, PROJECT_STATUSES, SITE_STATUSES } from "@/lib/db/schema";
import { isIndianMobile } from "@/lib/utils";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().finite().nullable(),
);

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? null : Math.round(Number(v))),
  z.number().int().nullable(),
);

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().refine(isIndianMobile, "invalid_phone"),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).default(""),
  projectId: optionalInt,
  siteId: optionalInt,
  purpose: z.enum(LEAD_PURPOSES).default("self_use"),
  budget: z.string().trim().max(60).default(""),
  timeline: z.string().trim().max(60).default(""),
  message: z.string().trim().max(1500).default(""),
  locale: z.enum(["en", "kn"]).default("en"),
  source: z.string().trim().max(200).default(""),
  consent: z.literal(true, { error: "consent_required" }),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).default(""),
});

export const projectSchema = z.object({
  nameEn: z.string().trim().min(2).max(120),
  nameKn: z.string().trim().max(160).default(""),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  taglineEn: z.string().trim().max(200).default(""),
  taglineKn: z.string().trim().max(240).default(""),
  descriptionEn: z.string().trim().max(8000).default(""),
  descriptionKn: z.string().trim().max(10000).default(""),
  locationEn: z.string().trim().max(200).default(""),
  locationKn: z.string().trim().max(240).default(""),
  lat: optionalNumber,
  lng: optionalNumber,
  totalAreaAcres: optionalNumber,
  totalSites: optionalInt,
  status: z.enum(PROJECT_STATUSES),
  priceFrom: optionalInt,
  pricePerSqft: optionalInt,
  brochureUrl: z.string().trim().max(500).default(""),
  videoUrl: z.string().trim().max(500).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()).default(0),
});

export const siteSchema = z.object({
  siteNumber: z.string().trim().min(1).max(20),
  dimension: z.string().trim().max(40).default(""),
  widthFt: optionalNumber,
  depthFt: optionalNumber,
  areaSqft: optionalNumber,
  facing: z.union([z.literal(""), z.enum(FACINGS)]).default(""),
  roadWidthFt: optionalNumber,
  corner: z.boolean().default(false),
  status: z.enum(SITE_STATUSES),
  price: optionalInt,
  pricePerSqft: optionalInt,
  lat: optionalNumber,
  lng: optionalNumber,
  descriptionEn: z.string().trim().max(4000).default(""),
  descriptionKn: z.string().trim().max(5000).default(""),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()).default(0),
});

export const landmarkSchema = z.object({
  nameEn: z.string().trim().min(1).max(120),
  nameKn: z.string().trim().max(160).default(""),
  category: z.enum(LANDMARK_CATEGORIES),
  lat: z.coerce.number().finite().min(-90).max(90),
  lng: z.coerce.number().finite().min(-180).max(180),
  driveMinutes: optionalInt,
});

export const committeeSchema = z.object({
  nameEn: z.string().trim().min(2).max(120),
  nameKn: z.string().trim().max(160).default(""),
  roleEn: z.string().trim().max(120).default(""),
  roleKn: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(20).default(""),
  bioEn: z.string().trim().max(2000).default(""),
  bioKn: z.string().trim().max(2500).default(""),
  published: z.boolean().default(true),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()).default(0),
});

export const testimonialSchema = z.object({
  nameEn: z.string().trim().min(2).max(120),
  nameKn: z.string().trim().max(160).default(""),
  locationEn: z.string().trim().max(120).default(""),
  locationKn: z.string().trim().max(160).default(""),
  quoteEn: z.string().trim().max(1200).default(""),
  quoteKn: z.string().trim().max(1500).default(""),
  projectId: optionalInt,
  published: z.boolean().default(true),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()).default(0),
});

export const settingsSchema = z.object({
  societyNameEn: z.string().trim().min(2).max(200),
  societyNameKn: z.string().trim().max(240).default(""),
  taglineEn: z.string().trim().max(200).default(""),
  taglineKn: z.string().trim().max(240).default(""),
  phonePrimary: z.string().trim().max(20).default(""),
  phoneSecondary: z.string().trim().max(20).default(""),
  whatsapp: z.string().trim().max(20).default(""),
  email: z.string().trim().max(120).default(""),
  addressEn: z.string().trim().max(500).default(""),
  addressKn: z.string().trim().max(600).default(""),
  regNumber: z.string().trim().max(80).default(""),
  establishedYear: optionalInt,
  aboutEn: z.string().trim().max(8000).default(""),
  aboutKn: z.string().trim().max(10000).default(""),
  heroTitleEn: z.string().trim().max(200).default(""),
  heroTitleKn: z.string().trim().max(240).default(""),
  heroSubtitleEn: z.string().trim().max(400).default(""),
  heroSubtitleKn: z.string().trim().max(480).default(""),
  officeLat: optionalNumber,
  officeLng: optionalNumber,
  workingHoursEn: z.string().trim().max(120).default(""),
  workingHoursKn: z.string().trim().max(160).default(""),
  statMembers: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int().min(0)).default(0),
  statSitesAllotted: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int().min(0)).default(0),
  statProjectsCompleted: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int().min(0)).default(0),
  facebookUrl: z.string().trim().max(300).default(""),
  instagramUrl: z.string().trim().max(300).default(""),
  youtubeUrl: z.string().trim().max(300).default(""),
});

export type LeadInput = z.infer<typeof leadSchema>;
