use crate::api::get_home;
use crate::islands::contact::ContactForm;
use crate::islands::signal::SignalField;
use crate::model::{HomeData, Locale};
use crate::pages::{ErrorState, Seo};
use crate::text::DOMAINS;
use crate::ui::icons::{domain_icon, Icon};
use crate::ui::{pad2, tech_frequency, Layout, NoteCardView, ProjectCardView, SectionHead};
use leptos::prelude::*;

#[component]
pub fn HomePage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let data = Resource::new_blocking(|| (), move |_| get_home(locale));
    view! {
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                match data.await {
                    Ok(home) => view! { <Home home=home locale=locale /> }.into_any(),
                    Err(_) => view! { <ErrorState locale=locale /> }.into_any(),
                }
            })}
        </Suspense>
    }
}

#[component]
fn Home(home: HomeData, locale: Locale) -> impl IntoView {
    let HomeData { settings, projects, posts } = home;
    let total = projects.len();
    let completed = projects.iter().filter(|p| p.status == "completed").count();
    let with_source = projects.iter().filter(|p| p.repo.is_some()).count();
    let boards = projects.iter().filter(|p| p.domains.iter().any(|d| d == "pcb")).count();
    let flagged: Vec<_> = projects.iter().filter(|p| p.featured).take(3).cloned().collect();
    let featured = if flagged.is_empty() { projects.iter().take(3).cloned().collect::<Vec<_>>() } else { flagged };
    let domains: Vec<_> = DOMAINS
        .iter()
        .map(|d| {
            let members: Vec<_> = projects.iter().filter(|p| p.domains.iter().any(|k| k == d.key)).collect();
            let tech = tech_frequency(members.iter().copied());
            (d, members.len(), tech)
        })
        .filter(|(_, n, _)| *n > 0)
        .collect();
    let domain_count = domains.len();
    let headline: Vec<String> = settings.hero_headline.split('\n').map(str::trim).filter(|l| !l.is_empty()).map(str::to_string).collect();
    let line_count = headline.len();
    let latest: Vec<_> = posts.iter().take(3).cloned().collect();
    let post_count = posts.len();
    let github = settings.github_url.clone();
    let email = settings.email.clone();
    let mut word_index = 0usize;
    // Turning off the featured section in the CMS also renumbers the sections after it.
    let show_featured = settings.featured_enabled && !featured.is_empty();
    let (stack_index, notes_index) = if show_featured { ("03", "04") } else { ("02", "03") };

    view! {
        <Seo title=settings.meta_title.clone() description=settings.meta_description.clone() path="/".into() image=settings.og_image.clone() og_title=settings.og_title.clone() />
        <Layout settings=settings.clone() locale=locale current="home">
            <section class="hero" aria-labelledby="hero-title">
                <div class="hero-bg" aria-hidden="true">
                    <div class="hero-grid-lines"></div>
                    <div class="hero-orb a"></div>
                    <div class="hero-orb b"></div>
                    <div class="hero-noise"></div>
                </div>
                <div class="container hero-inner">
                    <div class="hero-copy">
                        <p class="hero-badge"><span class="pulse" aria-hidden="true"></span>"Engineering Lab"<b>{format!("{} {}", pad2(total), locale.t("DỰ ÁN", "PROJECTS"))}</b></p>
                        <h1 id="hero-title">
                            {headline.into_iter().enumerate().map(|(line_no, line)| {
                                let gradient = line_count > 1 && line_no + 1 == line_count;
                                view! {
                                    <span class="line">
                                        {line.split_whitespace().map(|word| {
                                            let i = word_index; word_index += 1;
                                            view! { <span class=if gradient { "word gradient-text" } else { "word" } style=format!("--i:{i}")>{word.to_string()}</span>" " }
                                        }).collect_view()}
                                    </span>
                                }
                            }).collect_view()}
                        </h1>
                        <p class="lead" data-reveal="" style="--i:3">{settings.hero_description.clone()}</p>
                        <div class="hero-actions" data-reveal="" style="--i:4">
                            <a class="btn btn-primary" href=settings.hero_primary_url.clone() data-magnetic="">{settings.hero_primary_label.clone()}<Icon name="arrow-right" /></a>
                            {github.clone().map(|href| view! { <a class="btn" href=href target="_blank" rel="noopener noreferrer" data-magnetic=""><Icon name="github" />{settings.hero_secondary_label.clone()}</a> })}
                            <a class="btn btn-ghost" href="/notes">"Engineering Notes"<Icon name="arrow-right" /></a>
                        </div>
                    </div>
                    <div class="hero-visual" data-reveal="scale" style="--i:2">
                        <div class="instrument">
                            <div class="instrument-inner">
                                <div class="instrument-bar" aria-hidden="true">
                                    <span class="dots"><i></i><i></i><i></i></span>
                                    <span>"signal_field.rs"</span>
                                    <span class="live"><span class="pulse"></span>"LIVE"</span>
                                </div>
                                <SignalField label=locale.t("Đồ họa tín hiệu tương tác · WebGL", "Interactive signal field · WebGL").to_string() />
                                <div class="metrics">
                                    <a class="metric" href="/projects"><strong>{pad2(total)}</strong><span>{locale.t("Dự án", "Projects")}</span></a>
                                    <a class="metric" href="/projects"><strong>{pad2(with_source)}</strong><span>{locale.t("Mã nguồn", "Open source")}</span></a>
                                    <a class="metric" href="#lab"><strong>{pad2(domain_count)}</strong><span>{locale.t("Lĩnh vực", "Domains")}</span></a>
                                    <a class="metric" href="/notes"><strong>{pad2(post_count)}</strong><span>{locale.t("Bài viết", "Notes")}</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <a class="scroll-cue" href="#lab" aria-label=locale.t("Cuộn xuống", "Scroll down")><i></i>"SCROLL"</a>
            </section>

            <section class="section" id="lab" aria-labelledby="lab-title">
                <div class="container intro-grid">
                    <div class="intro-statement">
                        <p class="eyebrow" data-reveal="fade"><span class="index-tag">"01"</span>"Engineering Lab"</p>
                        <h2 class="h2" id="lab-title" data-reveal="">{locale.t("Nơi phần cứng, firmware và AI gặp nhau.", "Where hardware, firmware and AI meet.")}</h2>
                        <p class="lead" data-reveal="">{locale.t(
                            "Mỗi dự án đi từ sơ đồ nguyên lý, bố trí PCB và firmware đến mô hình AI chạy trên thiết bị — kèm mã nguồn, ảnh thực tế và ghi chép trong quá trình phát triển.",
                            "Each project goes from schematic, PCB layout and firmware to AI models running on-device — with source code, real photos and notes from development.")}</p>
                        <div class="intro-stats">
                            <div class="intro-stat glass" data-reveal="" style="--i:0"><strong>{pad2(total)}</strong><span>{locale.t("dự án đã xuất bản", "published projects")}</span></div>
                            <div class="intro-stat glass" data-reveal="" style="--i:1"><strong>{pad2(completed)}</strong><span>{locale.t("đã hoàn thành", "completed")}</span></div>
                            <div class="intro-stat glass" data-reveal="" style="--i:2"><strong>{pad2(boards)}</strong><span>{locale.t("thiết kế PCB", "PCB designs")}</span></div>
                            <div class="intro-stat glass" data-reveal="" style="--i:3"><strong>{pad2(with_source)}</strong><span>{locale.t("repository mở", "open repositories")}</span></div>
                        </div>
                    </div>
                    <div class="domain-list">
                        {domains.iter().enumerate().map(|(i, (d, count, tech))| view! {
                            <a class="card domain-card" data-tone=d.tone href=format!("/projects?domain={}", d.key) data-reveal="" style=format!("--i:{}", i % 3)>
                                <span class="icon"><Icon name=domain_icon(d.key) /></span>
                                <div>
                                    <h3>{d.label(locale)}</h3>
                                    <p>{d.description(locale)}</p>
                                </div>
                                <span class="count">{pad2(*count)}<small>{locale.t("dự án", "projects")}</small></span>
                                <span class="tech">{tech.iter().take(4).map(|(t, _)| t.clone()).collect::<Vec<_>>().join("  ·  ")}</span>
                            </a>
                        }).collect_view()}
                    </div>
                </div>
            </section>

            {show_featured.then(|| view! {
            <section class="section" id="featured" aria-labelledby="featured-title">
                <div class="container">
                    <SectionHead index="02" eyebrow=locale.t("Dự án nổi bật", "Featured projects") id="featured-title"
                        title=locale.t("Hệ thống được xây dựng thật.", "Systems that were actually built.")
                        lead=locale.t("Từ bo mạch đã gia công đến mô hình AI chạy trên thiết bị biên.", "From fabricated boards to AI models running at the edge.")>
                        <a class="btn" href="/projects" data-magnetic="">{locale.t("Tất cả dự án", "All projects")}<Icon name="arrow-right" /></a>
                    </SectionHead>
                    <div class="bento">
                        {featured.into_iter().enumerate().map(|(i, card)| view! { <ProjectCardView card=card locale=locale index=i eager=i == 0 /> }).collect_view()}
                    </div>
                </div>
            </section>
            })}

            <section class="section" id="stack" aria-labelledby="stack-title">
                <div class="container">
                    <SectionHead index=stack_index eyebrow="Technology Stack" id="stack-title"
                        title=locale.t("Công nghệ theo từng lĩnh vực.", "Technology, by discipline.")
                        lead=locale.t("Tổng hợp trực tiếp từ danh sách công nghệ của các dự án đã xuất bản.", "Aggregated directly from the technology lists of published projects.") />
                    <div class="stack-grid">
                        {domains.iter().enumerate().map(|(i, (d, count, tech))| {
                            let max = tech.first().map(|(_, n)| *n).unwrap_or(1).max(1);
                            view! {
                                <div class="card stack-col" data-tone=d.tone data-reveal="" style=format!("--i:{}", i % 3)>
                                    <h3><Icon name=domain_icon(d.key) />{d.label(locale)}<span class="chip" data-tone=d.tone>{format!("{count}")}</span></h3>
                                    <ul class="stack-bars">
                                        {tech.iter().take(5).enumerate().map(|(j, (name, n))| view! {
                                            <li>
                                                <span class="row"><span>{name.clone()}</span><span>{format!("{n}×")}</span></span>
                                                <span class="bar"><i style=format!("--w:{}%;--i:{j}", (*n as f32 / max as f32 * 100.0).round())></i></span>
                                            </li>
                                        }).collect_view()}
                                    </ul>
                                </div>
                            }
                        }).collect_view()}
                    </div>
                </div>
            </section>

            <section class="section" id="notes" aria-labelledby="notes-title">
                <div class="container">
                    <SectionHead index=notes_index eyebrow="Engineering Notes" id="notes-title"
                        title=locale.t("Ghi chép kỹ thuật mới nhất.", "Latest engineering notes.")
                        lead=locale.t("Hướng dẫn triển khai và kết quả thử nghiệm rút ra từ các dự án.", "Implementation guides and experiment results from the projects.")>
                        <a class="btn" href="/notes" data-magnetic="">{locale.t("Tất cả bài viết", "All notes")}<Icon name="arrow-right" /></a>
                    </SectionHead>
                    {if latest.is_empty() {
                        view! { <p class="empty">{locale.t("Chưa có bài viết được xuất bản.", "No published notes yet.")}</p> }.into_any()
                    } else {
                        view! { <div class="grid-3">{latest.into_iter().enumerate().map(|(i, post)| view! { <NoteCardView post=post locale=locale index=i /> }).collect_view()}</div> }.into_any()
                    }}
                </div>
            </section>

            <section class="section" id="contact" aria-labelledby="contact-title">
                <div class="container contact">
                    <div>
                        <p class="eyebrow" data-reveal="fade"><span class="index-tag">"05"</span>{locale.t("Liên hệ", "Contact")}</p>
                        <h2 class="h2" id="contact-title" data-reveal="" style="margin-top:16px">{locale.t("Cùng xây dựng một hệ thống?", "Let's build a system together?")}</h2>
                        <p class="lead" data-reveal="" style="margin-top:18px">{locale.t(
                            "Hợp tác dự án, trao đổi về thiết kế phần cứng, hệ thống nhúng hay AI — tin nhắn sẽ được phản hồi qua email.",
                            "Project collaboration, hardware design, embedded systems or AI — messages are answered by email.")}</p>
                        <div class="contact-links">
                            {email.clone().map(|mail| view! { <a href=format!("mailto:{mail}") data-reveal="" style="--i:0"><Icon name="mail" /><span><small>"Email"</small>{mail.clone()}</span></a> })}
                            {github.clone().map(|href| view! { <a href=href.clone() target="_blank" rel="noopener noreferrer" data-reveal="" style="--i:1"><Icon name="github" /><span><small>"GitHub"</small>{href.trim_start_matches("https://").to_string()}</span></a> })}
                        </div>
                    </div>
                    <div class="contact-panel glass" data-reveal="scale">
                        <ContactForm locale=locale.code().to_string() />
                    </div>
                </div>
            </section>
        </Layout>
    }
}
