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
