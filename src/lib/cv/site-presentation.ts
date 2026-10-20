import type { SiteData } from "./site-data-server";

/** List pages and search need summaries; full articles stay on their reader routes. */
export function toPresentationData(data: SiteData): SiteData {
  const defaults = {
    portfolioName: "Engineering Lab",
    portfolioDomain: "phanhuynh.id.vn",
    portfolioTagline: "Embedded systems, edge AI, and robotics projects.",
    heroHeadlineVi: "Dự án kỹ thuật. Sản phẩm thực tế.",
    heroHeadlineEn: "Engineering projects. Built systems.",
    heroDescriptionVi: "Khám phá các hệ thống phần cứng, phần mềm, trí tuệ nhân tạo và công nghệ nhúng — từ thiết kế đến thử nghiệm.",
    heroDescriptionEn: "Explore hardware, software, artificial intelligence, and embedded systems through real project work.",
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
  };
  const identity = /phan\s+hu(?:ỳnh|ynh)\s+v(?:ăn|an)\s+đ(?:ô|o)/i;
  const safeSetting = (value: unknown, fallback: string) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text && !identity.test(text) ? text : fallback;
  };
  const safeTagline = (value: unknown) => {
    const text = safeSetting(value, defaults.portfolioTagline);
    // Older CV data stored a personal job headline in this product-level field.
    return /^(?:developer|software developer|software engineer|embedded engineer|programmer)\b/i.test(text)
      ? defaults.portfolioTagline
      : text;
  };
  const publicSettings = {
    ...defaults,
    portfolioName: safeSetting(data.settings?.portfolioName, defaults.portfolioName),
    portfolioTagline: safeTagline(data.settings?.portfolioTagline),
    heroHeadlineVi: safeSetting(data.settings?.heroHeadlineVi, defaults.heroHeadlineVi),
    heroHeadlineEn: safeSetting(data.settings?.heroHeadlineEn, defaults.heroHeadlineEn),
    heroDescriptionVi: safeSetting(data.settings?.heroDescriptionVi, defaults.heroDescriptionVi),
    heroDescriptionEn: safeSetting(data.settings?.heroDescriptionEn, defaults.heroDescriptionEn),
    heroPrimaryLabelVi: safeSetting(data.settings?.heroPrimaryLabelVi, defaults.heroPrimaryLabelVi),
    heroPrimaryLabelEn: safeSetting(data.settings?.heroPrimaryLabelEn, defaults.heroPrimaryLabelEn),
    heroSecondaryLabelVi: safeSetting(data.settings?.heroSecondaryLabelVi, defaults.heroSecondaryLabelVi),
    heroSecondaryLabelEn: safeSetting(data.settings?.heroSecondaryLabelEn, defaults.heroSecondaryLabelEn),
    heroPrimaryUrl: safeSetting(data.settings?.heroPrimaryUrl, defaults.heroPrimaryUrl),
    heroSecondaryUrl: safeSetting(data.settings?.heroSecondaryUrl, defaults.heroSecondaryUrl),
    navBlogEnabled: data.settings?.navBlogEnabled !== false,
    sectionFeaturedEnabled: data.settings?.sectionFeaturedEnabled !== false,
    sectionProjectsEnabled: data.settings?.sectionProjectsEnabled !== false,
    sectionMediaEnabled: data.settings?.sectionMediaEnabled !== false,
    sectionNotesEnabled: data.settings?.sectionNotesEnabled !== false,
    showAiButton: false,
  };
  return {
    ...data,
    profile: {
      ...data.profile,
      name: "",
      role: "",
      tagline: "",
      location: "",
      phone: "",
      website: "",
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
      available: false,
      settings: publicSettings,
    },
    experiences: [],
    settings: publicSettings,
    posts: data.posts
      .filter((post) => post.published)
      .map((post) => ({ ...post, content: "" })),
  };
}
