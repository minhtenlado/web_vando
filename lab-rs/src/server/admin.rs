//! Admin data operations on the existing Prisma schema (same validation limits as the Next.js routes).
use crate::model::*;
use crate::server::auth::log_activity;
use crate::server::db::{iso, safe_image, safe_url, string_list, ProjectRow};
use crate::server::interact::new_id;
use crate::server::sanitize::clean_html;
use crate::text::normalize_search;
use chrono::NaiveDateTime;
use serde_json::{json, Value};
use sqlx::{FromRow, PgPool};

pub type R<T> = Result<T, String>;

fn db_err(e: sqlx::Error) -> String {
    tracing::error!("[admin] database error: {e}");
    "Lỗi cơ sở dữ liệu. Vui lòng thử lại.".into()
}

fn clip(value: &str, max: usize) -> String { value.trim().chars().take(max).collect() }

pub fn slugify(value: &str) -> String {
    let folded = normalize_search(value);
    let mut out = String::new();
    for ch in folded.chars() {
        if ch.is_ascii_alphanumeric() { out.push(ch); } else if !out.ends_with('-') { out.push('-'); }
    }
    out.trim_matches('-').chars().take(120).collect()
}

// ---------- Dashboard ----------

pub async fn stats(pool: &PgPool) -> R<DashboardStats> {
    let (pp, pd): (i64, i64) = sqlx::query_as(r#"SELECT COUNT(*) FILTER (WHERE published), COUNT(*) FILTER (WHERE NOT published) FROM "Project""#).fetch_one(pool).await.map_err(db_err)?;
    let (sp, sd, views, likes, bookmarks): (i64, i64, Option<i64>, Option<i64>, Option<i64>) = sqlx::query_as(
        r#"SELECT COUNT(*) FILTER (WHERE published), COUNT(*) FILTER (WHERE NOT published), SUM(views)::bigint, SUM(likes)::bigint, SUM(bookmarks)::bigint FROM "Post""#,
    ).fetch_one(pool).await.map_err(db_err)?;
    let comments: i64 = sqlx::query_scalar(r#"SELECT COUNT(*) FROM "Comment""#).fetch_one(pool).await.map_err(db_err)?;
    let (unread, total): (i64, i64) = sqlx::query_as(r#"SELECT COUNT(*) FILTER (WHERE NOT read AND NOT archived), COUNT(*) FILTER (WHERE NOT archived) FROM "ContactMessage""#).fetch_one(pool).await.map_err(db_err)?;
    let top_posts: Vec<(String, String, i32, i32)> = sqlx::query_as(r#"SELECT title, slug, views, likes FROM "Post" ORDER BY views DESC LIMIT 5"#).fetch_all(pool).await.map_err(db_err)?;
    let status_counts: Vec<(String, i64)> = sqlx::query_as(r#"SELECT CASE WHEN status = '' THEN 'unspecified' ELSE status END, COUNT(*) FROM "Project" GROUP BY 1 ORDER BY 2 DESC"#).fetch_all(pool).await.map_err(db_err)?;
    Ok(DashboardStats {
        projects_published: pp, projects_draft: pd, posts_published: sp, posts_draft: sd,
        views: views.unwrap_or(0), likes: likes.unwrap_or(0), bookmarks: bookmarks.unwrap_or(0),
        comments, messages_unread: unread, messages_total: total, top_posts, status_counts,
        recent: activities(pool, 8).await?,
    })
}

// ---------- Projects ----------

fn admin_project(row: &ProjectRow) -> AdminProject {
    let detail_results = serde_json::from_str::<Value>(&row.results).ok();
    let results = detail_results.and_then(|v| v.as_array().cloned()).unwrap_or_default().into_iter().filter_map(|item| {
        let number = item.get("number").or_else(|| item.get("value")).and_then(Value::as_str).unwrap_or("").to_string();
        let label = item.get("label").and_then(Value::as_str).unwrap_or("").to_string();
        (!number.is_empty() || !label.is_empty()).then_some(ResultItem { number, label })
    }).collect();
    let responsibilities = serde_json::from_str::<Vec<Responsibility>>(&row.responsibilities).unwrap_or_default();
    AdminProject {
        id: row.id.clone(), locale: row.locale.clone(), title: row.title.clone(), subtitle: row.subtitle.clone(),
        overview_quote: row.overview_quote.clone(), year: row.year.clone(), role: row.role.clone(), highlight: row.highlight.clone(),
        project_type: row.project_type.clone(), category: row.category.clone(), description: row.description.clone(),
        visuals_title: row.visuals_title.clone(), video_title: row.video_title.clone(), features: string_list(&row.features),
        tech: string_list(&row.tech), image: row.image.clone(), images: string_list(&row.images), show_video_demo: row.show_video_demo,
        published: row.published, featured: row.featured, status: row.status.clone(), youtube_url: row.youtube_url.clone().unwrap_or_default(),
        link: row.link.clone().unwrap_or_default(), repo: row.repo.clone().unwrap_or_default(), order: row.order,
        responsibilities, results, updated_at: iso(row.updated_at),
    }
}

pub async fn projects(pool: &PgPool) -> R<Vec<AdminProject>> {
    let rows = sqlx::query_as::<_, ProjectRow>(r#"SELECT * FROM "Project" ORDER BY locale DESC, "order" ASC, "createdAt" DESC"#).fetch_all(pool).await.map_err(db_err)?;
    Ok(rows.iter().map(admin_project).collect())
}

pub async fn project(pool: &PgPool, id: &str) -> R<Option<AdminProject>> {
    let row = sqlx::query_as::<_, ProjectRow>(r#"SELECT * FROM "Project" WHERE id = $1"#).bind(id).fetch_optional(pool).await.map_err(db_err)?;
    Ok(row.as_ref().map(admin_project))
}

fn youtube(value: &str) -> R<Option<String>> {
    let raw = value.trim();
    if raw.is_empty() { return Ok(None); }
    if crate::text::youtube_id(raw).is_some() && (raw.len() == 11 || raw.contains("youtube.com") || raw.contains("youtu.be") || raw.contains("youtube-nocookie.com")) {
        return Ok(Some(raw.to_string()));
    }
    Err("URL YouTube không hợp lệ.".into())
}

fn optional_url(value: &str, label: &str) -> R<Option<String>> {
    if value.trim().is_empty() { return Ok(None); }
    safe_url(Some(value)).map(Some).ok_or_else(|| format!("URL {label} không hợp lệ."))
}

pub async fn save_project(pool: &PgPool, input: AdminProject) -> R<AdminProject> {
    let title = clip(&input.title, 300);
    if title.is_empty() { return Err("Tiêu đề dự án là bắt buộc.".into()); }
    if !["", "completed", "in-development", "prototype", "research"].contains(&input.status.as_str()) { return Err("Trạng thái dự án không hợp lệ.".into()); }
    let image = safe_image(&input.image);
    if !input.image.trim().is_empty() && image.is_empty() { return Err("Ảnh bìa phải là URL Cloudinary hoặc Vercel Blob.".into()); }
    let mut images = Vec::new();
    for item in &input.images {
        if item.trim().is_empty() { continue; }
        let safe = safe_image(item);
        if safe.is_empty() { return Err(format!("Ảnh không hợp lệ: {item}")); }
        if !images.contains(&safe) { images.push(safe); }
    }
    let youtube_url = youtube(&input.youtube_url)?;
    let link = optional_url(&input.link, "tài nguyên")?;
    let repo = optional_url(&input.repo, "mã nguồn")?;
    let list = |items: &[String], max_len: usize| -> String {
        json!(items.iter().map(|s| clip(s, max_len)).filter(|s| !s.is_empty()).take(100).collect::<Vec<_>>()).to_string()
    };
    let responsibilities: Vec<Value> = input.responsibilities.iter().filter(|r| !r.title.trim().is_empty() || !r.subtitle.trim().is_empty()).take(100)
        .map(|r| json!({ "title": clip(&r.title, 300), "subtitle": clip(&r.subtitle, 1000), "icon": if r.icon.is_empty() { "cpu".to_string() } else { r.icon.to_lowercase() } })).collect();
    let results: Vec<Value> = input.results.iter().filter(|r| !r.number.trim().is_empty() || !r.label.trim().is_empty()).take(100)
        .map(|r| json!({ "number": clip(&r.number, 120), "label": clip(&r.label, 300) })).collect();
    let locale = if input.locale == "en" { "en" } else { "vi" };
    let description = if input.description.len() > 5_000_000 { input.description[..5_000_000].to_string() } else { input.description.clone() };
    let id = if input.id.is_empty() {
        let order: i32 = sqlx::query_scalar::<_, Option<i32>>(r#"SELECT MAX("order") FROM "Project" WHERE locale = $1"#).bind(locale).fetch_one(pool).await.map_err(db_err)?.map(|o| o + 1).unwrap_or(0);
        let id = new_id();
        sqlx::query(r#"INSERT INTO "Project" (id, locale, title, "order", "updatedAt") VALUES ($1, $2, $3, $4, NOW())"#)
            .bind(&id).bind(locale).bind(&title).bind(order).execute(pool).await.map_err(db_err)?;
        id
    } else { input.id.clone() };
    let updated = sqlx::query(
        r#"UPDATE "Project" SET title = $2, subtitle = $3, "overviewQuote" = $4, year = $5, role = $6, highlight = $7, "projectType" = $8,
           responsibilities = $9, results = $10, category = $11, description = $12, "visualsTitle" = $13, "videoTitle" = $14,
           features = $15, tech = $16, image = $17, images = $18, "showVideoDemo" = $19, published = $20, featured = $21, status = $22,
           "youtubeUrl" = $23, link = $24, repo = $25, "updatedAt" = NOW() WHERE id = $1"#,
    )
    .bind(&id).bind(&title).bind(clip(&input.subtitle, 500)).bind(clip(&input.overview_quote, 2000)).bind(clip(&input.year, 100))
    .bind(clip(&input.role, 200)).bind(clip(&input.highlight, 200)).bind(clip(&input.project_type, 200))
    .bind(Value::Array(responsibilities).to_string()).bind(Value::Array(results).to_string()).bind(clip(&input.category, 200)).bind(description)
    .bind(clip(&input.visuals_title, 200)).bind(clip(&input.video_title, 200)).bind(list(&input.features, 300)).bind(list(&input.tech, 120))
    .bind(&image).bind(json!(images).to_string()).bind(input.show_video_demo).bind(input.published).bind(input.featured).bind(&input.status)
    .bind(youtube_url).bind(link).bind(repo)
    .execute(pool).await.map_err(db_err)?;
    if updated.rows_affected() == 0 { return Err("Không tìm thấy dự án.".into()); }
    log_activity(pool, "content", if input.id.is_empty() { "create" } else { "update" }, &format!("{} dự án: {title}", if input.id.is_empty() { "Tạo" } else { "Cập nhật" }), "", &id, "success").await;
    project(pool, &id).await?.ok_or_else(|| "Không tìm thấy dự án.".into())
}

pub async fn delete_project(pool: &PgPool, id: &str) -> R<()> {
    let title: Option<String> = sqlx::query_scalar(r#"DELETE FROM "Project" WHERE id = $1 RETURNING title"#).bind(id).fetch_optional(pool).await.map_err(db_err)?;
    let title = title.ok_or("Không tìm thấy dự án.")?;
    log_activity(pool, "content", "delete", &format!("Xóa dự án: {title}"), "", id, "danger").await;
    Ok(())
}

/// Swap display order with the neighbouring project of the same locale.
pub async fn move_project(pool: &PgPool, id: &str, up: bool) -> R<()> {
    let rows: Vec<(String, String, i32)> = sqlx::query_as(r#"SELECT id, locale, "order" FROM "Project" WHERE locale = (SELECT locale FROM "Project" WHERE id = $1) ORDER BY "order" ASC, "createdAt" DESC"#)
        .bind(id).fetch_all(pool).await.map_err(db_err)?;
    let Some(i) = rows.iter().position(|r| r.0 == id) else { return Err("Không tìm thấy dự án.".into()) };
    let j = if up { i.checked_sub(1) } else { (i + 1 < rows.len()).then_some(i + 1) };
    let Some(j) = j else { return Ok(()) };
    let mut tx = pool.begin().await.map_err(db_err)?;
    // Normalise to positions first so equal order values still swap predictably.
    for (pos, row) in rows.iter().enumerate() {
        let target = if pos == i { j } else if pos == j { i } else { pos };
        sqlx::query(r#"UPDATE "Project" SET "order" = $2 WHERE id = $1"#).bind(&row.0).bind(target as i32).execute(&mut *tx).await.map_err(db_err)?;
    }
    tx.commit().await.map_err(db_err)?;
    Ok(())
}

// ---------- Posts ----------

#[derive(FromRow)]
struct PostRow {
    id: String, locale: String, title: String, slug: String, excerpt: String, content: String, published: bool, category: String,
    layout: String, #[sqlx(rename = "coverImage")] cover_image: Option<String>, #[sqlx(rename = "pdfUrl")] pdf_url: Option<String>,
    #[sqlx(rename = "seoTitle")] seo_title: Option<String>, #[sqlx(rename = "seoDescription")] seo_description: Option<String>,
    #[sqlx(rename = "seoKeywords")] seo_keywords: Option<String>, views: i32, likes: i32,
    #[sqlx(rename = "createdAt")] created_at: NaiveDateTime, #[sqlx(rename = "updatedAt")] updated_at: NaiveDateTime,
}

impl From<PostRow> for AdminPost {
    fn from(r: PostRow) -> Self {
        AdminPost {
            id: r.id, locale: r.locale, title: r.title, slug: r.slug, excerpt: r.excerpt, content: r.content, published: r.published,
            category: r.category, layout: r.layout, cover_image: r.cover_image.unwrap_or_default(), pdf_url: r.pdf_url.unwrap_or_default(),
            seo_title: r.seo_title.unwrap_or_default(), seo_description: r.seo_description.unwrap_or_default(), seo_keywords: r.seo_keywords.unwrap_or_default(),
            views: r.views, likes: r.likes, created_at: iso(r.created_at), updated_at: iso(r.updated_at),
        }
    }
}

const POST_COLUMNS: &str = r#"id, locale, title, slug, excerpt, content, published, category, layout, "coverImage", "pdfUrl", "seoTitle", "seoDescription", "seoKeywords", views, likes, "createdAt", "updatedAt""#;

pub async fn posts(pool: &PgPool) -> R<Vec<AdminPost>> {
    let rows = sqlx::query_as::<_, PostRow>(sqlx::AssertSqlSafe(format!(r#"SELECT {POST_COLUMNS} FROM "Post" ORDER BY "createdAt" DESC"#))).fetch_all(pool).await.map_err(db_err)?;
    Ok(rows.into_iter().map(|r| { let mut p: AdminPost = r.into(); p.content.clear(); p }).collect())
}

pub async fn post(pool: &PgPool, id: &str) -> R<Option<AdminPost>> {
    let row = sqlx::query_as::<_, PostRow>(sqlx::AssertSqlSafe(format!(r#"SELECT {POST_COLUMNS} FROM "Post" WHERE id = $1"#))).bind(id).fetch_optional(pool).await.map_err(db_err)?;
    Ok(row.map(Into::into))
}

fn nullable_url(value: &str) -> Option<String> {
    let v = value.trim();
    if v.is_empty() { None } else { safe_url(Some(v)) }
}

pub async fn save_post(pool: &PgPool, input: AdminPost) -> R<AdminPost> {
    let title = clip(&input.title, 300);
    if title.is_empty() { return Err("Tiêu đề là bắt buộc.".into()); }
    let locale = if input.locale == "en" { "en" } else { "vi" };
    let slug = { let s = slugify(if input.slug.trim().is_empty() { &title } else { &input.slug }); if s.is_empty() { format!("post-{}", chrono::Utc::now().timestamp_millis()) } else { s } };
    let taken: Option<String> = sqlx::query_scalar(r#"SELECT id FROM "Post" WHERE slug = $1 AND locale = $2"#).bind(&slug).bind(locale).fetch_optional(pool).await.map_err(db_err)?;
    if taken.as_deref().is_some_and(|other| other != input.id) { return Err("Slug đã tồn tại.".into()); }
    let layout = if input.layout == "tutorial" { "tutorial" } else { "article" };
    let created = if input.created_at.trim().is_empty() { None } else {
        Some(chrono::DateTime::parse_from_rfc3339(&input.created_at).map_err(|_| "Ngày đăng không hợp lệ.".to_string())?.naive_utc())
    };
    // Same as before: strip scripts and event handlers, keep the editor's formatting.
    let content = clean_html(&input.content);
    let id = if input.id.is_empty() {
        let id = new_id();
        sqlx::query(r#"INSERT INTO "Post" (id, locale, title, slug, "updatedAt") VALUES ($1, $2, $3, $4, NOW())"#).bind(&id).bind(locale).bind(&title).bind(&slug).execute(pool).await.map_err(db_err)?;
        id
    } else { input.id.clone() };
    let updated = sqlx::query(
        r#"UPDATE "Post" SET title = $2, slug = $3, excerpt = $4, content = $5, published = $6, category = $7, layout = $8, "coverImage" = $9,
           "pdfUrl" = $10, "seoTitle" = $11, "seoDescription" = $12, "seoKeywords" = $13, "createdAt" = COALESCE($14, "createdAt"), "updatedAt" = NOW() WHERE id = $1"#,
    )
    .bind(&id).bind(&title).bind(&slug).bind(clip(&input.excerpt, 600)).bind(content).bind(input.published).bind(clip(&input.category, 100)).bind(layout)
    .bind(nullable_url(&input.cover_image)).bind(nullable_url(&input.pdf_url))
    .bind(Some(clip(&input.seo_title, 300)).filter(|s| !s.is_empty())).bind(Some(clip(&input.seo_description, 600)).filter(|s| !s.is_empty()))
    .bind(Some(clip(&input.seo_keywords, 300)).filter(|s| !s.is_empty())).bind(created)
    .execute(pool).await.map_err(db_err)?;
    if updated.rows_affected() == 0 { return Err("Không tìm thấy bài viết.".into()); }
    log_activity(pool, "content", if input.id.is_empty() { "create" } else { "update" }, &format!("{} bài viết: {title}", if input.id.is_empty() { "Tạo" } else { "Cập nhật" }), "", &slug, "success").await;
    post(pool, &id).await?.ok_or_else(|| "Không tìm thấy bài viết.".into())
}

pub async fn delete_post(pool: &PgPool, id: &str) -> R<()> {
    let title: Option<String> = sqlx::query_scalar(r#"DELETE FROM "Post" WHERE id = $1 RETURNING title"#).bind(id).fetch_optional(pool).await.map_err(db_err)?;
    let title = title.ok_or("Không tìm thấy bài viết.")?;
    log_activity(pool, "content", "delete", &format!("Xóa bài viết: {title}"), "", id, "danger").await;
    Ok(())
}

// ---------- Comments ----------

#[derive(FromRow)]
struct CommentJoin {
    id: String, #[sqlx(rename = "parentId")] parent_id: Option<String>, author: String, #[sqlx(rename = "isAnonymous")] is_anonymous: bool,
    #[sqlx(rename = "isAuthor")] is_author: bool, #[sqlx(rename = "avatarColor")] avatar_color: String, content: String, likes: i32,
    #[sqlx(rename = "createdAt")] created_at: NaiveDateTime, #[sqlx(rename = "postSlug")] post_slug: String, post_title: Option<String>,
}

pub async fn comments(pool: &PgPool) -> R<Vec<AdminComment>> {
    let rows = sqlx::query_as::<_, CommentJoin>(
        r#"SELECT c.id, c."parentId", c.author, c."isAnonymous", c."isAuthor", c."avatarColor", c.content, c.likes, c."createdAt", c."postSlug",
                  (SELECT p.title FROM "Post" p WHERE p.slug = c."postSlug" LIMIT 1) AS post_title
           FROM "Comment" c ORDER BY c."createdAt" DESC LIMIT 500"#,
    ).fetch_all(pool).await.map_err(db_err)?;
    Ok(rows.into_iter().map(|r| AdminComment {
        post_title: r.post_title.unwrap_or_else(|| r.post_slug.clone()), post_slug: r.post_slug,
        comment: CommentView { id: r.id, parent_id: r.parent_id, author: r.author, is_anonymous: r.is_anonymous, is_author: r.is_author, avatar_color: r.avatar_color, content: r.content, likes: r.likes, created_at: iso(r.created_at) },
    }).collect())
}

pub async fn reply_comment(pool: &PgPool, slug: &str, parent_id: Option<String>, content: &str) -> R<()> {
    let content: String = content.chars().filter(|c| *c != '<' && *c != '>').collect::<String>().trim().to_string();
    if content.chars().count() < 2 { return Err("Nội dung phản hồi không hợp lệ.".into()); }
    let (name, avatar): (String, String) = sqlx::query_as(r#"SELECT name, avatar FROM "Profile" WHERE locale = 'vi' ORDER BY id LIMIT 1"#).fetch_optional(pool).await.map_err(db_err)?.unwrap_or_default();
    sqlx::query(r#"INSERT INTO "Comment" (id, "postSlug", "parentId", author, "isAnonymous", "isAuthor", "avatarUrl", content, "avatarColor", likes) VALUES ($1, $2, $3, $4, false, true, $5, $6, 'amber', 0)"#)
        .bind(new_id()).bind(slug).bind(parent_id.filter(|p| !p.is_empty())).bind(if name.trim().is_empty() { "Phan Huỳnh Văn Đô".to_string() } else { name })
        .bind(Some(avatar).filter(|a| !a.is_empty())).bind(&content).execute(pool).await.map_err(db_err)?;
    log_activity(pool, "content", "create", "Tác giả trả lời bình luận", &format!("Trả lời trong bài viết: {slug}"), slug, "success").await;
    Ok(())
}

pub async fn delete_comment(pool: &PgPool, id: &str) -> R<()> {
    let removed = sqlx::query(r#"DELETE FROM "Comment" WHERE id = $1 OR "parentId" = $1"#).bind(id).execute(pool).await.map_err(db_err)?;
    if removed.rows_affected() == 0 { return Err("Không tìm thấy bình luận.".into()); }
    log_activity(pool, "content", "delete", "Xóa bình luận", &format!("{} bình luận đã bị xóa", removed.rows_affected()), id, "warning").await;
    Ok(())
}

// ---------- Messages ----------

#[derive(FromRow)]
struct MessageRow { id: String, name: String, email: String, topic: String, message: String, ticket: String, read: bool, starred: bool, archived: bool, #[sqlx(rename = "createdAt")] created_at: NaiveDateTime }

pub async fn messages(pool: &PgPool, filter: &str) -> R<Vec<AdminMessage>> {
    let condition = match filter { "unread" => "read = false AND archived = false", "starred" => "starred = true", "archived" => "archived = true", _ => "archived = false" };
    let rows = sqlx::query_as::<_, MessageRow>(sqlx::AssertSqlSafe(format!(r#"SELECT id, name, email, topic, message, ticket, read, starred, archived, "createdAt" FROM "ContactMessage" WHERE {condition} ORDER BY "createdAt" DESC LIMIT 200"#)))
        .fetch_all(pool).await.map_err(db_err)?;
    Ok(rows.into_iter().map(|r| AdminMessage { id: r.id, name: r.name, email: r.email, topic: r.topic, message: r.message, ticket: r.ticket, read: r.read, starred: r.starred, archived: r.archived, created_at: iso(r.created_at) }).collect())
}

pub async fn update_message(pool: &PgPool, id: &str, field: &str, value: bool) -> R<()> {
    let column = match field { "read" => "read", "starred" => "starred", "archived" => "archived", _ => return Err("Trường không hợp lệ.".into()) };
    sqlx::query(sqlx::AssertSqlSafe(format!(r#"UPDATE "ContactMessage" SET {column} = $2 WHERE id = $1"#))).bind(id).bind(value).execute(pool).await.map_err(db_err)?;
    Ok(())
}

// ---------- Activity ----------

#[derive(FromRow)]
struct ActivityRow { id: String, category: String, action: String, title: String, detail: String, status: String, #[sqlx(rename = "createdAt")] created_at: NaiveDateTime }

pub async fn activities(pool: &PgPool, limit: i64) -> R<Vec<Activity>> {
    let rows = sqlx::query_as::<_, ActivityRow>(r#"SELECT id, category, action, title, detail, status, "createdAt" FROM "ActivityLog" ORDER BY "createdAt" DESC LIMIT $1"#).bind(limit).fetch_all(pool).await.map_err(db_err)?;
    Ok(rows.into_iter().map(|r| Activity { id: r.id, category: r.category, action: r.action, title: r.title, detail: r.detail, status: r.status, created_at: iso(r.created_at) }).collect())
}

/// Previous behaviour: remove entries older than 30 days.
pub async fn prune_activities(pool: &PgPool) -> R<u64> {
    Ok(sqlx::query(r#"DELETE FROM "ActivityLog" WHERE "createdAt" < NOW() - INTERVAL '30 days'"#).execute(pool).await.map_err(db_err)?.rows_affected())
}

// ---------- Content settings ----------

const SETTING_KEYS: [(&str, &str); 16] = [
    ("portfolioName", "portfolio_name"), ("portfolioTagline", "portfolio_tagline"), ("heroHeadlineVi", "hero_headline_vi"), ("heroHeadlineEn", "hero_headline_en"),
    ("heroDescriptionVi", "hero_description_vi"), ("heroDescriptionEn", "hero_description_en"), ("heroPrimaryLabelVi", "hero_primary_label_vi"),
    ("heroPrimaryLabelEn", "hero_primary_label_en"), ("heroSecondaryLabelVi", "hero_secondary_label_vi"), ("heroSecondaryLabelEn", "hero_secondary_label_en"),
    ("heroSecondaryUrl", "hero_secondary_url"), ("metaTitle", "meta_title"), ("metaDescription", "meta_description"),
    ("heroPrimaryUrl", "hero_primary_url"), ("ogTitle", "og_title"), ("ogImageUrl", "og_image_url"),
];

pub async fn content(pool: &PgPool) -> R<ContentSettings> {
    let row: Option<(String, String, String)> = sqlx::query_as(r#"SELECT settings, email, github FROM "Profile" WHERE id IN ('profile-vi', 'profile') ORDER BY id DESC LIMIT 1"#).fetch_optional(pool).await.map_err(db_err)?;
    let (settings, email, github) = row.unwrap_or_default();
    let settings: Value = serde_json::from_str(&settings).unwrap_or(json!({}));
    let mut out = serde_json::Map::new();
    for (key, field) in SETTING_KEYS { out.insert(field.into(), settings.get(key).and_then(Value::as_str).unwrap_or("").into()); }
    out.insert("analytics_enabled".into(), settings.get("analyticsEnabled").and_then(Value::as_bool).unwrap_or(false).into());
    out.insert("analytics_id".into(), settings.get("analyticsId").and_then(Value::as_str).unwrap_or("").into());
    out.insert("section_featured_enabled".into(), (settings.get("sectionFeaturedEnabled").and_then(Value::as_bool) != Some(false)).into());
    out.insert("email".into(), email.into());
    out.insert("github".into(), github.into());
    serde_json::from_value(Value::Object(out)).map_err(|e| e.to_string())
}

/// Merge the editable keys into the existing settings JSON so unrelated preferences are preserved.
pub async fn save_content(pool: &PgPool, input: ContentSettings) -> R<ContentSettings> {
    let value = serde_json::to_value(&input).map_err(|e| e.to_string())?;
    if !input.analytics_id.is_empty() && !input.analytics_id.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-') { return Err("Mã Analytics không hợp lệ.".into()); }
    if !input.hero_secondary_url.trim().is_empty() && safe_url(Some(&input.hero_secondary_url)).is_none() { return Err("URL nút phụ không hợp lệ.".into()); }
    if !input.hero_primary_url.trim().is_empty() && safe_url(Some(&input.hero_primary_url)).is_none() { return Err("URL nút chính không hợp lệ.".into()); }
    if !input.og_image_url.trim().is_empty() && safe_image(&input.og_image_url).is_empty() { return Err("Ảnh Open Graph phải là ảnh Cloudinary hoặc đường dẫn nội bộ.".into()); }
    if !input.email.trim().is_empty() && !input.email.contains('@') { return Err("Email không hợp lệ.".into()); }
    let mut tx = pool.begin().await.map_err(db_err)?;
    let rows: Vec<(String, String)> = sqlx::query_as(r#"SELECT id, settings FROM "Profile" WHERE id IN ('profile-vi', 'profile-en', 'profile') FOR UPDATE"#).fetch_all(&mut *tx).await.map_err(db_err)?;
    for (id, settings) in rows {
        let mut merged: Value = serde_json::from_str(&settings).unwrap_or(json!({}));
        if !merged.is_object() { merged = json!({}); }
        if id != "profile-en" || !merged.as_object().is_some_and(|o| o.is_empty()) {
            for (key, field) in SETTING_KEYS { merged[key] = Value::String(clip(value[field].as_str().unwrap_or(""), 2000)); }
            merged["analyticsEnabled"] = Value::Bool(input.analytics_enabled);
            merged["analyticsId"] = Value::String(clip(&input.analytics_id, 128));
            merged["sectionFeaturedEnabled"] = Value::Bool(input.section_featured_enabled);
        }
        sqlx::query(r#"UPDATE "Profile" SET settings = $2, email = $3, github = $4, "updatedAt" = NOW() WHERE id = $1"#)
            .bind(&id).bind(merged.to_string()).bind(clip(&input.email, 200)).bind(clip(&input.github, 200)).execute(&mut *tx).await.map_err(db_err)?;
    }
    tx.commit().await.map_err(db_err)?;
    log_activity(pool, "system", "update", "Cập nhật nội dung trang", "Hero, SEO và liên kết công khai", "settings", "success").await;
    content(pool).await
}

pub async fn change_password(pool: &PgPool, current: &str, new: &str, confirm: &str) -> R<()> {
    if current.is_empty() || new.is_empty() || confirm.is_empty() { return Err("Vui lòng nhập đầy đủ thông tin".into()); }
    if new != confirm { return Err("Mật khẩu xác nhận không khớp".into()); }
    if new.chars().count() < 6 { return Err("Mật khẩu mới phải có ít nhất 6 ký tự".into()); }
    if !crate::server::auth::verify_password(pool, current).await { return Err("Mật khẩu hiện tại không đúng".into()); }
    let new = new.to_string();
    let hash = tokio::task::spawn_blocking(move || crate::server::auth::hash_password(&new)).await.ok().flatten().ok_or("Lỗi máy chủ")?;
    sqlx::query(r#"UPDATE "Profile" SET "passwordHash" = $1"#).bind(hash).execute(pool).await.map_err(db_err)?;
    log_activity(pool, "security", "update", "Đổi mật khẩu thành công", "Quản trị viên đã thay đổi mật khẩu đăng nhập hệ thống.", "", "warning").await;
    Ok(())
}

// ---------- Profile, credentials and experiences ----------

fn profile_id(locale: &str) -> &'static str { if locale == "en" { "profile-en" } else { "profile-vi" } }

fn locale_of(value: &str) -> &'static str { if value == "en" { "en" } else { "vi" } }

/// Links that would run script when clicked are refused; everything else is stored as typed (as before).
fn scriptable(url: &str) -> bool {
    let lower: String = url.trim().chars().filter(|c| !c.is_whitespace()).collect::<String>().to_ascii_lowercase();
    ["javascript:", "data:", "vbscript:"].iter().any(|scheme| lower.starts_with(scheme))
}

/// Parse a JSON list item by item so one malformed entry does not discard the rest.
fn json_items<T: serde::de::DeserializeOwned>(text: &str) -> Vec<T> {
    serde_json::from_str::<Vec<Value>>(text).unwrap_or_default().into_iter().filter_map(|v| serde_json::from_value(v).ok()).collect()
}

fn locale_text(value: &LocaleText, max: usize) -> LocaleText { LocaleText { vi: clip(&value.vi, max), en: clip(&value.en, max) } }

#[derive(FromRow)]
struct ProfileRow { name: String, role: String, tagline: String, location: String, phone: String, website: String, linkedin: String, avatar: String, socials: String }

pub async fn profile(pool: &PgPool, locale: &str) -> R<ProfileForm> {
    let locale = locale_of(locale);
    let row = sqlx::query_as::<_, ProfileRow>(
        r#"SELECT name, role, tagline, location, phone, website, linkedin, avatar, socials FROM "Profile" WHERE id IN ($1, 'profile') ORDER BY (id = $1) DESC LIMIT 1"#,
    ).bind(profile_id(locale)).fetch_optional(pool).await.map_err(db_err)?;
    let Some(r) = row else { return Ok(ProfileForm { locale: locale.into(), ..Default::default() }) };
    Ok(ProfileForm {
        locale: locale.into(), name: r.name, role: r.role, tagline: r.tagline, location: r.location, phone: r.phone,
        website: r.website, linkedin: r.linkedin, avatar: r.avatar, socials: json_items(&r.socials),
    })
}

/// Same limits as `PUT /api/admin/profile`: one row per language, 2000 characters per field.
pub async fn save_profile(pool: &PgPool, input: ProfileForm) -> R<ProfileForm> {
    let locale = locale_of(&input.locale);
    if input.name.trim().is_empty() { return Err("Tên không được để trống.".into()); }
    if !input.avatar.trim().is_empty() && safe_image(&input.avatar).is_empty() { return Err("Ảnh đại diện phải là ảnh trên Cloudinary.".into()); }
    if input.socials.len() > 30 { return Err("Tối đa 30 liên kết mạng xã hội.".into()); }
    if let Some(bad) = input.socials.iter().find(|s| scriptable(&s.url)) { return Err(format!("Liên kết {} không hợp lệ.", bad.platform)); }
    let socials: Vec<SocialLink> = input.socials.iter().map(|s| SocialLink { platform: clip(&s.platform, 60), url: clip(&s.url, 500), enabled: s.enabled }).collect();
    let socials = serde_json::to_string(&socials).map_err(|e| e.to_string())?;
    let id = profile_id(locale);
    let fields = [clip(&input.name, 2000), clip(&input.role, 2000), clip(&input.tagline, 2000), clip(&input.location, 2000), clip(&input.phone, 2000), clip(&input.website, 2000), clip(&input.linkedin, 2000), input.avatar.trim().to_string()];
    let update = sqlx::query(r#"UPDATE "Profile" SET name = $2, role = $3, tagline = $4, location = $5, phone = $6, website = $7, linkedin = $8, avatar = $9, socials = $10, "updatedAt" = NOW() WHERE id = $1"#)
        .bind(id).bind(&fields[0]).bind(&fields[1]).bind(&fields[2]).bind(&fields[3]).bind(&fields[4]).bind(&fields[5]).bind(&fields[6]).bind(&fields[7]).bind(&socials)
        .execute(pool).await.map_err(db_err)?;
    if update.rows_affected() == 0 {
        sqlx::query(r#"INSERT INTO "Profile" (id, locale, name, role, tagline, location, phone, website, linkedin, avatar, socials, "updatedAt") VALUES ($1, $11, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())"#)
            .bind(id).bind(&fields[0]).bind(&fields[1]).bind(&fields[2]).bind(&fields[3]).bind(&fields[4]).bind(&fields[5]).bind(&fields[6]).bind(&fields[7]).bind(&socials).bind(locale)
            .execute(pool).await.map_err(db_err)?;
    }
    log_activity(pool, "content", "update", "Cập nhật hồ sơ", &format!("Hồ sơ {}", locale.to_uppercase()), id, "success").await;
    profile(pool, locale).await
}

/// Set the avatar of one profile row (used by `/api/admin/upload-avatar`, as before).
pub async fn set_avatar(pool: &PgPool, locale: &str, url: &str) -> R<()> {
    let id = profile_id(locale_of(locale));
    let update = sqlx::query(r#"UPDATE "Profile" SET avatar = $2, "updatedAt" = NOW() WHERE id = $1"#).bind(id).bind(url).execute(pool).await.map_err(db_err)?;
    if update.rows_affected() == 0 {
        sqlx::query(r#"INSERT INTO "Profile" (id, locale, avatar, "updatedAt") VALUES ($1, $2, $3, NOW())"#).bind(id).bind(locale_of(locale)).bind(url).execute(pool).await.map_err(db_err)?;
    }
    Ok(())
}

pub async fn credentials(pool: &PgPool) -> R<Credentials> {
    let row: Option<(String, String, String)> = sqlx::query_as(r#"SELECT educations, certifications, languages FROM "Profile" WHERE id IN ('profile-vi', 'profile') ORDER BY (id = 'profile-vi') DESC LIMIT 1"#)
        .fetch_optional(pool).await.map_err(db_err)?;
    let (educations, certifications, languages) = row.unwrap_or_default();
    Ok(Credentials { educations: json_items(&educations), certifications: json_items(&certifications), languages: json_items(&languages) })
}

/// Education, certifications and languages are shared, so every profile row gets the same lists (as before).
pub async fn save_credentials(pool: &PgPool, input: Credentials) -> R<Credentials> {
    if input.educations.len() > 50 || input.certifications.len() > 100 || input.languages.len() > 50 { return Err("Danh sách quá dài.".into()); }
    if input.educations.iter().any(|e| !e.logo.trim().is_empty() && safe_image(&e.logo).is_empty()) { return Err("Logo phải là ảnh trên Cloudinary.".into()); }
    let educations: Vec<EducationItem> = input.educations.iter().map(|e| EducationItem {
        degree: locale_text(&e.degree, 300), school: locale_text(&e.school, 300), period: clip(&e.period, 100), detail: locale_text(&e.detail, 2000), logo: e.logo.trim().to_string(),
    }).collect();
    let certifications: Vec<CertificationItem> = input.certifications.iter().map(|c| CertificationItem { name: clip(&c.name, 300), issuer: clip(&c.issuer, 300), year: clip(&c.year, 40), enabled: c.enabled }).collect();
    let languages: Vec<LanguageItem> = input.languages.iter().map(|l| LanguageItem { name: locale_text(&l.name, 120), level: locale_text(&l.level, 120), enabled: l.enabled }).collect();
    let (e, c, l) = (to_json(&educations), to_json(&certifications), to_json(&languages));
    sqlx::query(r#"UPDATE "Profile" SET educations = $1, certifications = $2, languages = $3, "updatedAt" = NOW() WHERE id IN ('profile-vi', 'profile-en', 'profile')"#)
        .bind(e).bind(c).bind(l).execute(pool).await.map_err(db_err)?;
    log_activity(pool, "content", "update", "Cập nhật học vấn & chứng chỉ", &format!("{} học vấn · {} chứng chỉ · {} ngôn ngữ", educations.len(), certifications.len(), languages.len()), "profile", "success").await;
    credentials(pool).await
}

fn to_json<T: serde::Serialize>(items: &[T]) -> String { serde_json::to_string(items).unwrap_or_else(|_| "[]".into()) }

#[derive(FromRow)]
struct ExperienceRow {
    id: String, locale: String, role: String, company: String, #[sqlx(rename = "companyUrl")] company_url: Option<String>, period: String,
    location: String, description: String, highlights: String, stack: String, images: String, order: i32,
}

impl ExperienceRow {
    fn admin(self) -> AdminExperience {
        AdminExperience {
            id: self.id, locale: self.locale, role: self.role, company: self.company, company_url: self.company_url.unwrap_or_default(), period: self.period,
            location: self.location, description: self.description, highlights: string_list(&self.highlights), stack: string_list(&self.stack), images: string_list(&self.images), order: self.order,
        }
    }
}

const EXPERIENCE_COLUMNS: &str = r#"id, locale, role, company, "companyUrl", period, location, description, highlights, stack, images, "order""#;

pub async fn experiences(pool: &PgPool, locale: &str) -> R<Vec<AdminExperience>> {
    let sql = format!(r#"SELECT {EXPERIENCE_COLUMNS} FROM "Experience" WHERE locale = $1 ORDER BY "order" ASC, "createdAt" ASC"#);
    let rows = sqlx::query_as::<_, ExperienceRow>(sqlx::AssertSqlSafe(sql)).bind(locale_of(locale)).fetch_all(pool).await.map_err(db_err)?;
    Ok(rows.into_iter().map(ExperienceRow::admin).collect())
}

pub async fn experience(pool: &PgPool, id: &str) -> R<Option<AdminExperience>> {
    let sql = format!(r#"SELECT {EXPERIENCE_COLUMNS} FROM "Experience" WHERE id = $1"#);
    let row = sqlx::query_as::<_, ExperienceRow>(sqlx::AssertSqlSafe(sql)).bind(id).fetch_optional(pool).await.map_err(db_err)?;
    Ok(row.map(ExperienceRow::admin))
}

fn clean_list(items: &[String], max_items: usize) -> Vec<String> {
    items.iter().map(|i| clip(i, 500)).filter(|i| !i.is_empty()).take(max_items).collect()
}

/// Same rules as `/api/admin/experiences`: role and company required, same length limits.
/// Images removed from an entry stay in the media library, where unused ones can be deleted.
pub async fn save_experience(pool: &PgPool, input: AdminExperience) -> R<AdminExperience> {
    if input.role.trim().is_empty() || input.company.trim().is_empty() { return Err("Vị trí và công ty là bắt buộc.".into()); }
    if scriptable(&input.company_url) { return Err("Website công ty không hợp lệ.".into()); }
    if input.images.iter().any(|i| safe_image(i).is_empty()) { return Err("Ảnh phải nằm trên Cloudinary.".into()); }
    let company_url = Some(clip(&input.company_url, 500)).filter(|u| !u.is_empty());
    let highlights = serde_json::to_string(&clean_list(&input.highlights, 50)).map_err(|e| e.to_string())?;
    let stack = serde_json::to_string(&clean_list(&input.stack, 50)).map_err(|e| e.to_string())?;
    let images = serde_json::to_string(&clean_list(&input.images, 30)).map_err(|e| e.to_string())?;
    let (role, company, period, location, description) = (clip(&input.role, 300), clip(&input.company, 300), clip(&input.period, 100), clip(&input.location, 200), clip(&input.description, 4000));
    let id = if input.id.is_empty() {
        let locale = locale_of(&input.locale);
        let count: i64 = sqlx::query_scalar(r#"SELECT COUNT(*) FROM "Experience" WHERE locale = $1"#).bind(locale).fetch_one(pool).await.map_err(db_err)?;
        let id = new_id();
        sqlx::query(r#"INSERT INTO "Experience" (id, locale, role, company, "companyUrl", period, location, description, highlights, stack, images, "order", "createdAt", "updatedAt")
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())"#)
            .bind(&id).bind(locale).bind(&role).bind(&company).bind(&company_url).bind(&period).bind(&location).bind(&description)
            .bind(&highlights).bind(&stack).bind(&images).bind(count as i32).execute(pool).await.map_err(db_err)?;
        log_activity(pool, "content", "create", "Thêm kinh nghiệm", &format!("{role} · {company}"), &id, "success").await;
        id
    } else {
        let update = sqlx::query(r#"UPDATE "Experience" SET role = $2, company = $3, "companyUrl" = $4, period = $5, location = $6, description = $7, highlights = $8, stack = $9, images = $10, "updatedAt" = NOW() WHERE id = $1"#)
            .bind(&input.id).bind(&role).bind(&company).bind(&company_url).bind(&period).bind(&location).bind(&description).bind(&highlights).bind(&stack).bind(&images)
            .execute(pool).await.map_err(db_err)?;
        if update.rows_affected() == 0 { return Err("Không tìm thấy kinh nghiệm.".into()); }
        log_activity(pool, "content", "update", "Cập nhật kinh nghiệm", &format!("{role} · {company}"), &input.id, "success").await;
        input.id.clone()
    };
    experience(pool, &id).await?.ok_or_else(|| "Không tìm thấy kinh nghiệm.".into())
}

pub async fn delete_experience(pool: &PgPool, id: &str) -> R<()> {
    let row: Option<(String, String)> = sqlx::query_as(r#"DELETE FROM "Experience" WHERE id = $1 RETURNING role, company"#).bind(id).fetch_optional(pool).await.map_err(db_err)?;
    let Some((role, company)) = row else { return Err("Không tìm thấy kinh nghiệm.".into()) };
    log_activity(pool, "content", "delete", "Xóa kinh nghiệm", &format!("{role} · {company}"), id, "warning").await;
    Ok(())
}

pub async fn move_experience(pool: &PgPool, id: &str, up: bool) -> R<()> {
    let rows: Vec<(String,)> = sqlx::query_as(r#"SELECT id FROM "Experience" WHERE locale = (SELECT locale FROM "Experience" WHERE id = $1) ORDER BY "order" ASC, "createdAt" ASC"#)
        .bind(id).fetch_all(pool).await.map_err(db_err)?;
    let Some(i) = rows.iter().position(|r| r.0 == id) else { return Err("Không tìm thấy kinh nghiệm.".into()) };
    let j = if up { i.checked_sub(1) } else { (i + 1 < rows.len()).then_some(i + 1) };
    let Some(j) = j else { return Ok(()) };
    let mut tx = pool.begin().await.map_err(db_err)?;
    for (pos, row) in rows.iter().enumerate() {
        let target = if pos == i { j } else if pos == j { i } else { pos };
        sqlx::query(r#"UPDATE "Experience" SET "order" = $2 WHERE id = $1"#).bind(&row.0).bind(target as i32).execute(&mut *tx).await.map_err(db_err)?;
    }
    tx.commit().await.map_err(db_err)?;
    Ok(())
}

/// Which projects/posts reference each media URL (by Cloudinary public id).
pub async fn media_usage(pool: &PgPool) -> R<Vec<(String, String)>> {
    let projects: Vec<(String, String, String)> = sqlx::query_as(r#"SELECT title, image, images FROM "Project""#).fetch_all(pool).await.map_err(db_err)?;
    let posts: Vec<(String, Option<String>, String)> = sqlx::query_as(r#"SELECT title, "coverImage", content FROM "Post""#).fetch_all(pool).await.map_err(db_err)?;
    let profiles: Vec<(String, String, String, String)> = sqlx::query_as(r#"SELECT id, avatar, educations, settings FROM "Profile""#).fetch_all(pool).await.map_err(db_err)?;
    let experiences: Vec<(String, String, String)> = sqlx::query_as(r#"SELECT role, company, images FROM "Experience""#).fetch_all(pool).await.map_err(db_err)?;
    let mut out = Vec::new();
    for (id, avatar, educations, settings) in profiles { out.push((format!("Hồ sơ ({id})"), format!("{avatar} {educations} {settings}"))); }
    for (role, company, images) in experiences { out.push((format!("Kinh nghiệm: {role} · {company}"), images)); }
    for (title, image, images) in projects { out.push((title, format!("{image} {images}"))); }
    for (title, cover, content) in posts { out.push((title, format!("{} {content}", cover.unwrap_or_default()))); }
    Ok(out)
}

#[cfg(test)]
mod tests {
    #[test]
    fn refuses_script_links_and_keeps_good_list_items() {
        assert!(super::scriptable(" JavaScript:alert(1)") && super::scriptable("java\tscript:x") && super::scriptable("data:text/html,x"));
        assert!(!super::scriptable("https://github.com/minhtenlado") && !super::scriptable("www.linkedin.com/in/văn-đô"));
        let items: Vec<crate::model::CertificationItem> = super::json_items(r#"[{"name":"A","issuer":"B","year":"2024"},{"name":3},{"name":"C","enabled":false}]"#);
        assert_eq!(items.len(), 2);
        assert!(items[0].enabled && !items[1].enabled);
        let socials: Vec<crate::model::SocialLink> = super::json_items("not json");
        assert!(socials.is_empty());
    }

    #[test]
    fn slugs_match_previous_rules() {
        assert_eq!(super::slugify("Lượng tử hóa mô hình AI để tối ưu!"), "luong-tu-hoa-mo-hinh-ai-de-toi-uu");
        assert_eq!(super::slugify("  Đường đi  "), "duong-di");
    }
}
