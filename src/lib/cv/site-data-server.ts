import { type Experience,type Project } from "@/lib/cv/data";
import { db } from "@/lib/db";
import type { Post as PostRow,Project as ProjectRow } from "@prisma/client";
import { cache } from "react";
import { readProjects } from "./project-store";
import { getPublicSettings,publicSettingsDefaults } from "./public-settings";
import publicSnapshot from "./public-snapshot.json";

export type SiteProfile = {
  name: string
  role: string
  tagline: string
  location: string
  email: string
  phone: string
  website: string
  github: string
  linkedin: string
  summary: string
  avatar: string
  principles: any[]
  stats: any[]
  nowText: string
  skillGroups: any[]
  socials: any[]
  aboutSubtitle: string
  skillsSubtitle: string
  experienceSubtitle: string
  animatedRoles: string[]
  techBadges: { icon: string; text: string }[]
  educations: any[]
  certifications: any[]
  languages: any[]
  available: boolean
  settings?: any
}

export type SiteProject = Project & {
  id: string
  order?: number
  updatedAt?: string
  published?: boolean
  featured?: boolean
  status?: string
  subtitle?: string
  overviewQuote?: string
  year?: string
  role?: string
  highlight?: string
  projectType?: string
  responsibilities?: { title: string; subtitle: string; icon: string }[]
  results?: { number: string; label: string }[]
  youtubeUrl?: string
  images?: string[]
  visualsTitle?: string
  videoTitle?: string
  showVideoDemo?: boolean
}

export type SiteExperience = Experience & {
  id: string
  companyUrl?: string
  images?: string[]
}

export type SitePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  category?: string;
  views: number;
  likes: number;
  bookmarks: number;
  createdAt: string;
  updatedAt: string
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  coverImage?: string | null
  pdfUrl?: string | null
  layout?: string
}

export type SiteData = {
  profile: SiteProfile
  projects: SiteProject[]
  experiences: SiteExperience[]
  posts: SitePost[]
  settings: any
  errors?: Partial<Record<"projects" | "posts" | "settings", "unavailable">>
  source?: "database" | "snapshot"
}

function emptyProfile(): SiteProfile {
  return {
    name: "", role: "", tagline: "", location: "", email: "", phone: "", website: "", github: "", linkedin: "",
    summary: "", avatar: "", principles: [], stats: [], nowText: "", skillGroups: [], socials: [],
    aboutSubtitle: "", skillsSubtitle: "", experienceSubtitle: "", animatedRoles: [], techBadges: [],
    educations: [], certifications: [], languages: [], available: false, settings: { ...publicSettingsDefaults },
  };
}

function snapshotEnabled() {
  return process.env.CONTENT_PREVIEW_SNAPSHOT === "1" && !process.env.VERCEL;
}

const readProfiles = cache(() => db.profile.findMany({
  where: { id: { in: ["profile-vi", "profile-en", "profile"] } },
  select: { id: true, email: true, github: true, settings: true },
}));

export const getSiteSettings = cache(async () => {
  if (!isDatabaseConfigured()) return snapshotEnabled() ? getSnapshot("vi").settings : { ...publicSettingsDefaults };
  try {
    const rows = await readProfiles();
    const source = rows.find((row) => row.id === "profile-vi") || rows[0];
    return getPublicSettings(JSON.parse(source?.settings || "{}"));
  } catch {
    return { ...publicSettingsDefaults };
  }
});

function reportReadError(resource: string, error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
  console.error("[content] " + resource + " unavailable (" + code + ")");
}

export class ContentUnavailableError extends Error {
  constructor() {
    super("Content is temporarily unavailable. Please try again.");
    this.name = "ContentUnavailableError";
  }
}

export const getSiteData = cache(async (locale: string = "vi"): Promise<SiteData> => {
  const loc = locale === "en" ? "en" : "vi";
  if (!isDatabaseConfigured() && snapshotEnabled()) return getSnapshot(loc);
  const data: SiteData = {
    profile: emptyProfile(), projects: [], experiences: [], posts: [],
    settings: { ...publicSettingsDefaults }, errors: {}, source: "database",
  };
  if (!isDatabaseConfigured()) {
    data.errors = { projects: "unavailable", posts: "unavailable", settings: "unavailable" };
    return data;
  }

  const [projects, posts, profiles] = await Promise.allSettled([
    readProjects(db, { locale: loc }),
    db.post.findMany({
      where: { published: true }, orderBy: { createdAt: "desc" },
      select: {
        id: true, locale: true, slug: true, title: true, excerpt: true, published: true, category: true,
        views: true, likes: true, bookmarks: true, createdAt: true, updatedAt: true,
        coverImage: true, pdfUrl: true, layout: true, seoTitle: true, seoDescription: true, seoKeywords: true,
      },
    }),
    readProfiles(),
  ]);

  if (projects.status === "fulfilled") data.projects = projects.value.rows.map(mapProject);
  else { data.errors!.projects = "unavailable"; reportReadError("projects", projects.reason); }

  if (posts.status === "fulfilled") {
    const bySlug = new Map<string, (typeof posts.value)[number]>();
    for (const post of posts.value) {
      if (!bySlug.has(post.slug) || post.locale === loc) bySlug.set(post.slug, post);
    }
    data.posts = Array.from(bySlug.values()).map((post) => mapPost({ ...post, content: "" }))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } else { data.errors!.posts = "unavailable"; reportReadError("articles", posts.reason); }

  if (profiles.status === "fulfilled") {
    const rows = profiles.value;
    const primary = rows.find((p) => p.id === "profile-" + loc) || rows.find((p) => p.id === "profile-vi") || rows[0];
    const settingsSource = rows.find((p) => p.id === "profile-vi") || primary;
    let settings: unknown = {};
    try { settings = JSON.parse(settingsSource?.settings || "{}"); } catch { /* Keep safe defaults for malformed settings. */ }
    data.settings = getPublicSettings(settings);
    data.profile = { ...data.profile, email: primary?.email || "", github: primary?.github || "", settings: data.settings };
  } else { data.errors!.settings = "unavailable"; reportReadError("settings", profiles.reason); }
  return data;
});

function parseArray(value: string | null | undefined): unknown[] {
  try { const parsed: unknown = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

function stringArray(value: string | null | undefined): string[] {
  return parseArray(value).filter((item): item is string => typeof item === "string");
}

function mapProject(p: ProjectRow): SiteProject {
  return {
    id: p.id, order: p.order, updatedAt: p.updatedAt.toISOString(),
    published: p.published, featured: p.featured, status: p.status,
    title: p.title, subtitle: p.subtitle, overviewQuote: p.overviewQuote, year: p.year,
    role: p.role, highlight: p.highlight, projectType: p.projectType,
    responsibilities: parseArray(p.responsibilities).filter(isRecord).map((item) => ({
      title: String(item.title ?? ""), subtitle: String(item.subtitle ?? ""), icon: String(item.icon ?? ""),
    })),
    results: parseArray(p.results).filter(isRecord).map((item) => ({ number: String(item.number ?? item.value ?? ""), label: String(item.label ?? "") })),
    category: p.category, description: p.description, image: p.image, images: stringArray(p.images),
    visualsTitle: p.visualsTitle, videoTitle: p.videoTitle, showVideoDemo: p.showVideoDemo,
    features: stringArray(p.features), tech: stringArray(p.tech),
    link: p.link || undefined, repo: p.repo || undefined, youtubeUrl: p.youtubeUrl || undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapPost(post: PostRow): SitePost {
  return {
    ...post, category: post.category || undefined,
    createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString(),
  };
}

export const getProjectById = cache(async (id: string, options: { includeUnpublished?: boolean } = {}): Promise<SiteProject | null> => {
  if (!isDatabaseConfigured()) {
    if (!snapshotEnabled()) throw new ContentUnavailableError();
    return getSnapshot("vi").projects.find((p) => p.id === id && p.published !== false)
      ?? getSnapshot("en").projects.find((p) => p.id === id && p.published !== false) ?? null;
  }
  try {
    const result = await readProjects(db, { id, includeUnpublished: options.includeUnpublished });
    return result.rows[0] ? mapProject(result.rows[0]) : null;
  } catch (error) { reportReadError("project detail", error); throw new ContentUnavailableError(); }
});

export const getPostBySlug = cache(async (slug: string, locale: string = "vi"): Promise<SitePost | null> => {
  const loc = locale === "en" ? "en" : "vi";
  if (!isDatabaseConfigured()) {
    if (!snapshotEnabled()) throw new ContentUnavailableError();
    return getSnapshot(loc).posts.find((post) => post.slug === slug && post.published) ?? null;
  }
  try {
    const post = await db.post.findFirst({ where: { slug, locale: loc, published: true } })
      ?? await db.post.findFirst({ where: { slug, published: true } });
    return post ? mapPost(post) : null;
  } catch (error) { reportReadError("article detail", error); throw new ContentUnavailableError(); }
});

function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function getSnapshot(locale: "vi" | "en"): SiteData {
  const data = structuredClone(publicSnapshot[locale]) as unknown as SiteData;
  data.projects = data.projects.map((project) => ({ ...project, published: true, featured: false, status: "" }));
  data.posts = data.posts.filter((post) => post.published);
  data.settings = getPublicSettings(data.settings);
  data.profile.settings = data.settings;
  data.source = "snapshot";
  data.errors = {};
  return data;
}
