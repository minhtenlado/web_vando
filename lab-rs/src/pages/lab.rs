use crate::api::get_lab;
use crate::islands::media::ImageViewer;
use crate::model::Locale;
use crate::pages::{ErrorState, Seo};
use crate::ui::icons::Icon;
use crate::ui::{pad2, Breadcrumb, DomainChips, Img, Layout, SectionHead, StatusBadge};
use leptos::prelude::*;

/// Hardware Lab: every board designed in the lab, with an interactive 3D tilt stage and its layer images.
#[component]
pub fn LabPage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let data = Resource::new_blocking(|| (), move |_| get_lab(locale));
    view! {
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                match data.await {
                    Err(_) => view! { <ErrorState locale=locale /> }.into_any(),
                    Ok((boards, settings)) => {
                        let fabricated = boards.iter().filter(|b| b.status == "completed").count();
                        let images: usize = boards.iter().map(|b| b.images.len()).sum();
                        let mut strip = Vec::new();
                        let mut labels = Vec::new();
                        for board in &boards {
                            for image in board.images.iter().skip(1) {
                                strip.push(image.clone());
                                labels.push(board.title.split(" — ").next().unwrap_or(&board.title).to_string());
                            }
                        }
                        view! {
                            <Seo title="Hardware Lab | Engineering Lab".into()
                                description=locale.t("Không gian trưng bày thiết kế phần cứng, PCB nhiều lớp và sản phẩm điện tử.", "A showcase of hardware designs, multi-layer PCBs and electronic products.").into()
                                path="/hardware-lab".into() image=boards.first().map(|b| b.image.clone()) />
                            <Layout settings=settings locale=locale current="lab">
                                <section class="page-hero">
                                    <div class="container">
                                        <Breadcrumb items=vec![(locale.t("Trang chủ", "Home").into(), Some("/".into())), ("Hardware Lab".into(), None)] />
                                        <p class="eyebrow">"Hardware Lab"</p>
                                        <h1 class="h1">{locale.t("Bo mạch, từ sơ đồ đến sản phẩm.", "Boards, from schematic to product.")}</h1>
                                        <p class="lead">{locale.t("Các thiết kế PCB của phòng lab — ảnh 3D, từng lớp đồng và bo mạch thực tế. Di chuột lên bo mạch để xoay xem.", "The lab's PCB designs — 3D renders, copper layers and fabricated boards. Hover a board to tilt it.")}</p>
                                        <div class="intro-stats" style="max-width:640px;grid-template-columns:repeat(3,minmax(0,1fr))">
                                            <div class="intro-stat glass"><strong>{pad2(boards.len())}</strong><span>{locale.t("thiết kế", "designs")}</span></div>
                                            <div class="intro-stat glass"><strong>{pad2(fabricated)}</strong><span>{locale.t("đã chế tạo", "fabricated")}</span></div>
                                            <div class="intro-stat glass"><strong>{pad2(images)}</strong><span>{locale.t("hình ảnh", "images")}</span></div>
                                        </div>
                                    </div>
                                </section>
                                <section class="section">
                                    <div class="container">
                                        {if boards.is_empty() {
                                            view! { <p class="empty">{locale.t("Chưa có thiết kế phần cứng được xuất bản.", "No hardware designs published yet.")}</p> }.into_any()
                                        } else {
                                            view! {
                                                <div class="board-grid">
                                                    {boards.into_iter().enumerate().map(|(i, board)| view! {
                                                        <a class="card board" href=format!("/projects/{}", board.id) data-tilt="" data-reveal="" style=format!("--i:{}", i % 2)>
                                                            <div class="stage">
                                                                <Img src=board.image.clone() alt=board.title.clone() eager=i < 2 sizes="(max-width: 860px) 100vw, 600px" />
                                                            </div>
                                                            <div class="specs">
                                                                <div class="cluster"><DomainChips domains=board.domains.clone() locale=locale /><StatusBadge status=board.status.clone() locale=locale /></div>
                                                                <h3>{board.title.clone()}</h3>
                                                                <p class="card-desc">{board.subtitle.clone()}</p>
                                                                <ul class="tags">{board.tech.iter().take(6).map(|t| view! { <li>{t.clone()}</li> }).collect_view()}</ul>
                                                                <span class="read-more">{locale.t("Xem datasheet dự án", "Open project datasheet")}<Icon name="arrow-right" /></span>
                                                            </div>
                                                        </a>
                                                    }).collect_view()}
                                                </div>
                                            }.into_any()
                                        }}
                                    </div>
                                </section>
                                {(!strip.is_empty()).then(|| view! {
                                    <section class="section" aria-labelledby="layers-title">
                                        <div class="container">
                                            <SectionHead index="PCB" eyebrow=locale.t("Thư viện hình ảnh", "Image library") id="layers-title"
                                                title=locale.t("Lớp đồng, footprint và ảnh 3D.", "Copper layers, footprints and 3D renders.")
                                                lead=locale.t("Chọn một ảnh để phóng to; dùng phím mũi tên để chuyển ảnh.", "Select an image to enlarge it; use the arrow keys to browse.") />
                                            <ImageViewer images=strip labels=labels title="Hardware Lab".into() mode="strip".into() locale=locale.code().into() transition=String::new() />
                                        </div>
                                    </section>
                                })}
                            </Layout>
                        }.into_any()
                    }
                }
            })}
        </Suspense>
    }
}
