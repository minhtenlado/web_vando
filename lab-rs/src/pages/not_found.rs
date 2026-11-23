use crate::model::Locale;
use leptos::prelude::*;
use leptos_meta::{Meta, Title};

#[component]
pub fn NotFound() -> impl IntoView {
    #[cfg(feature = "ssr")]
    if let Some(response) = use_context::<leptos_axum::ResponseOptions>() {
        response.set_status(http::StatusCode::NOT_FOUND);
    }
    let locale = use_context::<Locale>().unwrap_or_default();
    view! {
        <Title text="404 | Engineering Lab" />
        <Meta name="robots" content="noindex" />
        <main id="main" class="container state-page">
            <p class="code" aria-hidden="true">"404"</p>
            <h1 class="h1">{locale.t("Không tìm thấy trang.", "Page not found.")}</h1>
            <p class="lead">{locale.t("Trang này không tồn tại hoặc đã được chuyển đi.", "This page does not exist or has moved.")}</p>
            <div class="cluster"><a class="btn btn-primary" href="/">{locale.t("Về trang chủ", "Back home")}</a><a class="btn" href="/projects">{locale.t("Xem dự án", "Browse projects")}</a></div>
        </main>
    }
}
