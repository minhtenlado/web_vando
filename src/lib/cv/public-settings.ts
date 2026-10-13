// Only presentation settings belong in the unauthenticated portfolio response.
// Admin preferences, account information and integration endpoints stay server-side.
export const publicSettingsDefaults = {
  analyticsEnabled: false,
  analyticsId: "",
  darkMode: true,
  compactMode: true,
  accentColor: "Emerald",
  fontSize: "Compact",
  portfolioName: "Phan Huỳnh Văn Đô",
  portfolioDomain: "phanhuynh.id.vn",
  portfolioTagline: "RTOS Developer • Embedded Linux • AIoT",
  availabilityText: "Sẵn sàng cho cơ hội mới",
  showAiButton: true,
  showLocation: true,
  showDownloadCv: true,
  maintenanceBanner: false,
  navAboutEnabled: true,
  navSkillsEnabled: true,
  navProjectsEnabled: true,
  navExperienceEnabled: true,
  navBlogEnabled: true,
  navContactEnabled: true,
  metaTitle: "Phan Huỳnh Văn Đô — RTOS Developer",
  metaDescription: "Portfolio của Phan Huỳnh Văn Đô — RTOS Developer, Embedded Linux, STM32, ESP32, IoT và Edge AI.",
  canonicalUrl: "https://phanhuynh.id.vn/",
  robots: "index, follow",
  ogTitle: "Phan Huỳnh Văn Đô",
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
