//! Server functions used by SSR pages and islands.
use crate::model::*;
use leptos::prelude::*;

#[cfg(feature = "ssr")]
fn internal<E: std::fmt::Display>(error: E) -> ServerFnError {
    tracing::error!("[content] {error}");
    ServerFnError::new("Nội dung tạm thời chưa tải được. / Content is temporarily unavailable.")
}

#[server(prefix = "/rpc", endpoint = "home")]
pub async fn get_home(locale: Locale) -> Result<HomeData, ServerFnError> {
    use crate::server::{db, state::app_state};
    let state = app_state()?;
    let (projects, posts, settings) = tokio::try_join!(
        db::published_projects(&state.pool, locale),
        db::published_posts(&state.pool, locale),
        db::site_settings(&state.pool, locale),
    )
    .map_err(internal)?;
    Ok(HomeData { settings, projects: projects.iter().map(|p| p.card()).collect(), posts })
}

#[server(prefix = "/rpc", endpoint = "project")]
pub async fn get_project(id: String, locale: Locale) -> Result<Option<(ProjectDetail, Vec<ProjectCard>, SiteSettings)>, ServerFnError> {
    use crate::server::{db, state::app_state};
    let state = app_state()?;
    let (row, all, settings) = tokio::try_join!(
        db::project_by_id(&state.pool, &id),
        db::published_projects(&state.pool, locale),
        db::site_settings(&state.pool, locale),
    )
    .map_err(internal)?;
    Ok(row.map(|row| (row.detail(), all.iter().map(|p| p.card()).collect(), settings)))
}

#[server(prefix = "/rpc", endpoint = "posts")]
pub async fn get_posts(locale: Locale) -> Result<(Vec<PostCard>, SiteSettings), ServerFnError> {
    use crate::server::{db, state::app_state};
    let state = app_state()?;
    let (posts, settings) = tokio::try_join!(db::published_posts(&state.pool, locale), db::site_settings(&state.pool, locale)).map_err(internal)?;
    Ok((posts, settings))
}

#[server(prefix = "/rpc", endpoint = "post")]
pub async fn get_post(slug: String, locale: Locale) -> Result<Option<(PostDetail, Vec<PostCard>, SiteSettings)>, ServerFnError> {
    use crate::server::{db, state::app_state};
    let state = app_state()?;
    let (post, posts, settings) = tokio::try_join!(
        db::post_by_slug(&state.pool, &slug, locale),
        db::published_posts(&state.pool, locale),
        db::site_settings(&state.pool, locale),
    )
    .map_err(internal)?;
    Ok(post.map(|post| (post, posts, settings)))
}

#[cfg(feature = "ssr")]
fn failure(f: crate::server::interact::Failure) -> ServerFnError {
    ServerFnError::new(f.message().to_string())
}

#[cfg(feature = "ssr")]
async fn caller_ip() -> String {
    let headers = leptos_axum::extract::<http::HeaderMap>().await.unwrap_or_default();
    let socket = leptos_axum::extract::<axum::extract::ConnectInfo<std::net::SocketAddr>>().await.ok().map(|c| c.0);
    crate::server::state::client_ip(&headers, socket)
}

/// Public repositories of the profile's GitHub account (cached for an hour on the server).
#[server(prefix = "/rpc", endpoint = "repos")]
pub async fn get_repos() -> Result<(String, Vec<GithubRepo>), ServerFnError> {
    use crate::server::{db, github, state::app_state};
    let state = app_state()?;
    let settings = db::site_settings(&state.pool, Locale::Vi).await.map_err(internal)?;
    let user = settings.github_url.as_deref().and_then(github::username).ok_or_else(|| ServerFnError::new("GitHub profile is not configured"))?;
    let repos = github::repos(&state, &user).await.map_err(|e| { tracing::error!("[github] {e}"); ServerFnError::new("GitHub is unavailable") })?;
    Ok((user, repos))
}

#[server(prefix = "/rpc", endpoint = "comments")]
pub async fn list_comments(slug: String) -> Result<Vec<CommentView>, ServerFnError> {
    let state = crate::server::state::app_state()?;
    crate::server::interact::list_comments(&state.pool, &slug).await.map_err(failure)
}

#[server(prefix = "/rpc", endpoint = "comment")]
pub async fn add_comment(slug: String, content: String, author: String, anonymous: bool, parent_id: Option<String>) -> Result<CommentView, ServerFnError> {
    let state = crate::server::state::app_state()?;
    if !state.limits.comments.allow(&caller_ip().await) {
        return Err(ServerFnError::new("Bạn đang thao tác quá nhanh. Vui lòng thử lại sau 1 phút."));
    }
    crate::server::interact::create_comment(&state.pool, &slug, &content, Some(&author), anonymous, parent_id.as_deref()).await.map_err(failure)
}

#[server(prefix = "/rpc", endpoint = "comment-like")]
pub async fn like_comment(slug: String, comment_id: String, like: bool) -> Result<i32, ServerFnError> {
    let state = crate::server::state::app_state()?;
    if !state.limits.comments.allow(&caller_ip().await) {
        return Err(ServerFnError::new("Bạn đang thao tác quá nhanh. Vui lòng thử lại sau 1 phút."));
    }
    crate::server::interact::like_comment(&state.pool, &slug, &comment_id, like).await.map_err(failure)
}

#[server(prefix = "/rpc", endpoint = "stat")]
pub async fn post_stat(slug: String, action: String) -> Result<(i32, i32, i32), ServerFnError> {
    let state = crate::server::state::app_state()?;
    if !state.limits.stats.allow(&caller_ip().await) {
        return Err(ServerFnError::new("Too many requests"));
    }
    let stats = crate::server::interact::post_stat(&state.pool, &slug, &action).await.map_err(failure)?;
    Ok((stats.views, stats.likes, stats.bookmarks))
}

/// Contact form. `website` is a honeypot field that humans never fill in.
#[server(prefix = "/rpc", endpoint = "contact")]
pub async fn send_contact(name: String, email: String, topic: String, message: String, website: String) -> Result<String, ServerFnError> {
    let state = crate::server::state::app_state()?;
    let ip = caller_ip().await;
    if !website.trim().is_empty() {
        return Ok("OK".into());
    }
    if !state.limits.contact.allow(&ip) {
        return Err(ServerFnError::new("Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút."));
    }
    match crate::server::interact::submit_contact(&state.pool, &state.http, &ip, &name, &email, &topic, &message).await {
        Ok(receipt) => Ok(receipt.ticket),
        Err(crate::server::interact::Failure::Invalid(_, Some(errors))) => {
            let first = errors.as_object().and_then(|o| o.values().next()).and_then(|v| v.as_str()).unwrap_or("Dữ liệu không hợp lệ.").to_string();
            Err(ServerFnError::new(first))
        }
        Err(f) => Err(failure(f)),
    }
}

/// Hardware Lab: full records of projects classified as PCB/hardware designs.
#[server(prefix = "/rpc", endpoint = "lab")]
pub async fn get_lab(locale: Locale) -> Result<(Vec<ProjectDetail>, SiteSettings), ServerFnError> {
    use crate::server::{db, state::app_state};
    let state = app_state()?;
    let (rows, settings) = tokio::try_join!(db::published_projects(&state.pool, locale), db::site_settings(&state.pool, locale)).map_err(internal)?;
    let boards = rows.iter().map(|row| row.detail()).filter(|p| p.domains.iter().any(|d| d == "pcb")).collect();
    Ok((boards, settings))
}
