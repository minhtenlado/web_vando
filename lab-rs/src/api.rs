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
