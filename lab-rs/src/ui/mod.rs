//! Server-rendered building blocks. Interactive behaviour lives in `crate::islands`.
pub mod icons;

use crate::islands::motion::Motion;
use crate::model::{Locale, PostCard, ProjectCard, SiteSettings};
use crate::text::{self, cloudinary, domain, format_date, srcset, status_label};
use icons::Icon;
use leptos::prelude::*;

/// Responsive image: Cloudinary transformations for `srcset`, explicit size to keep CLS at zero.
#[component]
pub fn Img(
    src: String,
    #[prop(into)] alt: String,
    #[prop(default = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw")] sizes: &'static str,
    #[prop(default = 1600)] width: u32,
    #[prop(default = 1000)] height: u32,
    #[prop(optional)] eager: bool,
    #[prop(optional, into)] transition_name: Option<String>,
) -> impl IntoView {
    let set = srcset(&src, &[400, 640, 960, 1280, 1920]);
    let fallback = cloudinary(&src, 1280);
    let style = transition_name.map(|name| format!("view-transition-name:{name}"));
    view! {
        <img
            src=fallback
            srcset=set
            sizes=sizes
            alt=alt
            width=width
            height=height
            loading=if eager { "eager" } else { "lazy" }
            decoding="async"
            fetchpriority=if eager { Some("high") } else { None }
            style=style
        />
    }
}

#[component]
pub fn StatusBadge(status: String, locale: Locale) -> impl IntoView {
    status_label(&status, locale).map(|label| view! { <span class="status" data-status=status.clone()>{label}</span> })
}

#[component]
pub fn DomainChips(domains: Vec<String>, locale: Locale, #[prop(default = 3)] limit: usize) -> impl IntoView {
    view! {
        <div class="cluster" style="--gap:6px">
            {domains
                .into_iter()
                .filter_map(|key| domain(&key))
                .take(limit)
                .map(|d| view! { <span class="chip" data-tone=d.tone>{if locale == Locale::Vi { d.short } else { d.short }}</span> })
                .collect_view()}
        </div>
    }
}

pub fn transition_name(id: &str) -> String {
    format!("p-{}", id.chars().filter(|c| c.is_ascii_alphanumeric()).collect::<String>())
}

#[component]
pub fn ProjectCardView(card: ProjectCard, locale: Locale, #[prop(optional)] index: usize, #[prop(optional)] eager: bool) -> impl IntoView {
    let href = format!("/projects/{}", card.id);
    let name = transition_name(&card.id);
    let has_image = !card.image.is_empty();
    view! {
        <article class="card project-card" data-reveal="" style=format!("--i:{}", index % 3)>
            <a href=href>
                <div class="media">
                    {if has_image {
                        view! { <Img src=card.image.clone() alt="" eager=eager transition_name=name /> }.into_any()
                    } else {
                        view! { <div class="note-placeholder"><Icon name="cpu" /><span>"Engineering Lab"</span></div> }.into_any()
                    }}
                    <StatusBadge status=card.status.clone() locale=locale />
                </div>
                <div class="card-body">
                    <DomainChips domains=card.domains.clone() locale=locale />
                    <h3>{card.title.clone()}</h3>
                    <p class="card-desc">{card.subtitle.clone()}</p>
                    <ul class="tags">{card.tech.iter().take(4).map(|t| view! { <li>{t.clone()}</li> }).collect_view()}</ul>
                </div>
                <div class="card-foot">
                    <span>{if card.year.is_empty() { "—".to_string() } else { card.year.clone() }}</span>
                    {card.repo.is_some().then(|| view! { <span class="source"><Icon name="github" />{locale.t("Mã nguồn", "Source")}</span> })}
                    <span class="arrow"><Icon name="arrow-up-right" /></span>
                </div>
            </a>
        </article>
    }
}

#[component]
pub fn NoteCardView(post: PostCard, locale: Locale, #[prop(optional)] index: usize) -> impl IntoView {
    let href = format!("/posts/{}", post.slug);
    let date = format_date(&post.created_at, locale);
    let category = post.category.clone();
    view! {
        <article class="card note-card" data-reveal="" style=format!("--i:{}", index % 3)>
            <a href=href>
                <div class="media">
                    {match post.cover_image.clone() {
                        Some(src) => view! { <Img src=src alt="" /> }.into_any(),
                        None => view! {
                            <div class="note-placeholder">
                                <Icon name="file" />
                                <span>{if category.is_empty() { "Engineering Notes".to_string() } else { category.clone() }}</span>
                            </div>
                        }.into_any(),
                    }}
                </div>
                <div class="card-body">
                    <p class="note-meta">
                        {(!post.category.is_empty()).then(|| view! { <span class="chip" data-tone="cyan">{post.category.clone()}</span> })}
                        <time datetime=post.created_at.clone()>{date}</time>
                    </p>
                    <h3>{post.title.clone()}</h3>
                    <p class="card-desc">{post.excerpt.clone()}</p>
                    <span class="read-more">{locale.t("Đọc bài viết", "Read article")}<Icon name="arrow-right" /></span>
                </div>
            </a>
        </article>
    }
}

#[component]
pub fn SectionHead(
    index: &'static str,
    #[prop(into)] eyebrow: String,
    #[prop(into)] title: String,
    #[prop(optional, into)] lead: Option<String>,
    #[prop(optional)] children: Option<Children>,
    #[prop(optional)] id: &'static str,
) -> impl IntoView {
    let words: Vec<String> = title.split_whitespace().map(str::to_string).collect();
    view! {
        <div class="section-head">
            <div>
                <p class="eyebrow" data-reveal="fade"><span class="index-tag">{index}</span>{eyebrow}</p>
                <h2 class="h2 split-reveal" id=(!id.is_empty()).then_some(id) data-reveal-split="">
                    {words.into_iter().enumerate().map(|(i, w)| view! { <span class="word" style=format!("--i:{i}")>{w}</span>" " }).collect_view()}
                </h2>
                {lead.map(|lead| view! { <p class="lead" data-reveal="">{lead}</p> })}
            </div>
            {children.map(|c| c())}
        </div>
    }
}

#[component]
pub fn Breadcrumb(items: Vec<(String, Option<String>)>) -> impl IntoView {
    let count = items.len();
    view! {
        <nav class="breadcrumb" aria-label="Breadcrumb">
            {items.into_iter().enumerate().map(|(i, (label, href))| {
                let last = i + 1 == count;
                view! {
                    {match href {
                        Some(href) if !last => view! { <a href=href>{label}</a> }.into_any(),
                        _ => view! { <span aria-current="page">{label}</span> }.into_any(),
                    }}
                    {(!last).then(|| view! { <Icon name="chevron-right" /> })}
                }
            }).collect_view()}
        </nav>
    }
}

fn nav_items(locale: Locale) -> [(&'static str, &'static str, &'static str); 4] {
    [
        ("projects", "/projects", locale.t("Dự án", "Projects")),
        ("lab", "/hardware-lab", "Hardware Lab"),
        ("notes", "/notes", locale.t("Bài viết", "Notes")),
        ("contact", "/#contact", locale.t("Liên hệ", "Contact")),
    ]
}

/// Page chrome shared by every public route.
#[component]
pub fn Layout(settings: SiteSettings, locale: Locale, current: &'static str, children: Children) -> impl IntoView {
    let items = nav_items(locale);
    let other = if locale == Locale::Vi { "en" } else { "vi" };
    let github = settings.github_url.clone();
    let email = settings.email.clone();
    let name = settings.portfolio_name.clone();
    let year = chrono::Utc::now().format("%Y").to_string();
    view! {
        <a href="#main" class="skip-link">{locale.t("Đến nội dung chính", "Skip to content")}</a>
        <div class="intro-loader" aria-hidden="true">
            <div class="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" inner_html=icons::paths("lab")></svg>
                <span class="bar-track"><i></i></span>
            </div>
        </div>
        <header class="site-header" data-header="">
            <div class="container nav">
                <a href="/" class="brand" aria-label=name.clone()>
                    <span class="brand-mark"><Icon name="lab" /></span>
                    <span>{name.clone()}</span>
                </a>
                <nav class="nav-links" aria-label=locale.t("Điều hướng chính", "Main navigation")>
                    {items.iter().map(|(key, href, label)| view! {
                        <a href=*href aria-current=(*key == current).then_some("page")>{*label}</a>
                    }).collect_view()}
                </nav>
                <div class="nav-tools">
                    {github.clone().map(|href| view! {
                        <a class="icon-btn" href=href target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Icon name="github" /></a>
                    })}
                    <button class="icon-btn locale-btn" type="button" data-locale-switch=other aria-label=locale.t("Switch to English", "Chuyển sang tiếng Việt")>
                        {locale.code().to_uppercase()}
                    </button>
                    <button class="icon-btn menu-btn" type="button" data-menu-open="" aria-controls="mobile-nav" aria-expanded="false" aria-label=locale.t("Mở menu", "Open menu")>
                        <Icon name="menu" />
                    </button>
                </div>
            </div>
        </header>
        <div class="mobile-nav" id="mobile-nav" data-open="false" role="dialog" aria-modal="true" aria-label=locale.t("Menu", "Menu")>
            <div class="mobile-nav-top">
                <a href="/" class="brand"><span class="brand-mark"><Icon name="lab" /></span><span>{name.clone()}</span></a>
                <button class="icon-btn" type="button" data-menu-close="" aria-label=locale.t("Đóng menu", "Close menu")><Icon name="x" /></button>
            </div>
            <nav aria-label=locale.t("Điều hướng", "Navigation")>
                {items.iter().enumerate().map(|(i, (key, href, label))| view! {
                    <a href=*href style=format!("--i:{i}") aria-current=(*key == current).then_some("page")>{*label}<Icon name="arrow-up-right" /></a>
                }).collect_view()}
            </nav>
            <div class="cluster">
                {github.clone().map(|href| view! { <a class="btn btn-sm" href=href target="_blank" rel="noopener noreferrer"><Icon name="github" />"GitHub"</a> })}
                {email.clone().map(|mail| view! { <a class="btn btn-sm" href=format!("mailto:{mail}")><Icon name="mail" />"Email"</a> })}
            </div>
        </div>
        <main id="main" tabindex="-1">{children()}</main>
        <footer class="site-footer">
            <div class="container">
                <p class="footer-word" aria-hidden="true">"ENGINEERING LAB"</p>
                <div class="footer-grid">
                    <div>
                        <a href="/" class="brand"><span class="brand-mark"><Icon name="lab" /></span><span>{name.clone()}</span></a>
                        <p>{settings.tagline.clone()}</p>
                    </div>
                    <nav aria-label=locale.t("Khám phá", "Explore")>
                        <h3>{locale.t("Khám phá", "Explore")}</h3>
                        {items.iter().map(|(_, href, label)| view! { <a href=*href>{*label}</a> }).collect_view()}
                    </nav>
                    <nav aria-label=locale.t("Liên hệ", "Contact")>
                        <h3>{locale.t("Liên hệ", "Contact")}</h3>
                        {github.clone().map(|href| view! { <a href=href target="_blank" rel="noopener noreferrer">"GitHub"</a> })}
                        {email.clone().map(|mail| view! { <a href=format!("mailto:{mail}")>"Email"</a> })}
                    </nav>
                    <nav aria-label=locale.t("Thông tin", "Information")>
                        <h3>{locale.t("Thông tin", "Information")}</h3>
                        <a href="/privacy">{locale.t("Chính sách bảo mật", "Privacy policy")}</a>
                        <a href="/terms">{locale.t("Điều khoản sử dụng", "Terms of use")}</a>
                    </nav>
                </div>
                <div class="footer-bottom">
                    <span>{format!("© {year} {name}")}</span>
                    <span>{locale.t("Thiết kế & xây dựng bằng Rust · Leptos · Axum", "Designed & built with Rust · Leptos · Axum")}</span>
                    <a href="#main">{locale.t("Lên đầu trang ↑", "Back to top ↑")}</a>
                </div>
            </div>
        </footer>
        <Motion locale=locale.code().to_string() />
    }
}

/// Count helper used for metric tiles.
pub fn pad2(n: usize) -> String {
    format!("{n:02}")
}

/// Top technologies across projects, most frequent first.
pub fn tech_frequency<'a>(projects: impl Iterator<Item = &'a ProjectCard>) -> Vec<(String, usize)> {
    let mut counts: Vec<(String, usize)> = Vec::new();
    for project in projects {
        for tech in &project.tech {
            let key = tech.trim();
            match counts.iter_mut().find(|(name, _)| text::normalize_search(name) == text::normalize_search(key)) {
                Some((_, n)) => *n += 1,
                None => counts.push((key.to_string(), 1)),
            }
        }
    }
    counts.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    counts
}
