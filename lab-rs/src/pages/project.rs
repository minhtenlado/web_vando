use crate::api::get_project;
use crate::islands::media::{ImageViewer, VideoEmbed};
use crate::model::{Locale, ProjectCard, ProjectDetail, SiteSettings};
use crate::pages::{ErrorState, JsonLd, Seo, SITE};
use crate::text::{domain, github_repo_name, plain_text, status_label, truncate};
use crate::ui::icons::Icon;
use crate::ui::{transition_name, Breadcrumb, DomainChips, Layout, ProjectCardView, StatusBadge};
use leptos::prelude::*;
use leptos_router::hooks::use_params_map;

#[component]
pub fn ProjectPage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let params = use_params_map();
    let id = params.with_untracked(|p| p.get("id").unwrap_or_default());
    let data = Resource::new_blocking(|| (), move |_| get_project(id.clone(), locale));
    view! {
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                match data.await {
                    Err(_) => view! { <ErrorState locale=locale /> }.into_any(),
                    Ok(None) => view! { <crate::pages::not_found::NotFound /> }.into_any(),
                    Ok(Some((project, all, settings))) => view! { <Detail project=project all=all settings=settings locale=locale /> }.into_any(),
                }
            })}
        </Suspense>
    }
}

fn icon_for(name: &str) -> &'static str {
    match name { "layers" => "layers", "zap" => "zap", "code" => "code", "wifi" => "wifi", "shieldcheck" => "shieldcheck", "wrench" => "wrench", "sparkles" => "sparkles", "terminal" => "terminal", "chart" => "chart", _ => "cpu" }
}

#[component]
fn Detail(project: ProjectDetail, all: Vec<ProjectCard>, settings: SiteSettings, locale: Locale) -> impl IntoView {
    let position = all.iter().position(|p| p.id == project.id);
    let (previous, next) = match position {
        Some(i) if all.len() > 1 => (Some(all[(i + all.len() - 1) % all.len()].clone()), Some(all[(i + 1) % all.len()].clone())),
        _ => (None, None),
    };
    let tech: Vec<String> = project.tech.iter().map(|t| t.to_lowercase()).collect();
    let mut related: Vec<(usize, ProjectCard)> = all
        .iter()
        .filter(|p| p.id != project.id)
        .map(|p| {
            let shared_domains = p.domains.iter().filter(|d| project.domains.contains(d)).count();
            let shared_tech = p.tech.iter().filter(|t| tech.contains(&t.to_lowercase())).count();
            (shared_domains * 10 + shared_tech, p.clone())
        })
        .filter(|(score, _)| *score > 0)
        .collect();
    related.sort_by(|a, b| b.0.cmp(&a.0));
    let related: Vec<ProjectCard> = related.into_iter().take(3).map(|(_, p)| p).collect();

    // Sections are numbered in reading order; empty sections are omitted, never filled with placeholders.
    let mut toc: Vec<(String, String)> = Vec::new();
    let has_overview = !project.overview_quote.is_empty() || !project.intro_html.trim().is_empty();
    if has_overview { toc.push(("overview".into(), locale.t("Tổng quan", "Overview").into())); }
    for section in &project.sections { toc.push((section.id.clone(), section.title.clone())); }
    if !project.features.is_empty() { toc.push(("features".into(), locale.t("Tính năng & thông số", "Features & specifications").into())); }
    if !project.responsibilities.is_empty() { toc.push(("process".into(), locale.t("Quá trình phát triển", "Development process").into())); }
    let gallery_title = if project.visuals_title.trim().is_empty() {
        if project.domains.iter().any(|d| d == "pcb") { locale.t("PCB Gallery", "PCB Gallery").to_string() } else { locale.t("Hình ảnh", "Gallery").to_string() }
    } else { project.visuals_title.clone() };
    if project.images.len() > 1 { toc.push(("gallery".into(), gallery_title.clone())); }
    if project.youtube_id.is_some() { toc.push(("video".into(), if project.video_title.is_empty() { locale.t("Video trình diễn", "Demo video").into() } else { project.video_title.clone() })); }
    if !project.results.is_empty() { toc.push(("results".into(), locale.t("Kết quả", "Results").into())); }
    if project.repo.is_some() { toc.push(("repository".into(), "GitHub Repository".into())); }
    let numbers: std::collections::HashMap<String, String> = toc.iter().enumerate().map(|(n, (id, _))| (id.clone(), format!("{:02}", n + 1))).collect();
    let num = move |id: &str| numbers.get(id).cloned().unwrap_or_default();
    let toc_items = toc.clone();

    let description = if project.subtitle.is_empty() { truncate(&plain_text(&project.intro_html), 160) } else { project.subtitle.clone() };
    let repo_name = project.repo.as_deref().and_then(github_repo_name);
    let on_github = project.repo.as_deref().is_some_and(|r| r.contains("github.com"));
    let domains_text = project.domains.iter().filter_map(|d| domain(d)).map(|d| d.label(locale)).collect::<Vec<_>>().join(", ");
    let json_ld = serde_json::json!({
        "@context": "https://schema.org", "@type": "TechArticle", "headline": project.title, "description": description,
        "image": if project.image.is_empty() { serde_json::Value::Null } else { serde_json::Value::String(project.image.clone()) },
        "dateModified": project.updated_at, "author": { "@type": "Organization", "name": "Engineering Lab" },
        "mainEntityOfPage": format!("{SITE}/projects/{}", project.id), "keywords": project.tech.join(", "), "about": project.category,
    });
    let links = {
        let repo = project.repo.clone();
        let link = project.link.clone().filter(|l| Some(l) != project.repo.as_ref());
        move |primary: bool| view! {
            {repo.clone().map(|href| view! {
                <a class=if primary { "btn btn-primary" } else { "btn" } href=href target="_blank" rel="noopener noreferrer" data-magnetic="">
                    <Icon name="github" />{if on_github { locale.t("Mã nguồn trên GitHub", "Source on GitHub") } else { locale.t("Mã nguồn", "Source code") }}<Icon name="arrow-up-right" />
                </a>
            })}
            {link.clone().map(|href| view! { <a class="btn" href=href target="_blank" rel="noopener noreferrer"><Icon name="external" />{locale.t("Tài nguyên dự án", "Project resource")}</a> })}
        }
    };
    let id = project.id.clone();

    view! {
        <Seo title=format!("{} | Engineering Lab", project.title) description=description.clone() path=format!("/projects/{}", project.id) image=Some(project.image.clone()) article=true />
        <Layout settings=settings locale=locale current="projects">
            <JsonLd value=json_ld />
            <section class="detail-hero">
                <div class="container">
                    <Breadcrumb items=vec![(locale.t("Trang chủ", "Home").into(), Some("/".into())), (locale.t("Dự án", "Projects").into(), Some("/projects".into())), (project.title.clone(), None)] />
                    <div class="detail-kicker">
                        <DomainChips domains=project.domains.clone() locale=locale limit=6 />
                        <StatusBadge status=project.status.clone() locale=locale />
                        {(!project.year.is_empty()).then(|| view! { <span class="chip">{project.year.clone()}</span> })}
                    </div>
                    <h1 class="h1">{project.title.clone()}</h1>
                    {(!project.subtitle.is_empty()).then(|| view! { <p class="lead">{project.subtitle.clone()}</p> })}
                    <div class="detail-actions">{links(true)}</div>
                </div>
            </section>

            <div class="container">
                <ImageViewer images=project.images.clone() labels=vec![] title=project.title.clone() mode="cover".into() locale=locale.code().into() transition=transition_name(&id) />
                <div class="detail-layout">
                    <div class="detail-main">
                        {has_overview.then(|| view! {
                            <section class="detail-section" id="overview">
                                <h2><span class="num">{num("overview")}</span>{locale.t("Tổng quan", "Overview")}</h2>
                                {(!project.overview_quote.is_empty()).then(|| view! { <blockquote class="quote" data-reveal="">{project.overview_quote.clone()}</blockquote> })}
                                {(!project.intro_html.trim().is_empty()).then(|| view! { <div class="prose" inner_html=project.intro_html.clone()></div> })}
                            </section>
                        })}
                        {project.sections.iter().map(|section| view! {
                            <section class="detail-section" id=section.id.clone()>
                                <h2><span class="num">{num(&section.id)}</span>{section.title.clone()}</h2>
                                <div class="prose" inner_html=section.html.clone()></div>
                            </section>
                        }).collect_view()}
                        {(!project.features.is_empty()).then(|| view! {
                            <section class="detail-section" id="features">
                                <h2><span class="num">{num("features")}</span>{locale.t("Tính năng & thông số", "Features & specifications")}</h2>
                                <ul class="check-list">{project.features.iter().enumerate().map(|(i, f)| view! { <li data-reveal="" style=format!("--i:{}", i % 2)><Icon name="check" />{f.clone()}</li> }).collect_view()}</ul>
                            </section>
                        })}
                        {(!project.responsibilities.is_empty()).then(|| view! {
                            <section class="detail-section" id="process">
                                <h2><span class="num">{num("process")}</span>{locale.t("Quá trình phát triển", "Development process")}</h2>
                                <div class="impl-grid">
                                    {project.responsibilities.iter().enumerate().map(|(i, r)| view! {
                                        <div class="card impl-card" data-reveal="" style=format!("--i:{}", i % 2)>
                                            <span class="icon"><Icon name=icon_for(&r.icon) /></span>
                                            {(!r.title.is_empty()).then(|| view! { <h3>{r.title.clone()}</h3> })}
                                            {(!r.subtitle.is_empty()).then(|| view! { <p>{r.subtitle.clone()}</p> })}
                                        </div>
                                    }).collect_view()}
                                </div>
                            </section>
                        })}
                        {(project.images.len() > 1).then(|| view! {
                            <section class="detail-section" id="gallery">
                                <h2><span class="num">{num("gallery")}</span>{gallery_title.clone()}</h2>
                                <ImageViewer images=project.images.clone() labels=vec![] title=project.title.clone() mode="grid".into() locale=locale.code().into() transition=String::new() />
                            </section>
                        })}
                        {project.youtube_id.clone().map(|video| view! {
                            <section class="detail-section" id="video">
                                <h2><span class="num">{num("video")}</span>{if project.video_title.is_empty() { locale.t("Video trình diễn", "Demo video").to_string() } else { project.video_title.clone() }}</h2>
                                <VideoEmbed id=video title=project.title.clone() locale=locale.code().into() />
                            </section>
                        })}
                        {(!project.results.is_empty()).then(|| view! {
                            <section class="detail-section" id="results">
                                <h2><span class="num">{num("results")}</span>{locale.t("Kết quả", "Results")}</h2>
                                <dl class="results">
                                    {project.results.iter().enumerate().map(|(i, r)| view! {
                                        <div class="card" data-reveal="" style=format!("--i:{i}")>
                                            {(!r.number.is_empty()).then(|| view! { <dt class="gradient-text">{r.number.clone()}</dt> })}
                                            {(!r.label.is_empty()).then(|| view! { <dd>{r.label.clone()}</dd> })}
                                        </div>
                                    }).collect_view()}
                                </dl>
                            </section>
                        })}
                        {project.repo.clone().map(|href| view! {
                            <section class="detail-section" id="repository">
                                <h2><span class="num">{num("repository")}</span>"GitHub Repository"</h2>
                                <div class="card repo-block" data-reveal="">
                                    <span class="gh"><Icon name="github" /></span>
                                    <div>
                                        <strong>{repo_name.clone().unwrap_or_else(|| href.trim_start_matches("https://").to_string())}</strong>
                                        <span>{locale.t("Mã nguồn, sơ đồ, tài liệu và hướng dẫn build đầy đủ.", "Source, schematics, documentation and build instructions.")}</span>
                                    </div>
                                    <a class="btn" href=href target="_blank" rel="noopener noreferrer">{locale.t("Mở repository", "Open repository")}<Icon name="arrow-up-right" /></a>
                                </div>
                            </section>
                        })}
                    </div>

                    <aside class="detail-aside" aria-label=locale.t("Thông số dự án", "Project facts")>
                        <div class="card spec">
                            <h2>{locale.t("Thông số kỹ thuật", "Technical specifications")}</h2>
                            <dl>
                                {status_label(&project.status, locale).map(|s| view! { <div><dt>{locale.t("Trạng thái", "Status")}</dt><dd><StatusBadge status=project.status.clone() locale=locale />{let _ = s;}</dd></div> })}
                                {(!project.year.is_empty()).then(|| view! { <div><dt>{locale.t("Thời gian", "Date")}</dt><dd>{project.year.clone()}</dd></div> })}
                                {(!project.role.is_empty()).then(|| view! { <div><dt>{locale.t("Vai trò", "Role")}</dt><dd>{project.role.clone()}</dd></div> })}
                                {(!project.project_type.is_empty()).then(|| view! { <div><dt>{locale.t("Loại dự án", "Type")}</dt><dd>{project.project_type.clone()}</dd></div> })}
                                {(!domains_text.is_empty()).then(|| view! { <div><dt>{locale.t("Lĩnh vực", "Domains")}</dt><dd>{domains_text.clone()}</dd></div> })}
                                {(!project.highlight.is_empty()).then(|| view! { <div><dt>{locale.t("Điểm nhấn", "Highlights")}</dt><dd>{project.highlight.clone()}</dd></div> })}
                            </dl>
                            {(!project.tech.is_empty()).then(|| view! { <h3>{locale.t("Công nghệ", "Technology")}</h3><ul class="tags">{project.tech.iter().map(|t| view! { <li>{t.clone()}</li> }).collect_view()}</ul> })}
                            {links(false)}
                        </div>
                        {(toc_items.len() > 1).then(|| view! {
                            <nav class="card toc" data-toc="" aria-label=locale.t("Nội dung dự án", "Project contents")>
                                <h2>{locale.t("Nội dung", "Contents")}</h2>
                                <ol>{toc_items.iter().enumerate().map(|(i, (id, title))| view! { <li><a href=format!("#{id}")><span class="n">{format!("{:02}", i + 1)}</span>{title.clone()}</a></li> }).collect_view()}</ol>
                            </nav>
                        })}
                    </aside>
                </div>

                {(previous.is_some() || next.is_some()).then(|| view! {
                    <nav class="pager" aria-label=locale.t("Dự án khác", "More projects")>
                        {previous.clone().map(|p| view! { <a class="card" href=format!("/projects/{}", p.id) rel="prev"><small><Icon name="arrow-left" />{locale.t("Dự án trước", "Previous")}</small><strong>{p.title}</strong></a> })}
                        {next.clone().map(|p| view! { <a class="card" href=format!("/projects/{}", p.id) rel="next"><small>{locale.t("Dự án tiếp theo", "Next")}<Icon name="arrow-right" /></small><strong>{p.title}</strong></a> })}
                    </nav>
                })}
                {(!related.is_empty()).then(|| view! {
                    <section class="section" aria-labelledby="related-title" style="padding-bottom:96px">
                        <div class="section-head"><div><p class="eyebrow">{locale.t("Liên quan", "Related")}</p><h2 class="h2" id="related-title">{locale.t("Dự án liên quan.", "Related projects.")}</h2></div></div>
                        <div class="project-grid">{related.into_iter().enumerate().map(|(i, card)| view! { <ProjectCardView card=card locale=locale index=i /> }).collect_view()}</div>
                    </section>
                })}
            </div>
        </Layout>
    }
}
