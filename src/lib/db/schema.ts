import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

export const PROJECT_STATUSES = ["upcoming", "ongoing", "completed", "sold_out"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const SITE_STATUSES = ["available", "reserved", "booked", "sold"] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export const FACINGS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"] as const;
export type Facing = (typeof FACINGS)[number];

export const LANDMARK_CATEGORIES = [
  "city_centre",
  "bus_stand",
  "railway",
  "highway",
  "hospital",
  "school",
  "college",
  "market",
  "temple",
  "industrial",
  "park",
  "airport",
  "other",
] as const;
export type LandmarkCategory = (typeof LANDMARK_CATEGORIES)[number];

export const LEAD_STATUSES = ["new", "contacted", "qualified", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_PURPOSES = ["self_use", "investment", "other"] as const;
export type LeadPurpose = (typeof LEAD_PURPOSES)[number];

/** Bilingual free-text item used in JSON columns (amenities, features). */
export type BilingualItem = { en: string; kn: string };
export type Approval = { en: string; kn: string; number: string };

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  societyNameEn: text("society_name_en")
    .notNull()
    .default("Mathrushree Housing Co-operative Society Limited"),
  societyNameKn: text("society_name_kn")
    .notNull()
    .default("ಮಾತೃಶ್ರೀ ಹೌಸಿಂಗ್ ಕೋ-ಆಪರೇಟಿವ್ ಸೊಸೈಟಿ ಲಿಮಿಟೆಡ್"),
  taglineEn: text("tagline_en").notNull().default(""),
  taglineKn: text("tagline_kn").notNull().default(""),
  phonePrimary: text("phone_primary").notNull().default(""),
  phoneSecondary: text("phone_secondary").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  addressEn: text("address_en").notNull().default(""),
  addressKn: text("address_kn").notNull().default(""),
  regNumber: text("reg_number").notNull().default(""),
  establishedYear: integer("established_year"),
  aboutEn: text("about_en").notNull().default(""),
  aboutKn: text("about_kn").notNull().default(""),
  heroImage: text("hero_image").notNull().default(""),
  heroTitleEn: text("hero_title_en").notNull().default(""),
  heroTitleKn: text("hero_title_kn").notNull().default(""),
  heroSubtitleEn: text("hero_subtitle_en").notNull().default(""),
  heroSubtitleKn: text("hero_subtitle_kn").notNull().default(""),
  officeLat: real("office_lat"),
  officeLng: real("office_lng"),
  workingHoursEn: text("working_hours_en").notNull().default(""),
  workingHoursKn: text("working_hours_kn").notNull().default(""),
  statMembers: integer("stat_members").notNull().default(0),
  statSitesAllotted: integer("stat_sites_allotted").notNull().default(0),
  statProjectsCompleted: integer("stat_projects_completed").notNull().default(0),
  facebookUrl: text("facebook_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameKn: text("name_kn").notNull().default(""),
  taglineEn: text("tagline_en").notNull().default(""),
  taglineKn: text("tagline_kn").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKn: text("description_kn").notNull().default(""),
  locationEn: text("location_en").notNull().default(""),
  locationKn: text("location_kn").notNull().default(""),
  lat: real("lat"),
  lng: real("lng"),
  totalAreaAcres: real("total_area_acres"),
  totalSites: integer("total_sites"),
  status: text("status", { enum: PROJECT_STATUSES }).notNull().default("ongoing"),
  approvals: text("approvals", { mode: "json" })
    .$type<Approval[]>()
    .notNull()
    .default(sql`'[]'`),
  amenities: text("amenities", { mode: "json" })
    .$type<BilingualItem[]>()
    .notNull()
    .default(sql`'[]'`),
  coverImage: text("cover_image").notNull().default(""),
  gallery: text("gallery", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  layoutPlanImage: text("layout_plan_image").notNull().default(""),
  brochureUrl: text("brochure_url").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  priceFrom: integer("price_from"),
  pricePerSqft: integer("price_per_sqft"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const landmarks = sqliteTable("landmarks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  nameEn: text("name_en").notNull(),
  nameKn: text("name_kn").notNull().default(""),
  category: text("category", { enum: LANDMARK_CATEGORIES }).notNull().default("other"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  driveMinutes: integer("drive_minutes"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sites = sqliteTable("sites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  siteNumber: text("site_number").notNull(),
  dimension: text("dimension").notNull().default(""),
  widthFt: real("width_ft"),
  depthFt: real("depth_ft"),
  areaSqft: real("area_sqft"),
  facing: text("facing", { enum: FACINGS }),
  roadWidthFt: real("road_width_ft"),
  corner: integer("corner", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: SITE_STATUSES }).notNull().default("available"),
  price: integer("price"),
  pricePerSqft: integer("price_per_sqft"),
  lat: real("lat"),
  lng: real("lng"),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKn: text("description_kn").notNull().default(""),
  images: text("images", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  features: text("features", { mode: "json" })
    .$type<BilingualItem[]>()
    .notNull()
    .default(sql`'[]'`),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const committeeMembers = sqliteTable("committee_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameEn: text("name_en").notNull(),
  nameKn: text("name_kn").notNull().default(""),
  roleEn: text("role_en").notNull().default(""),
  roleKn: text("role_kn").notNull().default(""),
  photo: text("photo").notNull().default(""),
  phone: text("phone").notNull().default(""),
  bioEn: text("bio_en").notNull().default(""),
  bioKn: text("bio_kn").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameEn: text("name_en").notNull(),
  nameKn: text("name_kn").notNull().default(""),
  locationEn: text("location_en").notNull().default(""),
  locationKn: text("location_kn").notNull().default(""),
  quoteEn: text("quote_en").notNull().default(""),
  quoteKn: text("quote_kn").notNull().default(""),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  photo: text("photo").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  siteId: integer("site_id").references(() => sites.id, { onDelete: "set null" }),
  purpose: text("purpose", { enum: LEAD_PURPOSES }).notNull().default("self_use"),
  budget: text("budget").notNull().default(""),
  timeline: text("timeline").notNull().default(""),
  message: text("message").notNull().default(""),
  locale: text("locale").notNull().default("en"),
  source: text("source").notNull().default(""),
  status: text("status", { enum: LEAD_STATUSES }).notNull().default("new"),
  notes: text("notes").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Settings = typeof settings.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Landmark = typeof landmarks.$inferSelect;
export type NewLandmark = typeof landmarks.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type CommitteeMember = typeof committeeMembers.$inferSelect;
export type NewCommitteeMember = typeof committeeMembers.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
