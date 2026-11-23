use crate::app::{shell, App};
use crate::server::state::AppState;
use axum::{body::Body, http::{header, HeaderValue, Request}, middleware::{self, Next}, response::Response, Router};
use leptos::config::Env;
use leptos::prelude::*;
use leptos_axum::{generate_route_list, LeptosRoutes};
use sqlx::postgres::PgPoolOptions;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower_http::compression::CompressionLayer;

fn csp(dev: bool) -> String {
    [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://res.cloudinary.com https://*.public.blob.vercel-storage.com https://i.ytimg.com",
        "font-src 'self'",
        if dev { "connect-src 'self' ws://127.0.0.1:3101 ws://localhost:3101" } else { "connect-src 'self'" },
        "media-src 'self' https://res.cloudinary.com https://*.public.blob.vercel-storage.com",
        "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://codepen.io",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
    ]
    .join("; ")
}

async fn headers(request: Request<Body>, next: Next, dev: bool) -> Response {
    let path = request.uri().path().to_string();
    let mut response = next.run(request).await;
    let h = response.headers_mut();
    h.insert("x-content-type-options", HeaderValue::from_static("nosniff"));
    h.insert("x-frame-options", HeaderValue::from_static("SAMEORIGIN"));
    h.insert("referrer-policy", HeaderValue::from_static("strict-origin-when-cross-origin"));
    h.insert("permissions-policy", HeaderValue::from_static("camera=(), microphone=(), geolocation=()"));
    if !dev {
        h.insert("strict-transport-security", HeaderValue::from_static("max-age=31536000; includeSubDomains; preload"));
    }
    if let Ok(value) = HeaderValue::from_str(&csp(dev)) {
        h.insert("content-security-policy", value);
    }
    if !h.contains_key(header::CACHE_CONTROL) {
        // Asset names are stable, so browsers revalidate (cheap 304) instead of trusting a long max-age.
        let policy = if path.starts_with("/pkg/") {
            "public, no-cache"
        } else if path.starts_with("/vendor/") {
            "public, max-age=86400"
        } else if path.starts_with("/fonts/") || path == "/favicon.svg" {
            "public, max-age=2592000"
        } else if path.starts_with("/api/") || path.starts_with("/rpc/") || path.starts_with("/admin") {
            "no-store"
        } else {
            "public, max-age=0, s-maxage=60, stale-while-revalidate=600"
        };
        h.insert(header::CACHE_CONTROL, HeaderValue::from_static(policy));
    }
    response
}

pub async fn run() {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let _ = dotenvy::from_filename(".env");
    let _ = dotenvy::from_filename("../.env");
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,sqlx=warn".into()))
        .init();

    let conf = get_configuration(None).expect("leptos configuration");
    let leptos_options = conf.leptos_options;
    let dev = leptos_options.env == Env::DEV;
    let addr = std::env::var("PORT").ok().and_then(|p| p.parse::<u16>().ok()).map(|port| SocketAddr::from(([0, 0, 0, 0], port))).unwrap_or(leptos_options.site_addr);
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .min_connections(1)
        .acquire_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(300))
        .connect_lazy(&database_url)
        .expect("valid DATABASE_URL");
    let http = reqwest::Client::builder().timeout(Duration::from_secs(10)).build().expect("http client");
    let state = AppState { leptos_options: leptos_options.clone(), pool, http, github: Arc::new(Default::default()), limits: Arc::new(Default::default()) };

    let routes = generate_route_list(App);
    let app = Router::new()
        .merge(crate::server::rest::routes())
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
        .layer(middleware::from_fn(move |req, next| headers(req, next, dev)))
        .layer(CompressionLayer::new())
        .with_state(state);

    tracing::info!("listening on http://{addr}");
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind address");
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .with_graceful_shutdown(async { let _ = tokio::signal::ctrl_c().await; })
        .await
        .expect("server");
}
