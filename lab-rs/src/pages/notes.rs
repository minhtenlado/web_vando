use crate::api::get_posts;
use crate::islands::explorer::NotesExplorer;
use crate::model::Locale;
use crate::pages::{ErrorState, Seo};
use crate::ui::{Breadcrumb, Layout};
use leptos::prelude::*;

#[component]
pub fn NotesPage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let data = Resource::new_blocking(|| (), move |_| get_posts(locale));
    view! {
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                match data.await {
                    Err(_) => view! { <ErrorState locale=locale /> }.into_any(),
                    Ok((posts, settings)) => view! {
                        <Seo title=locale.t("Engineering Notes | Bài viết kỹ thuật", "Engineering Notes | Technical articles").into()
                            description=locale.t("Ghi chép kỹ thuật về Embedded Linux, STM32, thiết kế PCB, điện tử, IoT, Edge AI và robotics.", "Technical notes on embedded Linux, STM32, PCB design, electronics, IoT, edge AI and robotics.").into()
                            path="/notes".into() image=None />
                        <Layout settings=settings locale=locale current="notes">
                            <section class="page-hero">
                                <div class="container">
                                    <Breadcrumb items=vec![(locale.t("Trang chủ", "Home").into(), Some("/".into())), ("Engineering Notes".into(), None)] />
                                    <p class="eyebrow">"Engineering Notes"</p>
                                    <h1 class="h1">{locale.t("Ghi chép từ phòng lab.", "Notes from the lab.")}</h1>
                                    <p class="lead">{locale.t("Hướng dẫn triển khai, giải thích thuật toán và kết quả thử nghiệm — Embedded Linux, STM32, PCB, điện tử, IoT, Edge AI và robotics.", "Implementation guides, algorithm write-ups and experiment results — embedded Linux, STM32, PCB, electronics, IoT, edge AI and robotics.")}</p>
                                </div>
                            </section>
                            <section class="section">
                                <div class="container">
                                    {if posts.is_empty() {
                                        view! { <p class="empty">{locale.t("Chưa có bài viết được xuất bản.", "No published notes yet.")}</p> }.into_any()
                                    } else {
                                        view! { <NotesExplorer posts=posts locale=locale.code().to_string() /> }.into_any()
                                    }}
                                </div>
                            </section>
                        </Layout>
                    }.into_any(),
                }
            })}
        </Suspense>
    }
}
