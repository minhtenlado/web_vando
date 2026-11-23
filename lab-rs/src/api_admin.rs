//! Admin server functions. Every function except login checks the `admin_session` cookie.
use crate::model::*;
use leptos::prelude::*;

#[cfg(feature = "ssr")]
pub async fn require_admin() -> Result<crate::server::state::AppState, ServerFnError> {
    let state = crate::server::state::app_state()?;
    let headers = leptos_axum::extract::<http::HeaderMap>().await.unwrap_or_default();
    if crate::server::auth::is_authed(&state.pool, &headers).await {
        Ok(state)
    } else {
        if let Some(response) = use_context::<leptos_axum::ResponseOptions>() {
            response.set_status(http::StatusCode::UNAUTHORIZED);
        }
        Err(ServerFnError::new("UNAUTHORIZED"))
    }
}

#[cfg(feature = "ssr")]
fn fail(message: String) -> ServerFnError { ServerFnError::new(message) }

#[cfg(feature = "ssr")]
fn set_cookie(value: String) {
    if let (Some(response), Ok(value)) = (use_context::<leptos_axum::ResponseOptions>(), http::HeaderValue::from_str(&value)) {
        response.append_header(http::header::SET_COOKIE, value);
    }
}

#[cfg(feature = "ssr")]
async fn issue_session(pool: &sqlx::PgPool) -> Result<(), ServerFnError> {
    let v = crate::server::auth::session_version(pool).await.unwrap_or_default();
    let exp = chrono::Utc::now().timestamp_millis() + crate::server::auth::MAX_AGE_SECONDS * 1000;
    let token = crate::server::auth::sign(exp, &v).ok_or_else(|| ServerFnError::new("SESSION_SECRET is not configured"))?;
    set_cookie(crate::server::auth::session_cookie(&token));
    Ok(())
}

/// True when the request carries a valid admin session.
#[server(prefix = "/rpc/admin", endpoint = "session")]
pub async fn admin_session() -> Result<bool, ServerFnError> {
    let state = crate::server::state::app_state()?;
    let headers = leptos_axum::extract::<http::HeaderMap>().await.unwrap_or_default();
    Ok(crate::server::auth::is_authed(&state.pool, &headers).await)
}

#[server(prefix = "/rpc/admin", endpoint = "login")]
pub async fn admin_login(password: String) -> Result<(), ServerFnError> {
    use crate::server::auth::{log_activity, verify_password};
    let state = crate::server::state::app_state()?;
    let headers = leptos_axum::extract::<http::HeaderMap>().await.unwrap_or_default();
    let socket = leptos_axum::extract::<axum::extract::ConnectInfo<std::net::SocketAddr>>().await.ok().map(|c| c.0);
    let ip = crate::server::state::client_ip(&headers, socket);
    if let Some(seconds) = state.limits.login_guard.retry_after(&ip) {
        return Err(fail(format!("Quá nhiều lần thử. Vui lòng đợi {seconds} giây.")));
    }
    if password.is_empty() { return Err(fail("Vui lòng nhập mật khẩu.".into())); }
    tokio::time::sleep(std::time::Duration::from_millis(300)).await;
    if !verify_password(&state.pool, &password).await {
        state.limits.login_guard.fail(&ip);
        log_activity(&state.pool, "auth", "failed", "Đăng nhập thất bại", &format!("IP: {ip}"), "", "danger").await;
        return Err(fail("Mật khẩu không đúng.".into()));
    }
    state.limits.login_guard.clear(&ip);
    issue_session(&state.pool).await?;
    log_activity(&state.pool, "auth", "login", "Đăng nhập quản trị", &format!("IP: {ip}"), "", "success").await;
    Ok(())
}

#[server(prefix = "/rpc/admin", endpoint = "logout")]
pub async fn admin_logout() -> Result<(), ServerFnError> {
    set_cookie(crate::server::auth::clear_cookie());
    Ok(())
}

#[server(prefix = "/rpc/admin", endpoint = "stats")]
pub async fn admin_stats() -> Result<DashboardStats, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::stats(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "projects")]
pub async fn admin_projects() -> Result<Vec<AdminProject>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::projects(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "project")]
pub async fn admin_get_project(id: String) -> Result<Option<AdminProject>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::project(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "project-save", input = server_fn::codec::Json)]
pub async fn admin_save_project(project: AdminProject) -> Result<AdminProject, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::save_project(&state.pool, project).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "project-delete")]
pub async fn admin_delete_project(id: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::delete_project(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "project-move")]
pub async fn admin_move_project(id: String, up: bool) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::move_project(&state.pool, &id, up).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "posts")]
pub async fn admin_posts() -> Result<Vec<AdminPost>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::posts(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "post")]
pub async fn admin_get_post(id: String) -> Result<Option<AdminPost>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::post(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "post-save", input = server_fn::codec::Json)]
pub async fn admin_save_post(post: AdminPost) -> Result<AdminPost, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::save_post(&state.pool, post).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "post-delete")]
pub async fn admin_delete_post(id: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::delete_post(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "comments")]
pub async fn admin_comments() -> Result<Vec<AdminComment>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::comments(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "comment-reply")]
pub async fn admin_reply(slug: String, parent_id: Option<String>, content: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::reply_comment(&state.pool, &slug, parent_id, &content).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "comment-delete")]
pub async fn admin_delete_comment(id: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::delete_comment(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "messages")]
pub async fn admin_messages(filter: String) -> Result<Vec<AdminMessage>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::messages(&state.pool, &filter).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "message-flag")]
pub async fn admin_message_flag(id: String, field: String, value: bool) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::update_message(&state.pool, &id, &field, value).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "activities")]
pub async fn admin_activities() -> Result<Vec<Activity>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::activities(&state.pool, 200).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "activities-prune")]
pub async fn admin_prune_activities() -> Result<u64, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::prune_activities(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "content")]
pub async fn admin_content() -> Result<ContentSettings, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::content(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "content-save", input = server_fn::codec::Json)]
pub async fn admin_save_content(settings: ContentSettings) -> Result<ContentSettings, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::save_content(&state.pool, settings).await.map_err(fail)
}

/// Changes the password and re-issues this browser's session (other sessions are signed out).
#[server(prefix = "/rpc/admin", endpoint = "password")]
pub async fn admin_change_password(current: String, new: String, confirm: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::change_password(&state.pool, &current, &new, &confirm).await.map_err(fail)?;
    issue_session(&state.pool).await
}

#[server(prefix = "/rpc/admin", endpoint = "media")]
pub async fn admin_media(cursor: Option<String>) -> Result<(Vec<MediaItem>, Option<String>), ServerFnError> {
    let state = require_admin().await?;
    let (mut items, next) = crate::server::cloudinary::list(&state.http, "web_vando/", cursor).await.map_err(|e| { tracing::error!("[media] {e}"); fail("Không tải được thư viện ảnh từ Cloudinary.".into()) })?;
    let usage = crate::server::admin::media_usage(&state.pool).await.map_err(fail)?;
    for item in &mut items {
        item.used_by = usage.iter().filter(|(_, text)| text.contains(&item.public_id)).map(|(title, _)| title.clone()).collect();
    }
    Ok((items, next))
}

#[server(prefix = "/rpc/admin", endpoint = "media-delete")]
pub async fn admin_delete_media(public_id: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    let usage = crate::server::admin::media_usage(&state.pool).await.map_err(fail)?;
    if let Some((title, _)) = usage.iter().find(|(_, text)| text.contains(&public_id)) {
        return Err(fail(format!("Ảnh đang được dùng trong “{title}”. Gỡ ảnh khỏi nội dung trước khi xóa.")));
    }
    crate::server::cloudinary::destroy(&state.http, &public_id).await.map_err(|e| { tracing::error!("[media] {e}"); fail("Không xóa được ảnh trên Cloudinary.".into()) })?;
    crate::server::auth::log_activity(&state.pool, "media", "delete", "Xóa ảnh khỏi thư viện", &public_id, &public_id, "warning").await;
    Ok(())
}

#[server(prefix = "/rpc/admin", endpoint = "profile")]
pub async fn admin_profile(locale: String) -> Result<ProfileForm, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::profile(&state.pool, &locale).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "profile-save", input = server_fn::codec::Json)]
pub async fn admin_save_profile(profile: ProfileForm) -> Result<ProfileForm, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::save_profile(&state.pool, profile).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "credentials")]
pub async fn admin_credentials() -> Result<Credentials, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::credentials(&state.pool).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "credentials-save", input = server_fn::codec::Json)]
pub async fn admin_save_credentials(credentials: Credentials) -> Result<Credentials, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::save_credentials(&state.pool, credentials).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "experiences")]
pub async fn admin_experiences(locale: String) -> Result<Vec<AdminExperience>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::experiences(&state.pool, &locale).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "experience")]
pub async fn admin_get_experience(id: String) -> Result<Option<AdminExperience>, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::experience(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "experience-save", input = server_fn::codec::Json)]
pub async fn admin_save_experience(experience: AdminExperience) -> Result<AdminExperience, ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::save_experience(&state.pool, experience).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "experience-delete")]
pub async fn admin_delete_experience(id: String) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::delete_experience(&state.pool, &id).await.map_err(fail)
}

#[server(prefix = "/rpc/admin", endpoint = "experience-move")]
pub async fn admin_move_experience(id: String, up: bool) -> Result<(), ServerFnError> {
    let state = require_admin().await?;
    crate::server::admin::move_experience(&state.pool, &id, up).await.map_err(fail)
}
