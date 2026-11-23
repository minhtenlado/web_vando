//! Read access to the existing Prisma-managed PostgreSQL schema. Table and column names are
//! Prisma's quoted camelCase identifiers; this module never changes the schema.
use crate::model::*;
use crate::server::sanitize::{index_headings, sanitize_html};
use crate::text::{classify_domains, normalize_search, plain_text, youtube_id};
use chrono::{NaiveDateTime, SecondsFormat};
use serde_json::Value;
use sqlx::{FromRow, PgPool};

pub fn iso(value: NaiveDateTime) -> String {
    value.and_utc().to_rfc3339_opts(SecondsFormat::Millis, true)
}

fn parse_json(value: &str) -> Value {
    serde_json::from_str(value).unwrap_or(Value::Null)
}

pub fn string_list(value: &str) -> Vec<String> {
    match parse_json(value) {
        Value::Array(items) => items
            .into_iter()
            .filter_map(|item| item.as_str().map(|s| s.trim().to_string()))
            .filter(|s| !s.is_empty())
            .collect(),
        _ => Vec::new(),
    }
}

fn responsibilities(value: &str) -> Vec<Responsibility> {
    const ICONS: [&str; 10] = ["cpu", "layers", "zap", "code", "wifi", "shieldcheck", "wrench", "sparkles", "terminal", "chart"];
    let Value::Array(items) = parse_json(value) else { return Vec::new() };
    items
        .iter()
        .filter_map(|item| {
            let title = item.get("title").and_then(Value::as_str).unwrap_or("").trim().to_string();
            let subtitle = item.get("subtitle").and_then(Value::as_str).unwrap_or("").trim().to_string();
            let icon = item.get("icon").and_then(Value::as_str).unwrap_or("cpu").to_ascii_lowercase();
            let icon = if ICONS.contains(&icon.as_str()) { icon } else { "cpu".into() };
            (!title.is_empty() || !subtitle.is_empty()).then_some(Responsibility { title, subtitle, icon })
        })
        .collect()
}

fn results(value: &str) -> Vec<ResultItem> {
    let Value::Array(items) = parse_json(value) else { return Vec::new() };
    items
        .iter()
        .filter_map(|item| {
            let number = item.get("number").or_else(|| item.get("value")).and_then(Value::as_str).unwrap_or("").trim().to_string();
            let label = item.get("label").and_then(Value::as_str).unwrap_or("").trim().to_string();
            (!number.is_empty() || !label.is_empty()).then_some(ResultItem { number, label })
        })
        .collect()
}

/// Same host allowlist as the Next.js site: Cloudinary, Vercel Blob or a relative path.
pub fn safe_image(value: &str) -> String {
    let raw = value.trim();
    if raw.len() > 500 { return String::new(); }
    if raw.starts_with('/') && !raw.starts_with("//") { return raw.to_string(); }
    if let Some(rest) = raw.strip_prefix("https://") {
        let host = rest.split(['/', '?', '#']).next().unwrap_or("").to_ascii_lowercase();
        if host == "res.cloudinary.com" || host.ends_with(".public.blob.vercel-storage.com") {
            return raw.to_string();
        }
    }
    String::new()
}

pub fn safe_url(value: Option<&str>) -> Option<String> {
    let raw = value?.trim();
    if raw.is_empty() || raw.len() > 500 { return None; }
    if (raw.starts_with('/') && !raw.starts_with("//")) || raw.starts_with('#') { return Some(raw.to_string()); }
    let candidate = if raw.contains("://") { raw.to_string() } else { format!("https://{raw}") };
    let rest = candidate.strip_prefix("https://").or_else(|| candidate.strip_prefix("http://"))?;
    let authority = rest.split(['/', '?', '#']).next().unwrap_or("");
    (!authority.is_empty() && !authority.contains('@') && authority.contains('.')).then_some(candidate)
}

#[derive(FromRow, Clone)]
pub struct ProjectRow {
    pub id: String,
    pub locale: String,
    pub title: String,
    pub subtitle: String,
    #[sqlx(rename = "overviewQuote")]
    pub overview_quote: String,
    pub year: String,
    pub role: String,
    pub highlight: String,
    #[sqlx(rename = "projectType")]
    pub project_type: String,
    pub responsibilities: String,
    pub results: String,
    pub category: String,
    pub description: String,
    #[sqlx(rename = "visualsTitle")]
    pub visuals_title: String,
    #[sqlx(rename = "videoTitle")]
    pub video_title: String,
    pub features: String,
    pub tech: String,
    pub image: String,
    pub images: String,
    #[sqlx(rename = "showVideoDemo")]
    pub show_video_demo: bool,
    pub published: bool,
    pub featured: bool,
    pub status: String,
    #[sqlx(rename = "youtubeUrl")]
    pub youtube_url: Option<String>,
    pub link: Option<String>,
    pub repo: Option<String>,
    pub order: i32,
    #[sqlx(rename = "createdAt")]
    pub created_at: NaiveDateTime,
    #[sqlx(rename = "updatedAt")]
    pub updated_at: NaiveDateTime,
}

impl ProjectRow {
    pub fn card(&self) -> ProjectCard {
        let tech = string_list(&self.tech);
        let domains = classify_domains(&self.category, &tech);
        let search = normalize_search(&format!("{} {} {} {} {}", self.title, self.category, self.subtitle, plain_text(&self.description), tech.join(" ")));
        ProjectCard {
            id: self.id.clone(),
            title: self.title.clone(),
            subtitle: if self.subtitle.trim().is_empty() { crate::text::truncate(&plain_text(&self.description), 200) } else { self.subtitle.clone() },
            category: self.category.clone(),
            domains,
            status: self.status.clone(),
            year: self.year.clone(),
            image: safe_image(&self.image),
            tech,
            repo: safe_url(self.repo.as_deref()),
            featured: self.featured,
            search,
        }
    }

    pub fn detail(&self) -> ProjectDetail {
        let tech = string_list(&self.tech);
        let (intro_html, sections) = split_sections(&sanitize_html(&self.description));
        let mut images: Vec<String> = Vec::new();
        for image in std::iter::once(self.image.clone()).chain(string_list(&self.images)) {
            let image = safe_image(&image);
            if !image.is_empty() && !images.contains(&image) { images.push(image); }
        }
        ProjectDetail {
            id: self.id.clone(),
            title: self.title.clone(),
            subtitle: self.subtitle.clone(),
            overview_quote: self.overview_quote.clone(),
            year: self.year.clone(),
            role: self.role.clone(),
            highlight: self.highlight.clone(),
            project_type: self.project_type.clone(),
            category: self.category.clone(),
            domains: classify_domains(&self.category, &tech),
            status: self.status.clone(),
            intro_html,
            sections,
            features: string_list(&self.features),
            tech,
            image: safe_image(&self.image),
            images,
            visuals_title: self.visuals_title.clone(),
            video_title: self.video_title.clone(),
            youtube_id: if self.show_video_demo { self.youtube_url.as_deref().and_then(youtube_id) } else { None },
            link: safe_url(self.link.as_deref()),
            repo: safe_url(self.repo.as_deref()),
            responsibilities: responsibilities(&self.responsibilities),
            results: results(&self.results),
            updated_at: iso(self.updated_at),
        }
    }
}

/// Split sanitized HTML at `h2`/`h3` headings: text before the first heading is the introduction.
fn split_sections(html: &str) -> (String, Vec<ContentSection>) {
    let (indexed, headings) = index_headings(html);
    if headings.is_empty() {
        return (indexed, Vec::new());
    }
    let mut sections = Vec::new();
    let mut intro = String::new();
    let mut cursor = 0;
    for (i, heading) in headings.iter().enumerate() {
        let marker = format!(" id=\"{}\"", heading.id);
        let Some(pos) = indexed[cursor..].find(&marker).map(|p| p + cursor) else { continue };
        let tag_start = indexed[..pos].rfind('<').unwrap_or(pos);
        if i == 0 {
            intro = indexed[..tag_start].to_string();
        } else if let Some(last) = sections.last_mut() {
            let section: &mut ContentSection = last;
            section.html = indexed[cursor..tag_start].to_string();
        }
        let close = if indexed[tag_start..].starts_with("<h2") { "</h2>" } else { "</h3>" };
        let end = indexed[tag_start..].find(close).map(|p| tag_start + p + close.len()).unwrap_or(tag_start);
        sections.push(ContentSection { id: heading.id.clone(), title: heading.text.clone(), html: String::new() });
        cursor = end;
    }
    if let Some(last) = sections.last_mut() {
        last.html = indexed[cursor..].to_string();
    }
    (intro, sections)
}

pub async fn published_projects(pool: &PgPool, locale: Locale) -> sqlx::Result<Vec<ProjectRow>> {
    let query = r#"SELECT * FROM "Project" WHERE locale = $1 AND published = true ORDER BY "order" ASC, "createdAt" DESC"#;
    let rows = sqlx::query_as::<_, ProjectRow>(query).bind(locale.code()).fetch_all(pool).await?;
    if rows.is_empty() && locale != Locale::Vi {
        // The English CMS has no project translations yet; show the Vietnamese records.
        return sqlx::query_as::<_, ProjectRow>(query).bind("vi").fetch_all(pool).await;
    }
    Ok(rows)
}

pub async fn project_by_id(pool: &PgPool, id: &str) -> sqlx::Result<Option<ProjectRow>> {
    sqlx::query_as::<_, ProjectRow>(r#"SELECT * FROM "Project" WHERE id = $1 AND published = true LIMIT 1"#)
        .bind(id)
        .fetch_optional(pool)
        .await
}

#[derive(FromRow)]
struct PostCardRow {
    id: String,
    locale: String,
    slug: String,
    title: String,
    excerpt: String,
    category: String,
    #[sqlx(rename = "coverImage")]
    cover_image: Option<String>,
    views: i32,
    likes: i32,
    #[sqlx(rename = "createdAt")]
    created_at: NaiveDateTime,
}

pub async fn published_posts(pool: &PgPool, locale: Locale) -> sqlx::Result<Vec<PostCard>> {
    let rows = sqlx::query_as::<_, PostCardRow>(
        r#"SELECT id, locale, slug, title, excerpt, category, "coverImage", views, likes, "createdAt"
           FROM "Post" WHERE published = true ORDER BY "createdAt" DESC"#,
    )
    .fetch_all(pool)
    .await?;
    let mut by_slug: Vec<PostCardRow> = Vec::new();
    for row in rows {
        match by_slug.iter_mut().find(|existing| existing.slug == row.slug) {
            Some(existing) if row.locale == locale.code() && existing.locale != locale.code() => *existing = row,
            Some(_) => {}
            None => by_slug.push(row),
        }
    }
    by_slug.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(by_slug
        .into_iter()
        .map(|row| PostCard {
            id: row.id,
            slug: row.slug,
            title: row.title,
            excerpt: plain_text(&row.excerpt),
            category: row.category,
            cover_image: row.cover_image.as_deref().map(safe_image).filter(|s| !s.is_empty()),
            created_at: iso(row.created_at),
            views: row.views,
            likes: row.likes,
        })
        .collect())
}

#[derive(FromRow)]
struct PostRow {
    id: String,
    slug: String,
    title: String,
    excerpt: String,
    content: String,
    category: String,
    #[sqlx(rename = "coverImage")]
    cover_image: Option<String>,
    #[sqlx(rename = "pdfUrl")]
    pdf_url: Option<String>,
    views: i32,
    likes: i32,
    bookmarks: i32,
    #[sqlx(rename = "seoTitle")]
    seo_title: Option<String>,
    #[sqlx(rename = "seoDescription")]
    seo_description: Option<String>,
    #[sqlx(rename = "seoKeywords")]
    seo_keywords: Option<String>,
    #[sqlx(rename = "createdAt")]
    created_at: NaiveDateTime,
    #[sqlx(rename = "updatedAt")]
    updated_at: NaiveDateTime,
}

pub async fn post_by_slug(pool: &PgPool, slug: &str, locale: Locale) -> sqlx::Result<Option<PostDetail>> {
    let row = sqlx::query_as::<_, PostRow>(
        r#"SELECT id, slug, title, excerpt, content, category, "coverImage", "pdfUrl", views, likes, bookmarks,
                  "seoTitle", "seoDescription", "seoKeywords", "createdAt", "updatedAt"
           FROM "Post" WHERE slug = $1 AND published = true ORDER BY (locale = $2) DESC LIMIT 1"#,
    )
    .bind(slug)
    .bind(locale.code())
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|row| {
        let words = plain_text(&row.content).split_whitespace().count() as u32;
        let (content_html, headings) = index_headings(&sanitize_html(&row.content));
        PostDetail {
            id: row.id,
            slug: row.slug,
            title: row.title,
            excerpt: plain_text(&row.excerpt),
            category: row.category,
            cover_image: row.cover_image.as_deref().map(safe_image).filter(|s| !s.is_empty()),
            pdf_url: safe_url(row.pdf_url.as_deref()),
            content_html,
            headings,
            reading_minutes: words.div_ceil(200).max(1),
            created_at: iso(row.created_at),
            updated_at: iso(row.updated_at),
            views: row.views,
            likes: row.likes,
            bookmarks: row.bookmarks,
            seo_title: row.seo_title.filter(|s| !s.trim().is_empty()),
            seo_description: row.seo_description.filter(|s| !s.trim().is_empty()),
            seo_keywords: row.seo_keywords.filter(|s| !s.trim().is_empty()),
        }
    }))
}

#[derive(FromRow)]
struct ProfileRow {
    id: String,
    email: String,
    github: String,
    settings: String,
}

/// Public presentation settings from the CMS profile (`profile-vi` holds the shared settings).
pub async fn site_settings(pool: &PgPool, locale: Locale) -> sqlx::Result<SiteSettings> {
    let rows = sqlx::query_as::<_, ProfileRow>(
        r#"SELECT id, email, github, settings FROM "Profile" WHERE id IN ('profile-vi', 'profile-en', 'profile')"#,
    )
    .fetch_all(pool)
    .await?;
    let primary = rows.iter().find(|r| r.id == format!("profile-{}", locale.code())).or_else(|| rows.iter().find(|r| r.id == "profile-vi")).or(rows.first());
    let shared = rows.iter().find(|r| r.id == "profile-vi").or(primary);
    let settings = shared.map(|r| parse_json(&r.settings)).unwrap_or(Value::Null);
    Ok(crate::server::settings::public_settings(&settings, locale, primary.map(|r| r.email.as_str()), primary.map(|r| r.github.as_str())))
}
