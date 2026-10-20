// Only presentation settings belong in the unauthenticated portfolio response.
// Admin preferences, account information and integration endpoints stay server-side.
export const publicSettingsDefaults = {
  analyticsEnabled: false,
  analyticsId: "",
  darkMode: true,
  compactMode: true,
  accentColor: "Slate",
  fontSize: "Compact",
  portfolioName: "Engineering Lab",
  portfolioDomain: "phanhuynh.id.vn",
  portfolioTagline: "Embedded systems, edge AI, and robotics projects.",
  heroHeadlineVi: "Dự án và bài viết kỹ thuật",
  heroHeadlineEn: "Engineering projects and notes",
  heroDescriptionVi: "Các dự án phần cứng, hệ thống nhúng, AI, IoT và ghi chép trong quá trình phát triển.",
  heroDescriptionEn: "Hardware, embedded systems, AI, and IoT projects, with technical notes from their development.",
  heroPrimaryLabelVi: "Khám phá dự án",
  heroPrimaryLabelEn: "Explore projects",
  heroSecondaryLabelVi: "Mã nguồn trên GitHub",
  heroSecondaryLabelEn: "GitHub source code",
  heroPrimaryUrl: "#projects",
  heroSecondaryUrl: "",
  sectionFeaturedEnabled: true,
  sectionProjectsEnabled: true,
  sectionMediaEnabled: true,
  sectionNotesEnabled: true,
  availabilityText: "",
  showAiButton: false,
  showLocation: false,
  showDownloadCv: false,
  maintenanceBanner: false,
  navAboutEnabled: false,
  navSkillsEnabled: false,
  navProjectsEnabled: true,
  navExperienceEnabled: false,
  navBlogEnabled: true,
  navContactEnabled: false,
  metaTitle: "Engineering Lab | Embedded Systems, Edge AI & Robotics",
  metaDescription: "Technical projects across embedded systems, edge AI, robotics, IoT, hardware, and software.",
  canonicalUrl: "https://phanhuynh.id.vn/",
  robots: "index, follow",
  ogTitle: "Engineering Lab",
  ogImageUrl: "/images/og-cover.webp",
}

export type PublicSettings = typeof publicSettingsDefaults & {
  title?: string
  description?: string
  keywords?: string | string[]
}

export function getPublicSettings(value: unknown): PublicSettings {
  const result: PublicSettings = { ...publicSettingsDefaults }
  if (!value || typeof value !== "object" || Array.isArray(value)) return result

  const source = value as Record<string, unknown>
  for (const key of Object.keys(result) as (keyof PublicSettings)[]) {
    if (typeof source[key] === typeof result[key]) {
      // Keys and scalar types are both allowlisted; never spread arbitrary settings.
      Object.assign(result, { [key]: source[key] })
    }
  }

  // Older profile records used these public SEO keys. Retain them and bridge
  // title/description into the names used by the current admin editor.
  if (typeof source.title === "string") {
    result.title = source.title
    if (typeof source.metaTitle !== "string" || !source.metaTitle.trim()) result.metaTitle = source.title
  }
  if (typeof source.description === "string") {
    result.description = source.description
    if (typeof source.metaDescription !== "string" || !source.metaDescription.trim()) result.metaDescription = source.description
  }
  if (typeof source.keywords === "string") result.keywords = source.keywords
  else if (Array.isArray(source.keywords) && source.keywords.every((keyword) => typeof keyword === "string")) {
    result.keywords = source.keywords
  }

  // Analytics tag IDs are public, but must remain safe when embedded in gtag's script.
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(result.analyticsId)) result.analyticsId = ""
  return result
}
