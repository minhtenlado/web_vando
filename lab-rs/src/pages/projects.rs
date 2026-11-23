use crate::api::get_home;
use crate::islands::explorer::ProjectExplorer;
use crate::islands::repos::RepoGrid;
use crate::model::Locale;
use crate::pages::{ErrorState, Seo};
use crate::text::github_repo_name;
use crate::ui::{Breadcrumb, Layout, SectionHead};
use leptos::prelude::*;
use leptos_router::hooks::use_query_map;

#[component]
pub fn ProjectsPage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let query = use_query_map();
    let initial = query.with_untracked(|q| q.get("domain").unwrap_or_else(|| "all".into()));
    let data = Resource::new_blocking(|| (), move |_| get_home(locale));
    view! {
        <Suspense fallback=|| ()>
            {move || {
                let initial = initial.clone();
                Suspend::new(async move {
                    match data.await {
                        Err(_) => view! { <ErrorState locale=locale /> }.into_any(),
                        Ok(home) => {
                            let linked: Vec<(String, String, String)> = home.projects.iter()
                                .filter_map(|p| p.repo.as_deref().and_then(github_repo_name).map(|name| (name, p.id.clone(), p.subtitle.clone())))
                                .collect();
                            let total = home.projects.len();
                            view! {
                                <Seo title=locale.t("Dự án kỹ thuật | Engineering Lab", "Engineering projects | Engineering Lab").into()
                                    description=locale.t("Thư viện dự án hệ thống nhúng, thiết kế PCB, IoT, Edge AI, robotics và trí tuệ nhân tạo.", "Projects across embedded systems, PCB design, IoT, edge AI, robotics and artificial intelligence.").into()
                                    path="/projects".into() image=home.projects.first().map(|p| p.image.clone()) />
                                <Layout settings=home.settings.clone() locale=locale current="projects">
                                    <section class="page-hero">
                                        <div class="container">
                                            <Breadcrumb items=vec![(locale.t("Trang chủ", "Home").into(), Some("/".into())), (locale.t("Dự án", "Projects").into(), None)] />
                                            <p class="eyebrow">{format!("{total:02} {}", locale.t("dự án đã xuất bản", "published projects"))}</p>
                                            <h1 class="h1 split-reveal revealed">{locale.t("Thư viện dự án kỹ thuật.", "Engineering project library.")}</h1>
                                            <p class="lead">{locale.t("Hệ thống nhúng, thiết kế PCB, IoT, Edge AI, robotics và trí tuệ nhân tạo — kèm hình ảnh, công nghệ, trạng thái và mã nguồn.", "Embedded systems, PCB design, IoT, edge AI, robotics and AI — with images, technologies, status and source code.")}</p>
                                        </div>
                                    </section>
                                    <section class="section" aria-label=locale.t("Danh sách dự án", "Project list")>
                                        <div class="container">
                                            <ProjectExplorer projects=home.projects.clone() locale=locale.code().to_string() initial=initial.clone() />
                                        </div>
                                    </section>
                                    <section class="section" id="github" aria-labelledby="github-title">
                                        <div class="container">
                                            <SectionHead index="GH" eyebrow=locale.t("Mã nguồn mở", "Open source") id="github-title"
                                                title=locale.t("Kho mã nguồn trên GitHub.", "Repositories on GitHub.")
                                                lead=locale.t("Tự động cập nhật mỗi giờ. Repository có bài giới thiệu sẽ liên kết tới trang dự án.", "Refreshed hourly. Repositories with a case study link to the project page.") />
                                            <RepoGrid linked=linked locale=locale.code().to_string() />
                                        </div>
                                    </section>
                                </Layout>
                            }.into_any()
                        }
                    }
                })
            }}
        </Suspense>
    }
}
