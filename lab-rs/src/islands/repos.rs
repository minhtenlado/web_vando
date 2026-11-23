//! Public GitHub repositories, linked to case studies when a project references them.
use crate::api::get_repos;
use crate::model::{GithubRepo, Locale};
use crate::text::format_date;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

fn language_color(language: &str) -> &'static str {
    match language {
        "C" => "#a8b9cc", "C++" => "#f34b7d", "Python" => "#3572a5", "TypeScript" => "#3178c6", "JavaScript" => "#f1e05a",
        "HTML" => "#e34c26", "CSS" => "#663399", "Rust" => "#dea584", "Shell" => "#89e051", "Go" => "#00add8",
        _ => "#8b9bb4",
    }
}

/// `linked`: (repository name in lowercase, project id, project subtitle) from published projects.
#[island]
pub fn RepoGrid(linked: Vec<(String, String, String)>, locale: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let state = RwSignal::new(None::<Result<(String, Vec<GithubRepo>), String>>);
    let expanded = RwSignal::new(false);
    Effect::new(move |_| {
        spawn_local(async move {
            state.set(Some(get_repos().await.map_err(|e| e.to_string())));
        });
    });
    let linked = StoredValue::new(linked);
    let project_for = move |name: &str| linked.with_value(|l| l.iter().find(|(repo, _, _)| repo == &name.to_ascii_lowercase()).map(|(_, id, _)| id.clone()));
    let summary_for = move |name: &str| linked.with_value(|l| l.iter().find(|(repo, _, _)| repo == &name.to_ascii_lowercase()).map(|(_, _, s)| s.clone()).filter(|s| !s.is_empty()));
    view! {
        {move || match state.get() {
            None => view! {
                <div class="grid-3" aria-busy="true" aria-label=locale.t("Đang tải repository", "Loading repositories")>
                    {(0..6).map(|_| view! { <div class="card skeleton-card"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div> }).collect_view()}
                </div>
            }.into_any(),
            Some(Err(_)) => view! {
                <div class="empty" role="status"><p>{locale.t("Chưa tải được danh sách repository từ GitHub.", "GitHub repositories could not be loaded right now.")}</p></div>
            }.into_any(),
            Some(Ok((user, repos))) => {
                let mut ordered: Vec<GithubRepo> = repos.iter().filter(|r| project_for(&r.name).is_some()).cloned().collect();
                ordered.extend(repos.iter().filter(|r| project_for(&r.name).is_none()).cloned());
                let total = ordered.len();
                let with_case = ordered.iter().filter(|r| project_for(&r.name).is_some()).count();
                let mut languages: Vec<(String, usize)> = Vec::new();
                for repo in &ordered {
                    if let Some(lang) = &repo.language {
                        match languages.iter_mut().find(|(l, _)| l == lang) { Some((_, n)) => *n += 1, None => languages.push((lang.clone(), 1)) }
                    }
                }
                languages.sort_by(|a, b| b.1.cmp(&a.1));
                let profile = format!("https://github.com/{user}");
                let ordered = StoredValue::new(ordered);
                view! {
                    <div class="repo-summary glass">
                        <a class="btn" href=profile.clone() target="_blank" rel="noopener noreferrer" data-magnetic=""><Icon name="github" />{format!("github.com/{user}")}<Icon name="arrow-up-right" /></a>
                        <dl class="repo-stats">
                            <div><dt>{locale.t("Repository", "Repositories")}</dt><dd>{format!("{total:02}")}</dd></div>
                            <div><dt>{locale.t("Có trang dự án", "With case study")}</dt><dd>{format!("{with_case:02}")}</dd></div>
                            <div><dt>{locale.t("Ngôn ngữ", "Languages")}</dt><dd class="cluster" style="--gap:6px 14px;font:500 13px var(--font-mono)">
                                {languages.into_iter().take(4).map(|(l, _)| { let color = language_color(&l); view! { <span class="lang" style=format!("--lang:{color}")><i></i>{l}</span> } }).collect_view()}
                            </dd></div>
                        </dl>
                    </div>
                    <div class="grid-3">
                        {move || ordered.with_value(|list| list.iter().take(if expanded.get() { list.len() } else { 6 }).cloned().collect::<Vec<_>>()).into_iter().map(|repo| {
                            let case = project_for(&repo.name);
                            let linked_case = case.is_some().to_string();
                            let date = format_date(&repo.pushed_at, locale);
                            let lang = repo.language.clone();
                            view! {
                                <article class="card repo-card" data-linked=linked_case>
                                    <div class="top">
                                        <span class="lang" style=format!("--lang:{}", language_color(lang.as_deref().unwrap_or("")))><i></i>{lang.clone().unwrap_or_else(|| locale.t("Phần cứng / tài liệu", "Hardware / docs").into())}</span>
                                        <span>{date}</span>
                                    </div>
                                    <h3><a href=repo.url.clone() target="_blank" rel="noopener noreferrer">{repo.name.replace(['_', '-'], " ")}</a></h3>
                                    <p>{if repo.description.is_empty() { summary_for(&repo.name).unwrap_or_else(|| locale.t("Chưa có mô tả.", "No description yet.").to_string()) } else { repo.description.clone() }}</p>
                                    <div class="bottom">
                                        <span class="counts">
                                            <span><Icon name="star" />{repo.stars}<span class="sr-only">{locale.t(" sao", " stars")}</span></span>
                                            <span><Icon name="fork" />{repo.forks}<span class="sr-only">" forks"</span></span>
                                        </span>
                                        {case.map(|id| view! { <a href=format!("/projects/{id}")>{locale.t("Xem dự án", "Case study")}<Icon name="arrow-right" /></a> })}
                                    </div>
                                </article>
                            }
                        }).collect_view()}
                    </div>
                    {(total > 6).then(|| view! {
                        <div class="grid-load">
                            <button type="button" class="btn" on:click=move |_| expanded.update(|e| *e = !*e) aria-expanded=move || expanded.get().to_string()>
                                {move || if expanded.get() { locale.t("Thu gọn", "Show fewer").to_string() } else { format!("{} ({total})", locale.t("Xem tất cả repository", "Show all repositories")) }}
                            </button>
                        </div>
                    })}
                }.into_any()
            }
        }}
    }
}
