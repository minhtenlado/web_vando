use crate::server::interact::RateLimiter;
use axum::extract::FromRef;
use leptos::config::LeptosOptions;
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;

pub struct Limits {
    pub contact: RateLimiter,
    pub comments: RateLimiter,
    pub stats: RateLimiter,
    pub login: RateLimiter,
}

impl Default for Limits {
    fn default() -> Self {
        Self {
            contact: RateLimiter::new(5, Duration::from_secs(60)),
            comments: RateLimiter::new(10, Duration::from_secs(60)),
            stats: RateLimiter::new(60, Duration::from_secs(60)),
            login: RateLimiter::new(5, Duration::from_secs(300)),
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub leptos_options: LeptosOptions,
    pub pool: PgPool,
    pub http: reqwest::Client,
    pub github: Arc<RwLock<crate::server::github::Cache>>,
    pub limits: Arc<Limits>,
}

impl FromRef<AppState> for LeptosOptions {
    fn from_ref(state: &AppState) -> Self {
        state.leptos_options.clone()
    }
}

/// Server state for server functions and SSR components.
pub fn app_state() -> Result<AppState, leptos::prelude::ServerFnError> {
    leptos::prelude::use_context::<AppState>().ok_or_else(|| leptos::prelude::ServerFnError::new("application state is unavailable"))
}

/// Client IP as seen through Vercel/Caddy proxies, falling back to the socket address.
pub fn client_ip(headers: &http::HeaderMap, socket: Option<std::net::SocketAddr>) -> String {
    headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .or_else(|| headers.get("x-real-ip").and_then(|v| v.to_str().ok()).map(str::to_string))
        .or_else(|| socket.map(|s| s.ip().to_string()))
        .unwrap_or_else(|| "unknown".into())
}
