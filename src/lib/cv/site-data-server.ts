import { db } from "@/lib/db";
import {
  profile as defaultProfile,
  projects as defaultProjects,
  experiences as defaultExperiences,
  type Project,
  type Experience,
} from "@/lib/cv/data";

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
}

export type SiteProject = Project & {
  id: string
  youtubeUrl?: string
}

export type SiteExperience = Experience & {
  id: string
  companyUrl?: string
}

export type SitePost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export type SiteData = {
  profile: SiteProfile
  projects: SiteProject[]
  experiences: SiteExperience[]
  posts: SitePost[]
}

export async function getSiteData(): Promise<SiteData> {
  let profile: SiteProfile = { ...defaultProfile }
  let projects: SiteProject[] = defaultProjects.map((p, i) => ({
    ...p,
    id: `default-${i}`,
    youtubeUrl: "",
  }))
  let experiences: SiteExperience[] = defaultExperiences.map((e, i) => ({
    ...e,
    id: `default-${i}`,
    companyUrl: "",
  }))
  let posts: SitePost[] = []

  try {
    const [pRow, pRows, eRows, postRows] = await Promise.all([
      db.profile.findUnique({ where: { id: "profile" } }),
      db.project.findMany({ orderBy: { order: "asc" } }),
      db.experience.findMany({ orderBy: { order: "asc" } }),
      db.post.findMany({ orderBy: { createdAt: "desc" } }),
    ])

    if (pRow) {
      profile = {
        name: pRow.name,
        role: pRow.role,
        tagline: pRow.tagline,
        location: pRow.location,
        email: pRow.email,
        phone: pRow.phone,
        website: pRow.website,
        github: pRow.github,
        linkedin: pRow.linkedin,
        summary: pRow.summary,
        avatar: pRow.avatar,
      }
    }

    if (pRows.length) {
      projects = pRows.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        image: p.image,
        description: p.description,
        features: safeParseArr(p.features),
        tech: safeParseArr(p.tech),
        link: p.link ?? undefined,
        repo: p.repo ?? undefined,
        youtubeUrl: p.youtubeUrl ?? undefined,
      }))
    }

    if (eRows.length) {
      experiences = eRows.map((e) => ({
        id: e.id,
        role: e.role,
        company: e.company,
        companyUrl: e.companyUrl ?? undefined,
        period: e.period,
        location: e.location,
        description: e.description,
        highlights: safeParseArr(e.highlights),
        stack: safeParseArr(e.stack),
      }))
    }

    posts = postRows.map((po) => ({
      id: po.id,
      title: po.title,
      slug: po.slug,
      excerpt: po.excerpt,
      content: po.content,
      published: po.published,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
    }))
  } catch (e) {
    // DB not available — fall back to static defaults.
    console.error("[site-data] falling back to static defaults:", e)
  }

  return { profile, projects, experiences, posts }
}

function safeParseArr(s: string): string[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v.map((x) => String(x)) : []
  } catch {
    return []
  }
}
