//! Public write paths, ported from the Next.js route handlers with the same validation and limits.
use crate::model::CommentView;
use crate::server::db::iso;
use chrono::NaiveDateTime;
use sqlx::{FromRow, PgPool};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

#[derive(Debug)]
pub enum Failure {
    BadRequest(String),
    NotFound(String),
    Invalid(String, Option<serde_json::Value>),
    TooMany(String),
    Unavailable(String),
}

impl Failure {
    pub fn status(&self) -> u16 {
        match self {
            Failure::BadRequest(_) => 400,
            Failure::NotFound(_) => 404,
            Failure::Invalid(..) => 422,
            Failure::TooMany(_) => 429,
            Failure::Unavailable(_) => 503,
        }
    }
    pub fn message(&self) -> &str {
        match self {
            Failure::BadRequest(m) | Failure::NotFound(m) | Failure::Invalid(m, _) | Failure::TooMany(m) | Failure::Unavailable(m) => m,
        }
    }
}

/// Fixed-window limiter keyed by client IP (best effort, per process — same as the previous in-memory maps).
pub struct RateLimiter {
    window: Duration,
    max: u32,
    hits: Mutex<HashMap<String, (Instant, u32)>>,
}

impl RateLimiter {
    pub fn new(max: u32, window: Duration) -> Self {
        Self { window, max, hits: Mutex::new(HashMap::new()) }
    }
    pub fn allow(&self, key: &str) -> bool {
        let mut hits = self.hits.lock().expect("rate limiter lock");
        let now = Instant::now();
        hits.retain(|_, (start, _)| now.duration_since(*start) < self.window);
        let entry = hits.entry(key.to_string()).or_insert((now, 0));
        entry.1 += 1;
        entry.1 <= self.max
    }
}

pub fn new_id() -> String {
    use rand::Rng;
    const ALPHABET: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut rng = rand::thread_rng();
    let millis = chrono::Utc::now().timestamp_millis().max(0) as u64;
    let mut stamp = String::new();
    let mut n = millis;
    while n > 0 { stamp.insert(0, ALPHABET[(n % 36) as usize] as char); n /= 36; }
    let random: String = (0..16).map(|_| ALPHABET[rng.gen_range(0..36)] as char).collect();
    format!("c{stamp}{random}").chars().take(25).collect()
}

fn strip_tags(value: &str) -> String {
    let mut out = String::new();
    let mut in_tag = false;
    for ch in value.chars() {
        match ch { '<' => in_tag = true, '>' if in_tag => in_tag = false, _ if !in_tag => out.push(ch), _ => {} }
    }
    out.trim().to_string()
}

async fn published(pool: &PgPool, slug: &str) -> Result<bool, Failure> {
    sqlx::query_scalar::<_, String>(r#"SELECT id FROM "Post" WHERE slug = $1 AND published = true LIMIT 1"#)
        .bind(slug)
        .fetch_optional(pool)
        .await
        .map(|row| row.is_some())
        .map_err(|_| Failure::Unavailable("Không tải được dữ liệu. Vui lòng thử lại.".into()))
}

#[derive(FromRow)]
struct CommentRow {
    id: String,
    #[sqlx(rename = "parentId")]
    parent_id: Option<String>,
    author: String,
    #[sqlx(rename = "isAnonymous")]
    is_anonymous: bool,
    #[sqlx(rename = "isAuthor")]
    is_author: bool,
    #[sqlx(rename = "avatarColor")]
    avatar_color: String,
    content: String,
    likes: i32,
    #[sqlx(rename = "createdAt")]
    created_at: NaiveDateTime,
}

impl From<CommentRow> for CommentView {
    fn from(row: CommentRow) -> Self {
        CommentView {
            id: row.id,
            parent_id: row.parent_id,
            author: row.author,
            is_anonymous: row.is_anonymous,
            is_author: row.is_author,
            avatar_color: row.avatar_color,
            content: row.content,
            likes: row.likes.max(0),
            created_at: iso(row.created_at),
        }
    }
}

const COMMENT_COLUMNS: &str = r#"id, "parentId", author, "isAnonymous", "isAuthor", "avatarColor", content, likes, "createdAt""#;

pub async fn list_comments(pool: &PgPool, slug: &str) -> Result<Vec<CommentView>, Failure> {
    if !published(pool, slug).await? { return Err(Failure::NotFound("Không tìm thấy bài viết hoặc bình luận.".into())); }
    let rows = sqlx::query_as::<_, CommentRow>(sqlx::AssertSqlSafe(format!(r#"SELECT {COMMENT_COLUMNS} FROM "Comment" WHERE "postSlug" = $1 ORDER BY "createdAt" DESC LIMIT 200"#)))
        .bind(slug)
        .fetch_all(pool)
        .await
        .map_err(|_| Failure::Unavailable("Không tải được bình luận. Vui lòng thử lại.".into()))?;
    Ok(rows.into_iter().map(Into::into).collect())
}

pub async fn create_comment(pool: &PgPool, slug: &str, content: &str, author: Option<&str>, anonymous: bool, parent_id: Option<&str>) -> Result<CommentView, Failure> {
    if !published(pool, slug).await? { return Err(Failure::NotFound("Không tìm thấy bài viết hoặc bình luận.".into())); }
    let content = strip_tags(content);
    let length = content.chars().count();
    if !(2..=1000).contains(&length) {
        return Err(Failure::Invalid("Nội dung bình luận cần từ 2 đến 1000 ký tự.".into(), None));
    }
    let parent_id = parent_id.filter(|p| !p.is_empty());
    if let Some(parent) = parent_id {
        let exists = sqlx::query_scalar::<_, String>(r#"SELECT id FROM "Comment" WHERE id = $1 AND "postSlug" = $2"#)
            .bind(parent).bind(slug).fetch_optional(pool).await
            .map_err(|_| Failure::Unavailable("Không thể lưu bình luận lúc này. Vui lòng thử lại.".into()))?;
        if exists.is_none() { return Err(Failure::Invalid("Bình luận được trả lời không thuộc bài viết này.".into(), None)); }
    }
    let author: String = author.map(strip_tags).unwrap_or_default().chars().take(50).collect();
    let anonymous = anonymous || author.is_empty();
    let row = sqlx::query_as::<_, CommentRow>(sqlx::AssertSqlSafe(format!(
        r#"INSERT INTO "Comment" (id, "postSlug", "parentId", author, "isAnonymous", "isAuthor", "avatarUrl", content, "avatarColor", likes)
           VALUES ($1, $2, $3, $4, $5, false, NULL, $6, 'slate', 0) RETURNING {COMMENT_COLUMNS}"#
    )))
    .bind(new_id())
    .bind(slug)
    .bind(parent_id)
    .bind(if anonymous { "Người đọc ẩn danh".to_string() } else { author })
    .bind(anonymous)
    .bind(&content)
    .fetch_one(pool)
    .await
    .map_err(|_| Failure::Unavailable("Không thể lưu bình luận lúc này. Vui lòng thử lại.".into()))?;
    Ok(row.into())
}

pub async fn like_comment(pool: &PgPool, slug: &str, comment_id: &str, like: bool) -> Result<i32, Failure> {
    if !published(pool, slug).await? { return Err(Failure::NotFound("Không tìm thấy bài viết hoặc bình luận.".into())); }
    let query = if like {
        r#"UPDATE "Comment" SET likes = likes + 1 WHERE id = $1 AND "postSlug" = $2 RETURNING likes"#
    } else {
        r#"UPDATE "Comment" SET likes = likes - 1 WHERE id = $1 AND "postSlug" = $2 AND likes > 0 RETURNING likes"#
    };
    let updated = sqlx::query_scalar::<_, i32>(query).bind(comment_id).bind(slug).fetch_optional(pool).await
        .map_err(|_| Failure::Unavailable("Không thể cập nhật lúc này.".into()))?;
    match updated {
        Some(likes) => Ok(likes.max(0)),
        None => sqlx::query_scalar::<_, i32>(r#"SELECT likes FROM "Comment" WHERE id = $1 AND "postSlug" = $2"#)
            .bind(comment_id).bind(slug).fetch_optional(pool).await
            .map_err(|_| Failure::Unavailable("Không thể cập nhật lúc này.".into()))?
            .map(|likes| likes.max(0))
            .ok_or_else(|| Failure::NotFound("Không tìm thấy bài viết hoặc bình luận.".into())),
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default, PartialEq)]
pub struct PostStats {
    pub views: i32,
    pub likes: i32,
    pub bookmarks: i32,
}

pub async fn post_stat(pool: &PgPool, slug: &str, action: &str) -> Result<PostStats, Failure> {
    let update = match action {
        "view" => r#"views = views + 1"#,
        "like" => r#"likes = likes + 1"#,
        "unlike" => r#"likes = likes - 1"#,
        "bookmark" => r#"bookmarks = bookmarks + 1"#,
        "unbookmark" => r#"bookmarks = bookmarks - 1"#,
        _ => return Err(Failure::BadRequest("Invalid action".into())),
    };
    let guard = match action { "unlike" => " AND likes > 0", "unbookmark" => " AND bookmarks > 0", _ => "" };
    let found = published(pool, slug).await?;
    if !found { return Err(Failure::NotFound("Post not found".into())); }
    // `update` and `guard` come from the fixed match above, never from input.
    sqlx::query(sqlx::AssertSqlSafe(format!(r#"UPDATE "Post" SET {update} WHERE slug = $1 AND published = true{guard}"#)))
        .bind(slug).execute(pool).await.map_err(|_| Failure::Unavailable("Internal Server Error".into()))?;
    let (views, likes, bookmarks) = sqlx::query_as::<_, (i32, i32, i32)>(r#"SELECT views, likes, bookmarks FROM "Post" WHERE slug = $1 AND published = true ORDER BY "updatedAt" DESC LIMIT 1"#)
        .bind(slug).fetch_one(pool).await.map_err(|_| Failure::Unavailable("Internal Server Error".into()))?;
    Ok(PostStats { views, likes, bookmarks })
}

fn dangerous(value: &str) -> bool {
    let lower = value.to_ascii_lowercase();
    ["<script", "<iframe", "<object", "<embed", "<form", "<link", "<meta", "<style", "<svg", "<math", "<base", "javascript:"].iter().any(|p| lower.contains(p))
}

fn valid_email(value: &str) -> bool {
    let Some((local, domain)) = value.split_once('@') else { return false };
    !local.is_empty() && !local.contains(char::is_whitespace) && domain.contains('.') && !domain.starts_with('.') && !domain.ends_with('.') && !domain.contains(char::is_whitespace) && !domain.contains('@')
}

pub struct ContactReceipt {
    pub ticket: String,
    pub name: String,
}

pub async fn submit_contact(pool: &PgPool, http: &reqwest::Client, ip: &str, name: &str, email: &str, topic: &str, message: &str) -> Result<ContactReceipt, Failure> {
    let (name, email, topic, message) = (name.trim(), email.trim(), topic.trim(), message.trim());
    let mut errors = serde_json::Map::new();
    if name.chars().count() < 2 { errors.insert("name".into(), "Vui lòng nhập họ tên (tối thiểu 2 ký tự).".into()); }
    if !valid_email(email) { errors.insert("email".into(), "Địa chỉ email không hợp lệ.".into()); }
    if message.chars().count() < 10 { errors.insert("message".into(), "Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự).".into()); }
    if dangerous(name) { errors.insert("name".into(), "Dữ liệu không hợp lệ, vui lòng không nhập mã độc.".into()); }
    if dangerous(message) { errors.insert("message".into(), "Dữ liệu không hợp lệ, vui lòng không nhập mã độc.".into()); }
    if !errors.is_empty() {
        return Err(Failure::Invalid("Dữ liệu không hợp lệ.".into(), Some(serde_json::Value::Object(errors))));
    }
    let ticket = format!("ST-{}", radix36(chrono::Utc::now().timestamp_millis().max(0) as u64).to_uppercase());
    sqlx::query(r#"INSERT INTO "ContactMessage" (id, name, email, topic, message, ticket, ip) VALUES ($1, $2, $3, $4, $5, $6, $7)"#)
        .bind(new_id()).bind(name).bind(email).bind(topic).bind(message).bind(&ticket).bind(ip)
        .execute(pool).await
        .map_err(|_| Failure::Unavailable("Không thể gửi tin nhắn lúc này. Vui lòng thử lại.".into()))?;
    if let Ok(key) = std::env::var("WEB3FORMS_ACCESS_KEY") {
        if !key.trim().is_empty() {
            let subject = if topic.is_empty() { format!("[Studio] Tin nhắn mới từ {name}") } else { format!("[Studio] [{topic}] Tin nhắn mới từ {name}") };
            let body = serde_json::json!({ "access_key": key.trim(), "name": name, "email": email, "message": message, "subject": subject });
            if let Err(error) = http.post("https://api.web3forms.com/submit").json(&body).timeout(Duration::from_secs(8)).send().await {
                tracing::warn!("[web3forms] notification failed (non-critical): {error}");
            }
        }
    }
    Ok(ContactReceipt { ticket, name: name.to_string() })
}

fn radix36(mut n: u64) -> String {
    const ALPHABET: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut out = String::new();
    while n > 0 { out.insert(0, ALPHABET[(n % 36) as usize] as char); n /= 36; }
    if out.is_empty() { "0".into() } else { out }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ids_and_validation() {
        let id = new_id();
        assert_eq!(id.len(), 25);
        assert!(id.starts_with('c'));
        assert!(valid_email("a@b.co") && !valid_email("a@b") && !valid_email("a b@c.d"));
        assert!(dangerous("<script>x</script>") && !dangerous("Xin chào"));
        assert_eq!(strip_tags(" <b>hi</b> "), "hi");
        let limiter = RateLimiter::new(2, Duration::from_secs(60));
        assert!(limiter.allow("ip") && limiter.allow("ip") && !limiter.allow("ip"));
    }
}
