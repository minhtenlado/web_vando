//! REST endpoints kept compatible with the previous public API.
use crate::model::Locale;
use crate::server::{db, github, interact, interact::Failure, state::{client_ip, AppState}};
use axum::{
    extract::{ConnectInfo, Path, Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::net::SocketAddr;

fn fail(failure: Failure) -> Response {
    let status = StatusCode::from_u16(failure.status()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
    let mut body = json!({ "ok": false, "message": failure.message() });
    if let Failure::Invalid(_, Some(errors)) = &failure { body["errors"] = errors.clone(); }
    let mut response = (status, Json(body)).into_response();
    if status == StatusCode::TOO_MANY_REQUESTS {
        response.headers_mut().insert(header::RETRY_AFTER, "60".parse().expect("header"));
    }
    response
}

fn no_store(mut response: Response) -> Response {
    response.headers_mut().insert(header::CACHE_CONTROL, "no-store".parse().expect("header"));
    response
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api", get(|| async { Json(json!({ "message": "Engineering Lab API" })) }))
        .route("/api/health", get(health))
        .route("/api/github", get(github_repos))
        .route("/api/site-data", get(site_data))
        .route("/api/contact", post(contact))
        .route("/api/posts/{slug}/comments", get(list_comments).post(post_comment))
        .route("/api/posts/{slug}/stats", post(post_stats))
        .route("/api/admin/upload-image", post(upload_image))
        .route("/api/admin/upload-file", post(upload_file))
        .route("/robots.txt", get(robots))
        .route("/sitemap.xml", get(sitemap))
}

async fn health(State(state): State<AppState>) -> Response {
    match sqlx::query_scalar::<_, i32>("SELECT 1").fetch_one(&state.pool).await {
        Ok(_) => Json(json!({ "ok": true, "database": "up" })).into_response(),
        Err(_) => (StatusCode::SERVICE_UNAVAILABLE, Json(json!({ "ok": false, "database": "down" }))).into_response(),
    }
}

async fn github_repos(State(state): State<AppState>) -> Response {
    let settings = match db::site_settings(&state.pool, Locale::Vi).await { Ok(s) => s, Err(_) => return no_store((StatusCode::SERVICE_UNAVAILABLE, Json(json!({ "ok": false, "repos": [] }))).into_response()) };
    let Some(user) = settings.github_url.as_deref().and_then(github::username) else {
        return no_store((StatusCode::NOT_FOUND, Json(json!({ "ok": false, "repos": [] }))).into_response());
    };
    let profile = format!("https://github.com/{user}");
    match github::repos(&state, &user).await {
        Ok(repos) => {
            let mut response = Json(json!({ "ok": true, "username": user, "profileUrl": profile, "repos": repos })).into_response();
            response.headers_mut().insert(header::CACHE_CONTROL, "public, s-maxage=3600, stale-while-revalidate=86400".parse().expect("header"));
            response
        }
        Err(error) => {
            tracing::error!("[github] repositories unavailable ({error})");
            no_store((StatusCode::BAD_GATEWAY, Json(json!({ "ok": false, "username": user, "profileUrl": profile, "repos": [] }))).into_response())
        }
    }
}

#[derive(Deserialize)]
struct LocaleQuery { locale: Option<String> }

async fn site_data(State(state): State<AppState>, Query(query): Query<LocaleQuery>) -> Response {
    let locale = Locale::from_code(query.locale.as_deref().unwrap_or("vi"));
    let result = tokio::try_join!(db::published_projects(&state.pool, locale), db::published_posts(&state.pool, locale), db::site_settings(&state.pool, locale));
    match result {
        Ok((projects, posts, settings)) => no_store(Json(json!({
            "source": "database",
            "profile": { "email": settings.email, "github": settings.github_url },
            "settings": settings,
            "projects": projects.iter().map(|p| p.detail()).collect::<Vec<_>>(),
            "posts": posts,
            "errors": {},
        })).into_response()),
        Err(error) => {
            tracing::error!("[content] site-data unavailable ({error})");
            no_store((StatusCode::SERVICE_UNAVAILABLE, Json(json!({ "errors": { "projects": "unavailable", "posts": "unavailable", "settings": "unavailable" } }))).into_response())
        }
    }
}

#[derive(Deserialize)]
struct ContactBody { name: Option<String>, email: Option<String>, topic: Option<String>, message: Option<String> }

async fn contact(State(state): State<AppState>, headers: HeaderMap, ConnectInfo(addr): ConnectInfo<SocketAddr>, body: Option<Json<ContactBody>>) -> Response {
    let ip = client_ip(&headers, Some(addr));
    if !state.limits.contact.allow(&ip) {
        return fail(Failure::TooMany("Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút.".into()));
    }
    let Some(Json(body)) = body else { return fail(Failure::BadRequest("Body không hợp lệ.".into())) };
    match interact::submit_contact(&state.pool, &state.http, &ip, body.name.as_deref().unwrap_or(""), body.email.as_deref().unwrap_or(""), body.topic.as_deref().unwrap_or(""), body.message.as_deref().unwrap_or("")).await {
        Ok(receipt) => Json(json!({
            "ok": true,
            "ticket": receipt.ticket,
            "message": format!("Cảm ơn {}! Tôi đã nhận được tin nhắn của bạn (mã {}) và sẽ phản hồi sớm nhất có thể.", receipt.name, receipt.ticket),
        })).into_response(),
        Err(failure) => fail(failure),
    }
}

async fn list_comments(State(state): State<AppState>, Path(slug): Path<String>) -> Response {
    match interact::list_comments(&state.pool, &slug).await {
        Ok(comments) => no_store(Json(json!({ "ok": true, "comments": comments })).into_response()),
        Err(failure) => fail(failure),
    }
}

async fn post_comment(State(state): State<AppState>, Path(slug): Path<String>, headers: HeaderMap, ConnectInfo(addr): ConnectInfo<SocketAddr>, body: Option<Json<Value>>) -> Response {
    let Some(Json(Value::Object(input))) = body else { return fail(Failure::BadRequest("Body không hợp lệ.".into())) };
    let action = input.get("action").and_then(Value::as_str).unwrap_or("create");
    if !["create", "like", "unlike"].contains(&action) { return fail(Failure::Invalid("Action không hợp lệ.".into(), None)); }
    if !state.limits.comments.allow(&client_ip(&headers, Some(addr))) {
        return fail(Failure::TooMany("Bạn đang thao tác quá nhanh. Vui lòng thử lại sau 1 phút.".into()));
    }
    if action != "create" {
        let Some(id) = input.get("commentId").and_then(Value::as_str).filter(|s| !s.is_empty()) else { return fail(Failure::Invalid("Thiếu ID bình luận.".into(), None)) };
        return match interact::like_comment(&state.pool, &slug, id, action == "like").await {
            Ok(likes) => Json(json!({ "ok": true, "likes": likes, "commentId": id })).into_response(),
            Err(failure) => fail(failure),
        };
    }
    let content = input.get("content").and_then(Value::as_str);
    let author = input.get("author");
    let anonymous = input.get("isAnonymous");
    let parent = input.get("parentId");
    if content.is_none() || author.is_some_and(|a| !a.is_string()) || anonymous.is_some_and(|a| !a.is_boolean()) || parent.is_some_and(|p| !p.is_null() && !p.is_string()) {
        return fail(Failure::Invalid("Dữ liệu bình luận không hợp lệ.".into(), None));
    }
    match interact::create_comment(&state.pool, &slug, content.unwrap_or(""), author.and_then(Value::as_str), anonymous.and_then(Value::as_bool).unwrap_or(false), parent.and_then(Value::as_str)).await {
        Ok(comment) => (StatusCode::CREATED, Json(json!({ "ok": true, "comment": comment }))).into_response(),
        Err(failure) => fail(failure),
    }
}

async fn post_stats(State(state): State<AppState>, Path(slug): Path<String>, headers: HeaderMap, ConnectInfo(addr): ConnectInfo<SocketAddr>, body: Option<Json<Value>>) -> Response {
    if !state.limits.stats.allow(&client_ip(&headers, Some(addr))) {
        return fail(Failure::TooMany("Too many requests".into()));
    }
    let action = body.as_ref().and_then(|Json(v)| v.get("action")).and_then(Value::as_str).unwrap_or("");
    match interact::post_stat(&state.pool, &slug, action).await {
        Ok(stats) => Json(json!({ "success": true, "views": stats.views, "likes": stats.likes, "bookmarks": stats.bookmarks })).into_response(),
        Err(Failure::BadRequest(_)) => (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid action" }))).into_response(),
        Err(Failure::NotFound(_)) => (StatusCode::NOT_FOUND, Json(json!({ "error": "Post not found" }))).into_response(),
        Err(failure) => fail(failure),
    }
}

fn image_kind(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(&[0x89, b'P', b'N', b'G']) { Some("png") }
    else if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) { Some("jpg") }
    else if bytes.starts_with(b"GIF8") { Some("gif") }
    else if bytes.len() > 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" { Some("webp") }
    else { None }
}

async fn read_file(mut multipart: axum::extract::Multipart, max: usize) -> Result<(Vec<u8>, String), Failure> {
    while let Ok(Some(field)) = multipart.next_field().await {
        if field.name() != Some("file") { continue; }
        let name = field.file_name().unwrap_or("upload").chars().filter(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_')).take(80).collect::<String>();
        let bytes = field.bytes().await.map_err(|_| Failure::Invalid("File quá lớn hoặc không đọc được.".into(), None))?;
        if bytes.len() > max { return Err(Failure::Invalid(format!("File quá lớn (tối đa {}MB).", max / 1024 / 1024), None)); }
        return Ok((bytes.to_vec(), if name.is_empty() { "upload".into() } else { name }));
    }
    Err(Failure::Invalid("Thiếu file.".into(), None))
}

async fn upload_image(State(state): State<AppState>, headers: HeaderMap, multipart: axum::extract::Multipart) -> Response {
    if !crate::server::auth::is_authed(&state.pool, &headers).await { return (StatusCode::UNAUTHORIZED, Json(json!({ "ok": false, "message": "Unauthorized" }))).into_response(); }
    let (bytes, name) = match read_file(multipart, 5 * 1024 * 1024).await { Ok(f) => f, Err(f) => return fail(f) };
    if image_kind(&bytes).is_none() { return fail(Failure::Invalid("Định dạng ảnh không hợp lệ. Chỉ hỗ trợ PNG, JPEG, WebP và GIF.".into(), None)); }
    match crate::server::cloudinary::upload(&state.http, bytes, &name, "web_vando/images", "image").await {
        Ok(url) => {
            crate::server::auth::log_activity(&state.pool, "media", "create", "Tải ảnh lên", &name, &url, "success").await;
            Json(json!({ "ok": true, "url": url })).into_response()
        }
        Err(error) => { tracing::error!("[upload] {error}"); fail(Failure::Unavailable("Không thể tải ảnh lên bộ lưu trữ. Vui lòng thử lại.".into())) }
    }
}

async fn upload_file(State(state): State<AppState>, headers: HeaderMap, multipart: axum::extract::Multipart) -> Response {
    if !crate::server::auth::is_authed(&state.pool, &headers).await { return (StatusCode::UNAUTHORIZED, Json(json!({ "ok": false, "message": "Unauthorized" }))).into_response(); }
    let (bytes, name) = match read_file(multipart, 20 * 1024 * 1024).await { Ok(f) => f, Err(f) => return fail(f) };
    if !bytes.starts_with(b"%PDF") { return fail(Failure::Invalid("Chỉ hỗ trợ tệp PDF.".into(), None)); }
    match crate::server::cloudinary::upload(&state.http, bytes, &name, "web_vando/files", "raw").await {
        Ok(url) => Json(json!({ "ok": true, "url": url })).into_response(),
        Err(error) => { tracing::error!("[upload] {error}"); fail(Failure::Unavailable("Không thể tải tệp lên. Vui lòng thử lại.".into())) }
    }
}

const SITE: &str = "https://phanhuynh.id.vn";

async fn robots() -> Response {
    ([(header::CONTENT_TYPE, "text/plain; charset=utf-8")], format!("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")).into_response()
}

async fn sitemap(State(state): State<AppState>) -> Response {
    let result = tokio::try_join!(db::published_projects(&state.pool, Locale::Vi), db::published_posts(&state.pool, Locale::Vi));
    let Ok((projects, posts)) = result else { return StatusCode::SERVICE_UNAVAILABLE.into_response() };
    let mut xml = String::from(r#"<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">"#);
    for (path, priority) in [("/", "1.0"), ("/projects", "0.9"), ("/hardware-lab", "0.8"), ("/notes", "0.8"), ("/privacy", "0.3"), ("/terms", "0.3")] {
        xml.push_str(&format!("<url><loc>{SITE}{path}</loc><priority>{priority}</priority></url>"));
    }
    for project in &projects {
        xml.push_str(&format!("<url><loc>{SITE}/projects/{}</loc><lastmod>{}</lastmod><priority>0.8</priority></url>", project.id, db::iso(project.updated_at)));
    }
    for post in &posts {
        xml.push_str(&format!("<url><loc>{SITE}/posts/{}</loc><lastmod>{}</lastmod><priority>0.7</priority></url>", post.slug, post.created_at));
    }
    xml.push_str("</urlset>");
    ([(header::CONTENT_TYPE, "application/xml; charset=utf-8")], xml).into_response()
}
