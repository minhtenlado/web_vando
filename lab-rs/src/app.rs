use crate::model::Locale;
use leptos::prelude::*;
use leptos_meta::{provide_meta_context, MetaTags};
use leptos_router::{
    components::{Route, Router, Routes},
    path, SsrMode,
};

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="vi">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <AutoReload options=options.clone() />
                <HydrationScripts options islands=true />
                <MetaTags />
            </head>
            <body>
                <App />
            </body>
        </html>
    }
}

/// Locale from the `cv-locale` cookie shared with the previous site.
pub fn request_locale() -> Locale {
    #[cfg(feature = "ssr")]
    {
        if let Some(parts) = use_context::<http::request::Parts>() {
            if let Some(cookie) = parts.headers.get(http::header::COOKIE).and_then(|v| v.to_str().ok()) {
                for pair in cookie.split(';') {
                    if let Some(value) = pair.trim().strip_prefix("cv-locale=") {
                        return Locale::from_code(value);
                    }
                }
            }
        }
    }
    Locale::Vi
}

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();
    let locale = request_locale();
    provide_context(locale);
    view! {
        <Router>
            <Routes fallback=|| view! { <crate::pages::not_found::NotFound /> }>
                <Route path=path!("/") view=crate::pages::home::HomePage ssr=SsrMode::Async />
            </Routes>
        </Router>
    }
}
