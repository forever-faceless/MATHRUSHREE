import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./client";
import {
  committeeMembers,
  landmarks,
  leads,
  projects,
  settings,
  sites,
  testimonials,
  type CommitteeMember,
  type Landmark,
  type Lead,
  type LeadStatus,
  type Project,
  type Settings,
  type Site,
  type Testimonial,
} from "./schema";

export type ProjectWithCounts = Project & { siteCount: number; availableCount: number };

// ---------------------------------------------------------------- settings

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const existing = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  if (existing) return existing;
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();
  return (await db.query.settings.findFirst({ where: eq(settings.id, 1) }))!;
}

// ---------------------------------------------------------------- projects

async function attachCounts(db: Awaited<ReturnType<typeof getDb>>, rows: Project[]): Promise<ProjectWithCounts[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);
  const counts = await db
    .select({
      projectId: sites.projectId,
      total: sql<number>`count(*)`,
      available: sql<number>`sum(case when ${sites.status} = 'available' then 1 else 0 end)`,
    })
    .from(sites)
    .where(inArray(sites.projectId, ids))
    .groupBy(sites.projectId);
  const byId = new Map(counts.map((c) => [c.projectId, c]));
  return rows.map((p) => ({
    ...p,
    siteCount: Number(byId.get(p.id)?.total ?? 0),
    availableCount: Number(byId.get(p.id)?.available ?? 0),
  }));
}

export async function listPublishedProjects(): Promise<ProjectWithCounts[]> {
  const db = await getDb();
  const rows = await db.query.projects.findMany({
    where: eq(projects.published, true),
    orderBy: [desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt)],
  });
  return attachCounts(db, rows);
}

export async function listFeaturedProjects(limit = 3): Promise<ProjectWithCounts[]> {
  const all = await listPublishedProjects();
  // Featured projects first, then fill the remaining slots with the rest in display order.
  const featured = all.filter((p) => p.featured);
  const others = all.filter((p) => !p.featured);
  return [...featured, ...others].slice(0, limit);
}

export async function listAllProjects(): Promise<ProjectWithCounts[]> {
  const db = await getDb();
  const rows = await db.query.projects.findMany({
    orderBy: [asc(projects.sortOrder), desc(projects.createdAt)],
  });
  return attachCounts(db, rows);
}

export async function getProjectBySlug(slug: string, includeUnpublished = false): Promise<Project | null> {
  const db = await getDb();
  const where = includeUnpublished
    ? eq(projects.slug, slug)
    : and(eq(projects.slug, slug), eq(projects.published, true));
  return (await db.query.projects.findFirst({ where })) ?? null;
}

export async function getProjectById(id: number): Promise<Project | null> {
  const db = await getDb();
  return (await db.query.projects.findFirst({ where: eq(projects.id, id) })) ?? null;
}

export async function slugExists(slug: string, exceptId?: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.query.projects.findFirst({ where: eq(projects.slug, slug), columns: { id: true } });
  return Boolean(row && row.id !== exceptId);
}

// ---------------------------------------------------------------- landmarks

export async function listLandmarks(projectId: number): Promise<Landmark[]> {
  const db = await getDb();
  return db.query.landmarks.findMany({
    where: eq(landmarks.projectId, projectId),
    orderBy: [asc(landmarks.sortOrder), asc(landmarks.id)],
  });
}

// ---------------------------------------------------------------- sites

function siteOrder() {
  // Natural ordering so "10" comes after "9" and "A-2" after "A-1".
  return [asc(sites.sortOrder), sql`cast(${sites.siteNumber} as integer)`, asc(sites.siteNumber)];
}

export async function listSites(projectId: number): Promise<Site[]> {
  const db = await getDb();
  return db.query.sites.findMany({ where: eq(sites.projectId, projectId), orderBy: siteOrder() });
}

export async function getSite(projectId: number, siteNumber: string): Promise<Site | null> {
  const db = await getDb();
  return (
    (await db.query.sites.findFirst({
      where: and(eq(sites.projectId, projectId), eq(sites.siteNumber, siteNumber)),
    })) ?? null
  );
}

export async function getSiteById(id: number): Promise<Site | null> {
  const db = await getDb();
  return (await db.query.sites.findFirst({ where: eq(sites.id, id) })) ?? null;
}

export async function siteNumberExists(projectId: number, siteNumber: string, exceptId?: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.query.sites.findFirst({
    where: and(eq(sites.projectId, projectId), eq(sites.siteNumber, siteNumber)),
    columns: { id: true },
  });
  return Boolean(row && row.id !== exceptId);
}

// ---------------------------------------------------------------- committee & testimonials

export async function listCommittee(publishedOnly = true): Promise<CommitteeMember[]> {
  const db = await getDb();
  return db.query.committeeMembers.findMany({
    where: publishedOnly ? eq(committeeMembers.published, true) : undefined,
    orderBy: [asc(committeeMembers.sortOrder), asc(committeeMembers.id)],
  });
}

export async function getCommitteeMember(id: number): Promise<CommitteeMember | null> {
  const db = await getDb();
  return (await db.query.committeeMembers.findFirst({ where: eq(committeeMembers.id, id) })) ?? null;
}

export async function listTestimonials(publishedOnly = true): Promise<Testimonial[]> {
  const db = await getDb();
  return db.query.testimonials.findMany({
    where: publishedOnly ? eq(testimonials.published, true) : undefined,
    orderBy: [asc(testimonials.sortOrder), asc(testimonials.id)],
  });
}

export async function getTestimonial(id: number): Promise<Testimonial | null> {
  const db = await getDb();
  return (await db.query.testimonials.findFirst({ where: eq(testimonials.id, id) })) ?? null;
}

// ---------------------------------------------------------------- leads

export type LeadWithRefs = Lead & { projectName: string | null; siteNumber: string | null };

export async function listLeads(status?: LeadStatus): Promise<LeadWithRefs[]> {
  const db = await getDb();
  const rows = await db
    .select({
      lead: leads,
      projectName: projects.nameEn,
      siteNumber: sites.siteNumber,
    })
    .from(leads)
    .leftJoin(projects, eq(leads.projectId, projects.id))
    .leftJoin(sites, eq(leads.siteId, sites.id))
    .where(status ? eq(leads.status, status) : undefined)
    .orderBy(desc(leads.createdAt));
  return rows.map((r) => ({ ...r.lead, projectName: r.projectName ?? null, siteNumber: r.siteNumber ?? null }));
}

export async function countLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const db = await getDb();
  const rows = await db
    .select({ status: leads.status, n: sql<number>`count(*)` })
    .from(leads)
    .groupBy(leads.status);
  const out: Record<LeadStatus, number> = { new: 0, contacted: 0, qualified: 0, closed: 0 };
  for (const r of rows) out[r.status] = Number(r.n);
  return out;
}

export async function getDashboardStats() {
  const db = await getDb();
  const [projectCount] = await db.select({ n: sql<number>`count(*)` }).from(projects);
  const [siteCount] = await db.select({ n: sql<number>`count(*)` }).from(sites);
  const [availableCount] = await db
    .select({ n: sql<number>`count(*)` })
    .from(sites)
    .where(eq(sites.status, "available"));
  const [memberCount] = await db.select({ n: sql<number>`count(*)` }).from(committeeMembers);
  const leadCounts = await countLeadsByStatus();
  const recentLeads = (await listLeads()).slice(0, 8);
  return {
    projects: Number(projectCount.n),
    sites: Number(siteCount.n),
    availableSites: Number(availableCount.n),
    committee: Number(memberCount.n),
    leads: leadCounts,
    recentLeads,
  };
}
