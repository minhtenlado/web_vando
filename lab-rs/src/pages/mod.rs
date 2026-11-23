pub mod admin;
pub mod home;
pub mod lab;
pub mod legal;
pub mod not_found;
pub mod notes;
pub mod post;
pub mod project;
pub mod projects;

use crate::model::Locale;
use crate::text::cloudinary;
use leptos::prelude::*;
use leptos_meta::{Link, Meta, Title};

pub const SITE: &str = "https://phanhuynh.id.vn";

#[component]
pub fn Seo(title: String, description: String, path: String, image: Option<String>, #[prop(optional)] article: bool) -> impl IntoView {
    let url = format!("{SITE}{path}");
    let image = image.filter(|i| !i.is_empty()).map(|i| if i.starts_with('/') { format!("{SITE}{i}") } else { cloudinary(&i, 1200) });
    view! {
        <Title text=title.clone() />
        <Meta name="description" content=description.clone() />
        <Link rel="canonical" href=url.clone() />
        <Meta property="og:title" content=title.clone() />
        <Meta property="og:description" content=description.clone() />
        <Meta property="og:url" content=url />
        <Meta property="og:type" content=if article { "article" } else { "website" } />
        <Meta property="og:site_name" content="Engineering Lab" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content=title />
        <Meta name="twitter:description" content=description />
        {image.map(|src| view! { <Meta property="og:image" content=src.clone() /><Meta name="twitter:image" content=src /> })}
    }
}

/// Structured data rendered inline; `<` is escaped so CMS text cannot close the script element.
#[component]
pub fn JsonLd(value: serde_json::Value) -> impl IntoView {
    let json = value.to_string().replace('<', "\\u003c");
    view! { <script type="application/ld+json" inner_html=json></script> }
}

#[component]
pub fn ErrorState(locale: Locale) -> impl IntoView {
    #[cfg(feature = "ssr")]
    if let Some(response) = use_context::<leptos_axum::ResponseOptions>() {
        response.set_status(http::StatusCode::SERVICE_UNAVAILABLE);
        response.insert_header(http::header::RETRY_AFTER, http::HeaderValue::from_static("30"));
    }
    view! {
        <Title text="Engineering Lab" />
        <main id="main" class="container state-page">
            <p class="eyebrow">"503"</p>
            <h1 class="h1">{locale.t("Nội dung tạm thời chưa tải được.", "Content is temporarily unavailable.")}</h1>
            <p class="lead">{locale.t("Đây là lỗi kết nối dữ liệu, không có nghĩa là dự án hay bài viết đã bị xóa. Hãy thử lại sau ít phút.", "This is a data connection error — projects and notes have not been removed. Please try again shortly.")}</p>
            <div class="cluster"><a class="btn btn-primary" href="">{locale.t("Thử lại", "Try again")}</a><a class="btn" href="/">{locale.t("Về trang chủ", "Home")}</a></div>
        </main>
    }
}
