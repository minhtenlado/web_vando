use crate::model::Locale;
use crate::pages::admin::*;
use crate::pages::{home::HomePage, lab::LabPage, legal::{PrivacyPage, TermsPage}, not_found::NotFound, notes::NotesPage, post::PostPage, project::ProjectPage, projects::ProjectsPage};
use leptos::prelude::*;
use leptos_meta::{provide_meta_context, MetaTags};
use leptos_router::{
    components::{Route, Router, Routes},
    path, SsrMode,
};

/// Runs before first paint: enables JS-only motion styles and the once-per-session intro.
const BOOT: &str = "document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('lab-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro');sessionStorage.setItem('lab-intro','1')}}catch(e){}";
/// Prefetch same-origin pages on hover (Chromium); other browsers ignore it.
const SPECULATION: &str = r#"{"prefetch":[{"source":"document","where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/admin*"}},{"not":{"href_matches":"/api/*"}}]},"eagerness":"moderate"}]}"#;

pub fn shell(options: LeptosOptions) -> impl IntoView {
    let locale = request_locale();
    view! {
        <!DOCTYPE html>
        <html lang=locale.code()>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="theme-color" content="#080a0f" />
                <meta name="color-scheme" content="dark" />
                <meta name="google-adsense-account" content="ca-pub-2941183923177148" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="preload" href="/fonts/inter-latin.woff2" r#as="font" type="font/woff2" crossorigin="" />
                <link rel="preload" href="/fonts/inter-vietnamese.woff2" r#as="font" type="font/woff2" crossorigin="" />
                <link rel="preconnect" href="https://res.cloudinary.com" crossorigin="" />
                <script inner_html=BOOT></script>
                <script type="speculationrules" inner_html=SPECULATION></script>
                <link rel="stylesheet" id="leptos" href="/pkg/lab.css" />
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
    provide_context(request_locale());
    view! {
        <Router>
            <Routes fallback=|| view! { <NotFound /> }>
                <Route path=path!("/") view=HomePage ssr=SsrMode::Async />
                <Route path=path!("/projects") view=ProjectsPage ssr=SsrMode::Async />
                <Route path=path!("/projects/:id") view=ProjectPage ssr=SsrMode::Async />
                <Route path=path!("/hardware-lab") view=LabPage ssr=SsrMode::Async />
                <Route path=path!("/notes") view=NotesPage ssr=SsrMode::Async />
                <Route path=path!("/posts/:slug") view=PostPage ssr=SsrMode::Async />
                <Route path=path!("/privacy") view=PrivacyPage ssr=SsrMode::Async />
                <Route path=path!("/terms") view=TermsPage ssr=SsrMode::Async />
                <Route path=path!("/admin") view=AdminDashboard ssr=SsrMode::Async />
                <Route path=path!("/admin/projects") view=AdminProjects ssr=SsrMode::Async />
                <Route path=path!("/admin/projects/:id") view=AdminProjectEdit ssr=SsrMode::Async />
                <Route path=path!("/admin/posts") view=AdminPosts ssr=SsrMode::Async />
                <Route path=path!("/admin/posts/:id") view=AdminPostEdit ssr=SsrMode::Async />
                <Route path=path!("/admin/comments") view=AdminComments ssr=SsrMode::Async />
                <Route path=path!("/admin/inbox") view=AdminInbox ssr=SsrMode::Async />
                <Route path=path!("/admin/media") view=AdminMedia ssr=SsrMode::Async />
                <Route path=path!("/admin/content") view=AdminContent ssr=SsrMode::Async />
                <Route path=path!("/admin/account") view=AdminAccount ssr=SsrMode::Async />
                <Route path=path!("/admin/activity") view=AdminActivity ssr=SsrMode::Async />
                <Route path=path!("/admin/profile") view=AdminProfile ssr=SsrMode::Async />
                <Route path=path!("/admin/education") view=AdminEducation ssr=SsrMode::Async />
                <Route path=path!("/admin/experiences") view=AdminExperiences ssr=SsrMode::Async />
                <Route path=path!("/admin/experiences/:id") view=AdminExperienceEdit ssr=SsrMode::Async />
            </Routes>
        </Router>
    }
}
