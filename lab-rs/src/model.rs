//! Data shapes shared by the Axum server, server functions and WASM islands.
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum Locale {
    #[default]
    Vi,
    En,
}

impl Locale {
    pub fn code(self) -> &'static str {
        match self {
            Locale::Vi => "vi",
            Locale::En => "en",
        }
    }
    pub fn from_code(code: &str) -> Self {
        if code.eq_ignore_ascii_case("en") { Locale::En } else { Locale::Vi }
    }
    /// Pick the Vietnamese or English variant of a UI string.
    pub fn t(self, vi: &'static str, en: &'static str) -> &'static str {
        match self {
            Locale::Vi => vi,
            Locale::En => en,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct SiteSettings {
    pub portfolio_name: String,
    pub tagline: String,
    pub hero_headline: String,
    pub hero_description: String,
    pub hero_primary_label: String,
    pub hero_secondary_label: String,
    pub meta_title: String,
    pub meta_description: String,
    pub github_url: Option<String>,
    pub email: Option<String>,
    pub analytics_id: Option<String>,
    pub hero_primary_url: String,
    pub og_title: Option<String>,
    pub og_image: Option<String>,
    pub featured_enabled: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Responsibility {
    pub title: String,
    pub subtitle: String,
    pub icon: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct ResultItem {
    pub number: String,
    pub label: String,
}

/// Compact project shape for cards, filters and search.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct ProjectCard {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub category: String,
    pub domains: Vec<String>,
    pub status: String,
    pub year: String,
    pub image: String,
    pub tech: Vec<String>,
    pub repo: Option<String>,
    pub featured: bool,
    pub search: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct ProjectDetail {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub overview_quote: String,
    pub year: String,
    pub role: String,
    pub highlight: String,
    pub project_type: String,
    pub category: String,
    pub domains: Vec<String>,
    pub status: String,
    /// Sanitized HTML, split into titled sections when the CMS content uses headings.
    pub intro_html: String,
    pub sections: Vec<ContentSection>,
    pub features: Vec<String>,
    pub tech: Vec<String>,
    pub image: String,
    pub images: Vec<String>,
    pub visuals_title: String,
    pub video_title: String,
    pub youtube_id: Option<String>,
    pub link: Option<String>,
    pub repo: Option<String>,
    pub responsibilities: Vec<Responsibility>,
    pub results: Vec<ResultItem>,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct ContentSection {
    pub id: String,
    pub title: String,
    pub html: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct PostCard {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub category: String,
    pub cover_image: Option<String>,
    pub created_at: String,
    pub views: i32,
    pub likes: i32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct PostDetail {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub category: String,
    pub cover_image: Option<String>,
    pub pdf_url: Option<String>,
    pub content_html: String,
    pub headings: Vec<Heading>,
    pub reading_minutes: u32,
    pub created_at: String,
    pub updated_at: String,
    pub views: i32,
    pub likes: i32,
    pub bookmarks: i32,
    pub seo_title: Option<String>,
    pub seo_description: Option<String>,
    pub seo_keywords: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Heading {
    pub id: String,
    pub text: String,
    pub level: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct HomeData {
    pub settings: SiteSettings,
    pub projects: Vec<ProjectCard>,
    pub posts: Vec<PostCard>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct GithubRepo {
    pub name: String,
    pub description: String,
    pub url: String,
    pub homepage: Option<String>,
    pub language: Option<String>,
    pub stars: i64,
    pub forks: i64,
    #[serde(rename = "pushedAt")]
    pub pushed_at: String,
    pub topics: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct CommentView {
    pub id: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    pub author: String,
    #[serde(rename = "isAnonymous")]
    pub is_anonymous: bool,
    #[serde(rename = "isAuthor")]
    pub is_author: bool,
    #[serde(rename = "avatarColor")]
    pub avatar_color: String,
    pub content: String,
    pub likes: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

// ---------- Admin ----------

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct MediaItem {
    pub public_id: String,
    pub url: String,
    pub bytes: i64,
    pub width: i64,
    pub height: i64,
    pub format: String,
    pub created_at: String,
    /// Titles of projects/posts that reference this image.
    pub used_by: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct AdminProject {
    pub id: String,
    pub locale: String,
    pub title: String,
    pub subtitle: String,
    pub overview_quote: String,
    pub year: String,
    pub role: String,
    pub highlight: String,
    pub project_type: String,
    pub category: String,
    pub description: String,
    pub visuals_title: String,
    pub video_title: String,
    pub features: Vec<String>,
    pub tech: Vec<String>,
    pub image: String,
    pub images: Vec<String>,
    pub show_video_demo: bool,
    pub published: bool,
    pub featured: bool,
    pub status: String,
    pub youtube_url: String,
    pub link: String,
    pub repo: String,
    pub order: i32,
    pub responsibilities: Vec<Responsibility>,
    pub results: Vec<ResultItem>,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct AdminPost {
    pub id: String,
    pub locale: String,
    pub title: String,
    pub slug: String,
    pub excerpt: String,
    pub content: String,
    pub published: bool,
    pub category: String,
    pub layout: String,
    pub cover_image: String,
    pub pdf_url: String,
    pub seo_title: String,
    pub seo_description: String,
    pub seo_keywords: String,
    pub views: i32,
    pub likes: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct AdminComment {
    pub comment: CommentView,
    pub post_slug: String,
    pub post_title: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct AdminMessage {
    pub id: String,
    pub name: String,
    pub email: String,
    pub topic: String,
    pub message: String,
    pub ticket: String,
    pub read: bool,
    pub starred: bool,
    pub archived: bool,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Activity {
    pub id: String,
    pub category: String,
    pub action: String,
    pub title: String,
    pub detail: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct DashboardStats {
    pub projects_published: i64,
    pub projects_draft: i64,
    pub posts_published: i64,
    pub posts_draft: i64,
    pub views: i64,
    pub likes: i64,
    pub bookmarks: i64,
    pub comments: i64,
    pub messages_unread: i64,
    pub messages_total: i64,
    pub top_posts: Vec<(String, String, i32, i32)>,
    pub recent: Vec<Activity>,
    pub status_counts: Vec<(String, i64)>,
}

/// Editable public settings; stored inside `Profile.settings` JSON without touching other keys.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct ContentSettings {
    pub portfolio_name: String,
    pub portfolio_tagline: String,
    pub hero_headline_vi: String,
    pub hero_headline_en: String,
    pub hero_description_vi: String,
    pub hero_description_en: String,
    pub hero_primary_label_vi: String,
    pub hero_primary_label_en: String,
    pub hero_secondary_label_vi: String,
    pub hero_secondary_label_en: String,
    pub hero_secondary_url: String,
    pub meta_title: String,
    pub meta_description: String,
    pub analytics_enabled: bool,
    pub analytics_id: String,
    pub email: String,
    pub github: String,
    pub hero_primary_url: String,
    pub og_title: String,
    pub og_image_url: String,
    pub section_featured_enabled: bool,
}

/// Text stored in both languages, as the CMS keeps it (`{ "vi": "…", "en": "…" }`).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct LocaleText {
    pub vi: String,
    pub en: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct SocialLink {
    pub platform: String,
    pub url: String,
    pub enabled: bool,
}

/// Identity fields of one `Profile` row (`profile-vi` or `profile-en`).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct ProfileForm {
    pub locale: String,
    pub name: String,
    pub role: String,
    pub tagline: String,
    pub location: String,
    pub phone: String,
    pub website: String,
    pub linkedin: String,
    pub avatar: String,
    pub socials: Vec<SocialLink>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct EducationItem {
    pub degree: LocaleText,
    pub school: LocaleText,
    pub period: String,
    pub detail: LocaleText,
    pub logo: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct CertificationItem {
    pub name: String,
    pub issuer: String,
    pub year: String,
    pub enabled: bool,
}

impl Default for CertificationItem {
    fn default() -> Self { Self { name: String::new(), issuer: String::new(), year: String::new(), enabled: true } }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct LanguageItem {
    pub name: LocaleText,
    pub level: LocaleText,
    pub enabled: bool,
}

impl Default for LanguageItem {
    fn default() -> Self { Self { name: LocaleText::default(), level: LocaleText::default(), enabled: true } }
}

/// Education, certifications and languages; shared by every profile row.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Credentials {
    pub educations: Vec<EducationItem>,
    pub certifications: Vec<CertificationItem>,
    pub languages: Vec<LanguageItem>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct AdminExperience {
    pub id: String,
    pub locale: String,
    pub role: String,
    pub company: String,
    pub company_url: String,
    pub period: String,
    pub location: String,
    pub description: String,
    pub highlights: Vec<String>,
    pub stack: Vec<String>,
    pub images: Vec<String>,
    pub order: i32,
}
