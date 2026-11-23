use axum::extract::FromRef;
use leptos::config::LeptosOptions;
use sqlx::PgPool;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct AppState {
    pub leptos_options: LeptosOptions,
    pub pool: PgPool,
    pub http: reqwest::Client,
    pub github: Arc<RwLock<crate::server::github::Cache>>,
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
