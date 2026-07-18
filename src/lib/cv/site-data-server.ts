import { db } from "@/lib/db";
import { type Project, type Experience } from "@/lib/cv/data";

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
}

export type SiteProject = Project & {
  id: string
  youtubeUrl?: string
  images?: string[]
}

export type SiteExperience = Experience & {
  id: string
  companyUrl?: string
  images?: string[]
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

export async function getSiteData(locale: string = "vi"): Promise<SiteData> {
  const loc = locale === "en" ? "en" : "vi"
  const profileId = `profile-${loc}`

  let profile: SiteProfile = {
    name: "", role: "", tagline: "", location: "", email: "",
    phone: "", website: "", github: "", linkedin: "", summary: "", avatar: "",
    principles: [], stats: [], nowText: ""
  }
  let projects: SiteProject[] = []
  let experiences: SiteExperience[] = []
  let posts: SitePost[] = []

  try {
    const [pRowInitial, pRows, eRows, postRows] = await Promise.all([
      db.profile.findUnique({ where: { id: profileId } }),
      db.project.findMany({ where: { locale: loc }, orderBy: { order: "asc" } }),
      db.experience.findMany({ where: { locale: loc }, orderBy: { order: "asc" } }),
      db.post.findMany({ where: { locale: loc }, orderBy: { createdAt: "desc" } }),
    ])

    let pRow = pRowInitial;
    if (!pRow) {
      pRow = await db.profile.findUnique({ where: { id: "profile" } });
    }

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
        principles: safeParseJsonObjArr(pRow.principles),
        stats: safeParseJsonObjArr(pRow.stats),
        nowText: pRow.nowText,
        available: true,
      } as SiteProfile
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
        images: safeParseArr(p.images),
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
        images: safeParseArr(e.images),
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
    console.error("[site-data] Database error:", e)
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

function safeParseJsonObjArr(s: string): any[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
