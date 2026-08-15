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
  createdAt: string;
  updatedAt: string
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  coverImage?: string | null
  pdfUrl?: string | null
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
    principles: [], stats: [], nowText: "", skillGroups: [], socials: [], 
    aboutSubtitle: "", skillsSubtitle: "", experienceSubtitle: "", animatedRoles: [], techBadges: [],
    educations: [], certifications: [], languages: [],
    available: true
  }
  let projects: SiteProject[] = []
  let experiences: SiteExperience[] = []
  let posts: SitePost[] = []

  try {
    const [pRowInitial, pRows, eRows, postRows] = await Promise.all([
      db.profile.findUnique({ where: { id: profileId } }),
      db.project.findMany({ where: { locale: loc }, orderBy: { order: "asc" } }),
      db.experience.findMany({ where: { locale: loc }, orderBy: { order: "asc" } }),
      db.post.findMany({ 
        where: { locale: loc, published: true }, 
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          coverImage: true,
          pdfUrl: true,
        }
      }),
    ])

    const [pRowEn, pRowVi, pRowLegacy] = await Promise.all([
      db.profile.findUnique({ where: { id: "profile-en" } }),
      db.profile.findUnique({ where: { id: "profile-vi" } }),
      db.profile.findUnique({ where: { id: "profile" } }),
    ]);

    const primary = (loc === "en" ? pRowEn : pRowVi) || pRowVi || pRowEn || pRowLegacy;
    const secondary = (loc === "en" ? pRowVi : pRowEn) || pRowLegacy;

    if (primary || secondary) {
      const getVal = (key: string): any => {
        const pVal = primary ? (primary as any)[key] : null;
        if (pVal !== null && pVal !== undefined && pVal !== "") {
          if (typeof pVal === "string" && (pVal === "[]" || pVal === "{}")) {
            const sVal = secondary ? (secondary as any)[key] : null;
            if (sVal && sVal !== "[]" && sVal !== "{}") return sVal;
          }
          return pVal;
        }
        return secondary ? (secondary as any)[key] : null;
      };

      const getArrayVal = (key: string): any[] => {
        const vArr = safeParseJsonObjArr(pRowVi ? (pRowVi as any)[key] : null);
        const eArr = safeParseJsonObjArr(pRowEn ? (pRowEn as any)[key] : null);
        const lArr = safeParseJsonObjArr(pRowLegacy ? (pRowLegacy as any)[key] : null);
        if (vArr.length >= eArr.length && vArr.length >= lArr.length && vArr.length > 0) return vArr;
        if (eArr.length >= lArr.length && eArr.length > 0) return eArr;
        if (lArr.length > 0) return lArr;
        return vArr.length ? vArr : eArr;
      };

      profile = {
        name: getVal("name") || "",
        role: getVal("role") || "",
        tagline: getVal("tagline") || "",
        location: getVal("location") || "",
        email: getVal("email") || "",
        phone: getVal("phone") || "",
        website: getVal("website") || "",
        github: getVal("github") || "",
        linkedin: getVal("linkedin") || "",
        summary: getVal("summary") || "",
        avatar: getVal("avatar") || "",
        principles: getArrayVal("principles"),
        stats: getArrayVal("stats"),
        nowText: getVal("nowText") || "",
        skillGroups: getArrayVal("skillGroups"),
        socials: safeParseJsonObjArr(getVal("socials")),
        aboutSubtitle: getVal("aboutSubtitle") || "",
        skillsSubtitle: getVal("skillsSubtitle") || "",
        experienceSubtitle: getVal("experienceSubtitle") || "",
        animatedRoles: getArrayVal("animatedRoles").map((i: any) => String(i)),
        techBadges: getArrayVal("techBadges").map((i: any) => ({
          icon: String(i?.icon ?? ""),
          text: String(i?.text ?? "")
        })),
        educations: getArrayVal("educations"),
        certifications: getArrayVal("certifications"),
        languages: getArrayVal("languages"),
        available: true,
      } as SiteProfile
    }

    let finalProjects = pRows;
    if (loc !== "vi" && finalProjects.length === 0) {
      finalProjects = await db.project.findMany({ where: { locale: "vi" }, orderBy: { order: "asc" } });
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
        features: safeParseArr(p.features),
        tech: safeParseArr(p.tech),
        link: p.link ?? undefined,
        repo: p.repo ?? undefined,
        youtubeUrl: p.youtubeUrl ?? undefined,
        images: safeParseArr(p.images),
      }))
    }

    let finalExperiences = eRows;
    if (loc !== "vi" && finalExperiences.length === 0) {
      finalExperiences = await db.experience.findMany({ where: { locale: "vi" }, orderBy: { order: "asc" } });
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

    posts = postRows.map((po) => ({
      id: po.id,
      title: po.title,
      slug: po.slug,
      excerpt: po.excerpt,
      content: "",
      published: po.published,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
      seoTitle: po.seoTitle,
      seoDescription: po.seoDescription,
      seoKeywords: po.seoKeywords,
      coverImage: po.coverImage,
      pdfUrl: po.pdfUrl,
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
