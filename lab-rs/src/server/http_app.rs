use crate::app::{shell, App};
use crate::server::state::AppState;
use axum::Router;
use leptos::prelude::*;
use leptos_axum::{generate_route_list, LeptosRoutes};
use sqlx::postgres::PgPoolOptions;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower_http::compression::CompressionLayer;

pub async fn run() {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let _ = dotenvy::from_filename(".env");
    let _ = dotenvy::from_filename("../.env");
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,sqlx=warn".into()))
        .init();

    let conf = get_configuration(None).expect("leptos configuration");
    let leptos_options = conf.leptos_options;
    let addr = leptos_options.site_addr;
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(10))
        .connect_lazy(&database_url)
        .expect("valid DATABASE_URL");
    let http = reqwest::Client::builder().build().expect("http client");
    let state = AppState { leptos_options: leptos_options.clone(), pool, http, github: Arc::new(Default::default()) };

    let routes = generate_route_list(App);
    let app = Router::new()
        .leptos_routes_with_context(
            &state,
            routes,
            {
                let state = state.clone();
                move || provide_context(state.clone())
            },
            {
                let options = leptos_options.clone();
                move || shell(options.clone())
            },
        )
        .fallback(leptos_axum::file_and_error_handler::<AppState, _>(shell))
        .layer(CompressionLayer::new())
        .with_state(state);

    tracing::info!("listening on http://{addr}");
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind address");
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.expect("server");
}
