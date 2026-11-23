//! Accent-insensitive search and domain/category filters for projects and notes.
use crate::model::{Locale, PostCard, ProjectCard};
use crate::text::{domain, normalize_search, DOMAINS};
use crate::ui::icons::Icon;
use crate::ui::{NoteCardView, ProjectCardView};
use leptos::prelude::*;
use std::collections::HashSet;

fn matches(search: &str, query: &str) -> bool {
    query.is_empty() || query.split(' ').all(|word| search.contains(word))
}

#[cfg(feature = "hydrate")]
fn sync_query(key: &str, value: &str) {
    let Some(win) = web_sys::window() else { return };
    let Ok(href) = win.location().href() else { return };
    let Ok(url) = web_sys::Url::new(&href) else { return };
    if value == "all" || value.is_empty() { url.search_params().delete(key); } else { url.search_params().set(key, value); }
    if let Ok(history) = win.history() {
        let _ = history.replace_state_with_url(&wasm_bindgen::JsValue::NULL, "", Some(&url.href()));
    }
}

#[island]
pub fn ProjectExplorer(projects: Vec<ProjectCard>, locale: String, initial: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let (query, set_query) = signal(String::new());
    let start = if initial == "all" || DOMAINS.iter().any(|d| d.key == initial) { initial } else { "all".to_string() };
    let (active, set_active) = signal(start);
    let total = projects.len();
    let index: Vec<(String, Vec<String>, String)> = projects.iter().map(|p| (p.id.clone(), p.domains.clone(), p.search.clone())).collect();
    let visible = Memo::new(move |_| {
        let q = normalize_search(&query.get());
        let d = active.get();
        index
            .iter()
            .filter(|(_, domains, search)| (d == "all" || domains.contains(&d)) && matches(search, &q))
            .map(|(id, _, _)| id.clone())
            .collect::<HashSet<String>>()
    });
    let mut chips: Vec<(String, String, usize)> = vec![("all".into(), locale.t("Tất cả", "All").into(), total)];
    for d in DOMAINS.iter() {
        let count = projects.iter().filter(|p| p.domains.iter().any(|k| k == d.key)).count();
        if count > 0 { chips.push((d.key.into(), d.label(locale).into(), count)); }
    }
    #[cfg(feature = "hydrate")]
    Effect::new(move |_| sync_query("domain", &active.get()));
    let reset = move |_| { set_query.set(String::new()); set_active.set("all".into()); };
    view! {
        <div class="toolbar glass">
            <div class="toolbar-row">
                <label class="search">
                    <Icon name="search" />
                    <span class="sr-only">{locale.t("Tìm dự án", "Search projects")}</span>
                    <input type="search" autocomplete="off" placeholder=locale.t("Tìm theo tên, công nghệ, linh kiện…", "Search by name, technology or part…")
                        prop:value=query on:input=move |ev| set_query.set(event_target_value(&ev)) />
                </label>
                <p class="result-count" role="status" aria-live="polite">
                    {move || format!("{:02} / {:02} {}", visible.with(|v| v.len()), total, locale.t("dự án", "projects"))}
                </p>
            </div>
            <div class="filters" role="group" aria-label=locale.t("Lọc theo lĩnh vực", "Filter by domain")>
                {chips.into_iter().map(|(key, label, count)| {
                    let k = key.clone();
                    view! {
                        <button type="button" class="filter" aria-pressed=move || (active.get() == k).to_string()
                            on:click=move |_| set_active.set(key.clone())>
                            {label}<span class="count">{count}</span>
                        </button>
                    }
                }).collect_view()}
            </div>
        </div>
        <div class="project-grid">
            {projects.into_iter().enumerate().map(|(i, card)| {
                let id = card.id.clone();
                view! {
                    <div hidden=move || !visible.with(|v| v.contains(&id))>
                        <ProjectCardView card=card locale=locale index=i eager=i < 3 />
                    </div>
                }
            }).collect_view()}
        </div>
        <Show when=move || visible.with(|v| v.is_empty())>
            <div class="empty" role="status">
                <p>{locale.t("Không có dự án phù hợp với bộ lọc hiện tại.", "No projects match the current filters.")}</p>
                <button type="button" class="btn btn-sm" on:click=reset>{locale.t("Xóa bộ lọc", "Clear filters")}</button>
            </div>
        </Show>
    }
}

#[island]
pub fn NotesExplorer(posts: Vec<PostCard>, locale: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let (query, set_query) = signal(String::new());
    let (active, set_active) = signal("all".to_string());
    let total = posts.len();
    let index: Vec<(String, String, String)> = posts
        .iter()
        .map(|p| (p.id.clone(), p.category.clone(), normalize_search(&format!("{} {} {}", p.title, p.category, p.excerpt))))
        .collect();
    let visible = Memo::new(move |_| {
        let q = normalize_search(&query.get());
        let c = active.get();
        index.iter().filter(|(_, cat, search)| (c == "all" || *cat == c) && matches(search, &q)).map(|(id, _, _)| id.clone()).collect::<HashSet<String>>()
    });
    let mut categories: Vec<(String, usize)> = Vec::new();
    for post in &posts {
        if post.category.is_empty() { continue; }
        match categories.iter_mut().find(|(c, _)| *c == post.category) { Some((_, n)) => *n += 1, None => categories.push((post.category.clone(), 1)) }
    }
    let _ = domain("ai");
    view! {
        <div class="toolbar glass">
            <div class="toolbar-row">
                <label class="search">
                    <Icon name="search" />
                    <span class="sr-only">{locale.t("Tìm bài viết", "Search notes")}</span>
                    <input type="search" autocomplete="off" placeholder=locale.t("Tìm bài viết…", "Search notes…") prop:value=query on:input=move |ev| set_query.set(event_target_value(&ev)) />
                </label>
                <p class="result-count" role="status" aria-live="polite">{move || format!("{:02} / {:02} {}", visible.with(|v| v.len()), total, locale.t("bài viết", "notes"))}</p>
            </div>
            {(!categories.is_empty()).then(|| view! {
                <div class="filters" role="group" aria-label=locale.t("Chuyên mục", "Categories")>
                    <button type="button" class="filter" aria-pressed=move || (active.get() == "all").to_string() on:click=move |_| set_active.set("all".into())>
                        {locale.t("Tất cả", "All")}<span class="count">{total}</span>
                    </button>
                    {categories.into_iter().map(|(cat, count)| {
                        let c = cat.clone();
                        let label = cat.clone();
                        view! { <button type="button" class="filter" aria-pressed=move || (active.get() == c).to_string() on:click=move |_| set_active.set(cat.clone())>{label}<span class="count">{count}</span></button> }
                    }).collect_view()}
                </div>
            })}
        </div>
        <div class="grid-3">
            {posts.into_iter().enumerate().map(|(i, post)| {
                let id = post.id.clone();
                view! { <div hidden=move || !visible.with(|v| v.contains(&id))><NoteCardView post=post locale=locale index=i /></div> }
            }).collect_view()}
        </div>
        <Show when=move || visible.with(|v| v.is_empty())>
            <p class="empty" role="status">{locale.t("Không có bài viết phù hợp.", "No matching notes.")}</p>
        </Show>
    }
}
