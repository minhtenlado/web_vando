import { db } from "@/lib/db";
import { type Project, type Experience } from "@/lib/cv/data";
import publicSnapshot from "./public-snapshot.json";
import { getPublicSettings, publicSettingsDefaults } from "./public-settings";

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
}

export async function getSiteData(locale: string = "vi"): Promise<SiteData> {
  const loc = locale === "en" ? "en" : "vi"
  // A public content snapshot makes the checkout usable without production credentials.
  // Once a database is configured, its content (including deliberately empty lists) wins.
  if (!isDatabaseConfigured()) return getSnapshot(loc)

  let profile: SiteProfile = {
    name: "",
    role: "",
    tagline: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    github: "",
    linkedin: "",
    summary: "",
    avatar: "",
    principles: [],
    stats: [],
    nowText: "",
    skillGroups: [],
    socials: [],
    aboutSubtitle: "",
    skillsSubtitle: "",
    experienceSubtitle: "",
    animatedRoles: [],
    techBadges: [],
    educations: [],
    certifications: [],
    languages: [],
    available: true,
    settings: {},
  }
  let projects: SiteProject[] = []
  let experiences: SiteExperience[] = []
  let posts: SitePost[] = []
  let settings = { ...publicSettingsDefaults }

  try {
    const [pRows, eRows] = await Promise.all([
      db.project.findMany({ where: { locale: loc }, orderBy: { order: "asc" } }),
      db.experience.findMany({ where: { locale: loc }, orderBy: { order: "asc" } }),
    ])

    const postRows = await db.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })
    const [pRowEn, pRowVi, pRowLegacy] = await Promise.all([
      db.profile.findUnique({ where: { id: "profile-en" } }),
      db.profile.findUnique({ where: { id: "profile-vi" } }),
      db.profile.findUnique({ where: { id: "profile" } }),
    ])

    const primary = (loc === "en" ? pRowEn : pRowVi) || pRowVi || pRowEn || pRowLegacy
    const secondary = (loc === "en" ? pRowVi : pRowEn) || pRowLegacy

    if (primary && (primary as any).settings) {
      try {
        const dbSettings = JSON.parse((primary as any).settings)
        settings = getPublicSettings(dbSettings)
      } catch (e) {}
    } else if (secondary && (secondary as any).settings) {
      try {
        const dbSettings = JSON.parse((secondary as any).settings)
        settings = getPublicSettings(dbSettings)
      } catch (e) {}
    }

    if (primary || secondary) {
      const getVal = (key: string): any => {
        const pVal = primary ? (primary as any)[key] : null
        if (pVal !== null && pVal !== undefined && pVal !== "") {
          if (typeof pVal === "string" && (pVal === "[]" || pVal === "{}")) {
            const sVal = secondary ? (secondary as any)[key] : null
            if (sVal && sVal !== "[]" && sVal !== "{}") return sVal
          }
          return pVal
        }
        return secondary ? (secondary as any)[key] : null
      }

      const strVal = (key: string, fallback: string): string => {
        const val = getVal(key)
        if (val && typeof val === "string" && val.trim() !== "") {
          return val.trim()
        }
        return fallback
      }

      const getArrayVal = (key: string): any[] => {
        const vArr = safeParseJsonObjArr(pRowVi ? (pRowVi as any)[key] : null)
        const eArr = safeParseJsonObjArr(pRowEn ? (pRowEn as any)[key] : null)
        const lArr = safeParseJsonObjArr(pRowLegacy ? (pRowLegacy as any)[key] : null)
        if (vArr.length >= eArr.length && vArr.length >= lArr.length && vArr.length > 0) return vArr
        if (eArr.length >= lArr.length && eArr.length > 0) return eArr
        if (lArr.length > 0) return lArr
        return vArr.length ? vArr : eArr
      }

      const statsArr = getArrayVal("stats")
      const skillGroupsArr = getArrayVal("skillGroups")
      const educationsArr = getArrayVal("educations")
      const certsArr = getArrayVal("certifications")

      profile = {
        name: strVal("name", ""),
        role: strVal("role", ""),
        tagline: strVal("tagline", ""),
        location: strVal("location", ""),
        email: strVal("email", ""),
        phone: strVal("phone", ""),
        website: strVal("website", ""),
        github: strVal("github", ""),
        linkedin: strVal("linkedin", ""),
        summary: strVal("summary", ""),
        avatar: strVal("avatar", ""),
        principles: getArrayVal("principles"),
        stats: statsArr,
        nowText: strVal("nowText", ""),
        skillGroups: skillGroupsArr,
        socials: safeParseJsonObjArr(getVal("socials")),
        aboutSubtitle: strVal("aboutSubtitle", ""),
        skillsSubtitle: strVal("skillsSubtitle", ""),
        experienceSubtitle: strVal("experienceSubtitle", ""),
        animatedRoles: getArrayVal("animatedRoles").map((i: any) => String(i)),
        techBadges: getArrayVal("techBadges").map((i: any) => ({
          icon: String(i?.icon ?? ""),
          text: String(i?.text ?? "")
        })),
        educations: educationsArr,
        certifications: certsArr,
        languages: getArrayVal("languages"),
        available: true,
        settings: getPublicSettings(safeParseJsonObj(getVal("settings"))),
      } as SiteProfile
    }

    let finalProjects = pRows
    if (finalProjects.length === 0) {
      finalProjects = await db.project.findMany({ orderBy: { order: "asc" } })
    }

    if (finalProjects.length) {
      projects = finalProjects.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: (p as any).subtitle ?? "",
        overviewQuote: (p as any).overviewQuote ?? "",
        year: (p as any).year ?? "",
        role: (p as any).role ?? "",
        highlight: (p as any).highlight ?? "",
        projectType: (p as any).projectType ?? "",
        responsibilities: safeParseResponsibilities((p as any).responsibilities),
        results: safeParseResults((p as any).results),
        category: p.category,
        image: p.image,
        description: p.description,
        visualsTitle: (p as any).visualsTitle ?? "",
        videoTitle: (p as any).videoTitle ?? "",
        showVideoDemo: typeof p.showVideoDemo === "boolean" ? p.showVideoDemo : true,
        features: safeParseArr(p.features),
        tech: safeParseArr(p.tech),
        link: p.link ?? undefined,
        repo: p.repo ?? undefined,
        youtubeUrl: p.youtubeUrl ?? undefined,
        images: safeParseArr(p.images),
      }))
    } else {
      projects = []
    }

    let finalExperiences = eRows
    if (finalExperiences.length === 0) {
      finalExperiences = await db.experience.findMany({ orderBy: { order: "asc" } })
    }

    if (finalExperiences.length) {
      experiences = finalExperiences.map((e) => ({
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

    if (postRows && postRows.length > 0) {
      posts = postRows.map((po) => ({
        id: po.id,
        title: po.title,
        slug: po.slug,
        excerpt: po.excerpt,
        content: po.content || "",
        published: po.published,
        category: po.category || undefined,
        views: po.views || 0,
        likes: po.likes || 0,
        bookmarks: po.bookmarks || 0,
        createdAt: po.createdAt instanceof Date ? po.createdAt.toISOString() : String(po.createdAt),
        updatedAt: po.updatedAt instanceof Date ? po.updatedAt.toISOString() : String(po.updatedAt),
        seoTitle: po.seoTitle,
        seoDescription: po.seoDescription,
        seoKeywords: po.seoKeywords,
        coverImage: (po.coverImage && po.coverImage.trim() !== "") ? po.coverImage : profile.avatar,
        pdfUrl: po.pdfUrl,
        layout: po.layout,
      }))
    }
  } catch (e) {
    console.error("[site-data] Database error:", e)
  }

  if (!profile.avatar || profile.avatar.trim() === "") {
    profile.avatar = "/uploads/avatar.jpg"
  }
  if (!profile.name || profile.name.trim() === "") {
    profile.name = "Phan Huỳnh Văn Đô"
  }

  return { profile, projects, experiences, posts, settings }
}

function safeParseJsonObj(s: string | undefined | null): any {
  if (!s) return {}
  try {
    const v = JSON.parse(s)
    return typeof v === 'object' && v !== null && !Array.isArray(v) ? v : {}
  } catch {
    return {}
  }
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

function safeParseResponsibilities(s: string | undefined | null): { title: string; subtitle: string; icon: string }[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    if (!Array.isArray(v)) return [];
    return v.map((item) => ({
      title: String(item?.title ?? ""),
      subtitle: String(item?.subtitle ?? ""),
      icon: String(item?.icon ?? ""),
    }));
  } catch {
    return [];
  }
}

function safeParseResults(s: string | undefined | null): { number: string; label: string }[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    if (!Array.isArray(v)) return [];
    return v.map((item) => ({
      number: String(item?.number ?? item?.value ?? ""),
      label: String(item?.label ?? ""),
    }));
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<SiteProject | null> {
  if (!isDatabaseConfigured()) {
    return getSnapshot("vi").projects.find((p) => p.id === id)
      ?? getSnapshot("en").projects.find((p) => p.id === id)
      ?? null
  }
  try {
    const p = await db.project.findUnique({ where: { id } })
    if (p) {
      return {
        id: p.id,
        title: p.title,
        subtitle: (p as any).subtitle ?? "",
        overviewQuote: (p as any).overviewQuote ?? "",
        year: (p as any).year ?? "",
        role: (p as any).role ?? "",
        highlight: (p as any).highlight ?? "",
        projectType: (p as any).projectType ?? "",
        responsibilities: safeParseResponsibilities((p as any).responsibilities),
        results: safeParseResults((p as any).results),
        category: p.category,
        image: p.image,
        description: p.description,
        visualsTitle: (p as any).visualsTitle ?? "",
        videoTitle: (p as any).videoTitle ?? "",
        showVideoDemo: typeof p.showVideoDemo === "boolean" ? p.showVideoDemo : true,
        features: safeParseArr(p.features),
        tech: safeParseArr(p.tech),
        link: p.link ?? undefined,
        repo: p.repo ?? undefined,
        youtubeUrl: p.youtubeUrl ?? undefined,
        images: safeParseArr(p.images),
      }
    }
  } catch (err) {
    console.error("[getProjectById] error:", err)
  }

  return null
}

export async function getPostBySlug(slug: string, locale: string = "vi"): Promise<SitePost | null> {
  const loc = locale === "en" ? "en" : "vi"
  if (!isDatabaseConfigured()) {
    return getSnapshot(loc).posts.find((post) => post.slug === slug && post.published) ?? null
  }

  try {
    // Prefer the selected locale, while retaining existing shared-slug links.
    const post = await db.post.findFirst({ where: { slug, locale: loc, published: true } })
      ?? await db.post.findFirst({ where: { slug, published: true } })
    if (!post) return null
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      published: true,
      category: post.category || undefined,
      views: post.views,
      likes: post.likes,
      bookmarks: post.bookmarks,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      coverImage: post.coverImage,
      pdfUrl: post.pdfUrl,
      layout: post.layout,
    }
  } catch (error) {
    console.error("[getPostBySlug] Database error:", error)
    return null
  }
}

function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function getSnapshot(locale: "vi" | "en"): SiteData {
  const data = structuredClone(publicSnapshot[locale]) as unknown as SiteData
  data.posts = data.posts.filter((post) => post.published)
  data.settings = getPublicSettings(data.settings)
  data.profile.settings = getPublicSettings(data.profile.settings)
  return data
}

