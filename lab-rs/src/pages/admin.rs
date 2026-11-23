//! Control Center (`/admin`). Every route checks the session on the server before loading data.
use crate::api_admin::*;
use crate::islands::admin::editors::{PostEditor, ProjectEditor};
use crate::islands::admin::lists::{PostsTable, ProjectsTable};
use crate::islands::admin::login::{LoginForm, LogoutButton};
use crate::islands::admin::moderation::{CommentsAdmin, Inbox};
use crate::islands::admin::profile::{CredentialsEditor, ExperienceEditor, ExperiencesTable, ProfileEditor};
use crate::islands::admin::settings::{ContentForm, MediaLibrary, PasswordForm, PruneActivities};
use crate::model::{AdminExperience, AdminPost, AdminProject, DashboardStats, Locale};
use crate::text::{format_date, status_label};
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos_meta::{Link, Meta, Script, Title};
use leptos_router::hooks::{use_params_map, use_query_map};

/// Sidebar groups: (heading, [(key, href, label, icon)]).
const NAV: [(&str, &[(&str, &str, &str, &str)]); 3] = [
    ("Nội dung", &[
        ("dashboard", "/admin", "Tổng quan", "chart"),
        ("projects", "/admin/projects", "Dự án", "cpu"),
        ("posts", "/admin/posts", "Bài viết", "file"),
        ("experiences", "/admin/experiences", "Kinh nghiệm", "briefcase"),
        ("media", "/admin/media", "Thư viện ảnh", "layers"),
        ("comments", "/admin/comments", "Bình luận", "message"),
        ("inbox", "/admin/inbox", "Hộp thư", "mail"),
    ]),
    ("Hồ sơ & trang", &[
        ("profile", "/admin/profile", "Hồ sơ", "user"),
        ("education", "/admin/education", "Học vấn", "award"),
        ("content", "/admin/content", "Nội dung trang", "globe"),
    ]),
    ("Hệ thống", &[
        ("account", "/admin/account", "Tài khoản", "shieldcheck"),
        ("activity", "/admin/activity", "Nhật ký", "clock"),
        ("site", "/", "Xem website", "arrow-up-right"),
    ]),
];

#[component]
fn Frame(current: &'static str, #[prop(into)] title: String, #[prop(into)] subtitle: String, children: ChildrenFn) -> impl IntoView {
    let session = Resource::new_blocking(|| (), |_| admin_session());
    let children = StoredValue::new(children);
    let (title, subtitle) = (StoredValue::new(title), StoredValue::new(subtitle));
    view! {
        <Title text=format!("{} · Control Center", title.get_value()) />
        <Meta name="robots" content="noindex, nofollow" />
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                match session.await {
                    Ok(true) => {
                        let unread = admin_stats().await.map(|s| s.messages_unread).unwrap_or(0);
                        view! {
                            <div class="admin">
                                <aside class="admin-side">
                                    <a href="/admin" class="brand"><span class="brand-mark"><Icon name="lab" /></span><span>"Control Center"</span></a>
                                    <nav class="admin-nav" aria-label="Quản trị">
                                        {NAV.iter().map(|(heading, items)| view! {
                                            <p>{*heading}</p>
                                            {items.iter().map(|(key, href, label, icon)| view! {
                                                <a href=*href aria-current=(*key == current).then_some("page") target=(*key == "site").then_some("_blank")>
                                                    <Icon name=icon />{*label}
                                                    {(*key == "inbox" && unread > 0).then(|| view! { <span class="badge">{unread}</span> })}
                                                </a>
                                            }).collect_view()}
                                        }).collect_view()}
                                    </nav>
                                    <div class="admin-side-foot"><LogoutButton /></div>
                                </aside>
                                <main class="admin-main" id="main">
                                    <div class="admin-top">
                                        <div><h1>{title.get_value()}</h1><p>{subtitle.get_value()}</p></div>
                                    </div>
                                    {children.with_value(|c| c())}
                                </main>
                            </div>
                        }.into_any()
                    }
                    _ => view! {
                        <div class="login-wrap">
                            <div class="login-card glass">
                                <span class="brand-mark"><Icon name="lab" /></span>
                                <div><h1 class="h3">"Engineering Lab · Control Center"</h1><p class="muted" style="margin-top:6px;font-size:14.5px">"Đăng nhập để quản lý dự án, bài viết và nội dung."</p></div>
                                <LoginForm />
                            </div>
                        </div>
                    }.into_any(),
                }
            })}
        </Suspense>
    }
}

fn fail_view(e: ServerFnError) -> AnyView {
    view! { <p class="alert" role="alert">{format!("Không tải được dữ liệu: {e}")}</p> }.into_any()
}

#[component]
pub fn AdminDashboard() -> impl IntoView {
    view! {
        <Frame current="dashboard" title="Tổng quan" subtitle="Tình trạng nội dung và tương tác của Engineering Lab.">
            {move || {
                let stats = Resource::new_blocking(|| (), |_| admin_stats());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match stats.await { Ok(s) => view! { <Dashboard stats=s /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
fn Dashboard(stats: DashboardStats) -> impl IntoView {
    let max_views = stats.top_posts.iter().map(|p| p.2).max().unwrap_or(1).max(1);
    let total_projects = (stats.projects_published + stats.projects_draft).max(1);
    view! {
        <div class="stat-grid">
            <div class="card stat"><span>"Dự án"</span><strong>{stats.projects_published}</strong><small>{format!("{} bản nháp", stats.projects_draft)}</small></div>
            <div class="card stat"><span>"Bài viết"</span><strong>{stats.posts_published}</strong><small>{format!("{} bản nháp", stats.posts_draft)}</small></div>
            <div class="card stat"><span>"Lượt xem"</span><strong>{stats.views}</strong><small>{format!("{} thích · {} lưu", stats.likes, stats.bookmarks)}</small></div>
            <div class="card stat"><span>"Tin nhắn"</span><strong>{stats.messages_unread}</strong><small>{format!("chưa đọc / {} · {} bình luận", stats.messages_total, stats.comments)}</small></div>
        </div>
        <div class="admin-columns">
            <div class="stack" style="--gap:16px">
                <section class="card panel">
                    <h2>"Bài viết được đọc nhiều"</h2>
                    <ul class="bar-chart">
                        {stats.top_posts.iter().map(|(title, slug, views, likes)| view! {
                            <li>
                                <span class="row"><a href=format!("/posts/{slug}") target="_blank">{title.clone()}</a><span>{format!("{views} xem · {likes} ♥")}</span></span>
                                <span class="bar"><i style=format!("--w:{}%;transform:scaleX(1)", (*views as f32 / max_views as f32 * 100.0).round())></i></span>
                            </li>
                        }).collect_view()}
                    </ul>
                </section>
                <section class="card panel">
                    <h2>"Trạng thái dự án"</h2>
                    <ul class="bar-chart">
                        {stats.status_counts.iter().map(|(status, n)| view! {
                            <li>
                                <span class="row"><span>{status_label(status, Locale::Vi).unwrap_or("Chưa ghi trạng thái")}</span><span>{*n}</span></span>
                                <span class="bar"><i style=format!("--w:{}%;transform:scaleX(1)", (*n as f32 / total_projects as f32 * 100.0).round())></i></span>
                            </li>
                        }).collect_view()}
                    </ul>
                </section>
            </div>
            <div class="stack" style="--gap:16px">
                <section class="card panel">
                    <h2>"Thao tác nhanh"</h2>
                    <div class="cluster">
                        <a class="btn btn-primary btn-sm" href="/admin/projects/new"><Icon name="sparkles" />"Dự án mới"</a>
                        <a class="btn btn-sm" href="/admin/posts/new"><Icon name="file" />"Bài viết mới"</a>
                        <a class="btn btn-sm" href="/admin/media"><Icon name="layers" />"Tải ảnh"</a>
                    </div>
                </section>
                <section class="card panel">
                    <h2>"Hoạt động gần đây"</h2>
                    <ActivityList items=stats.recent />
                    <a class="btn btn-ghost btn-sm" href="/admin/activity">"Xem toàn bộ nhật ký"<Icon name="arrow-right" /></a>
                </section>
            </div>
        </div>
    }
}

#[component]
fn ActivityList(items: Vec<crate::model::Activity>) -> impl IntoView {
    view! {
        <ul class="activity-list">
            {items.into_iter().map(|a| view! {
                <li><span class="dot" data-status=a.status.clone()></span><span><strong style="color:var(--text);font-weight:550">{a.title}</strong>{(!a.detail.is_empty()).then(|| view! { <span class="muted">{format!(" — {}", a.detail)}</span> })}</span><small>{format_date(&a.created_at, Locale::Vi)}</small></li>
            }).collect_view()}
        </ul>
    }
}

#[component]
pub fn AdminProjects() -> impl IntoView {
    view! {
        <Frame current="projects" title="Dự án" subtitle="Thêm, sửa, sắp xếp và xuất bản dự án.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_projects());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(p) => view! { <ProjectsTable projects=p /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

fn editor_assets() -> impl IntoView {
    view! { <Link rel="stylesheet" href="/vendor/quill/quill.snow.css" /><Script src="/vendor/quill/quill.js" /> }
}

#[component]
pub fn AdminProjectEdit() -> impl IntoView {
    let params = use_params_map();
    let id = params.with_untracked(|p| p.get("id").unwrap_or_default());
    let is_new = id == "new";
    view! {
        {editor_assets()}
        <Frame current="projects" title=if is_new { "Dự án mới" } else { "Sửa dự án" } subtitle="Nội dung chi tiết dùng Heading để chia mục trên trang dự án.">
            {
                let id = id.clone();
                move || {
                    let id = id.clone();
                    let data = Resource::new_blocking(|| (), move |_| { let id = id.clone(); async move { if id == "new" { Ok(Some(AdminProject { locale: "vi".into(), show_video_demo: true, ..Default::default() })) } else { admin_get_project(id).await } } });
                    view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await {
                        Ok(Some(p)) => view! { <ProjectEditor project=p /> }.into_any(),
                        Ok(None) => view! { <p class="alert">"Không tìm thấy dự án."</p> }.into_any(),
                        Err(e) => fail_view(e),
                    } })}</Suspense> }
                }
            }
        </Frame>
    }
}

#[component]
pub fn AdminPosts() -> impl IntoView {
    view! {
        <Frame current="posts" title="Bài viết" subtitle="Engineering Notes: soạn thảo, xuất bản và SEO.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_posts());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(p) => view! { <PostsTable posts=p /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
pub fn AdminPostEdit() -> impl IntoView {
    let params = use_params_map();
    let id = params.with_untracked(|p| p.get("id").unwrap_or_default());
    let is_new = id == "new";
    view! {
        {editor_assets()}
        <Frame current="posts" title=if is_new { "Bài viết mới" } else { "Sửa bài viết" } subtitle="Nội dung được làm sạch HTML khi lưu.">
            {
                let id = id.clone();
                move || {
                    let id = id.clone();
                    let data = Resource::new_blocking(|| (), move |_| { let id = id.clone(); async move { if id == "new" { Ok(Some(AdminPost { locale: "vi".into(), layout: "article".into(), ..Default::default() })) } else { admin_get_post(id).await } } });
                    view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await {
                        Ok(Some(p)) => view! { <PostEditor post=p /> }.into_any(),
                        Ok(None) => view! { <p class="alert">"Không tìm thấy bài viết."</p> }.into_any(),
                        Err(e) => fail_view(e),
                    } })}</Suspense> }
                }
            }
        </Frame>
    }
}

#[component]
pub fn AdminComments() -> impl IntoView {
    view! {
        <Frame current="comments" title="Bình luận" subtitle="Trả lời với tư cách tác giả hoặc xóa bình luận không phù hợp.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_comments());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(c) => view! { <CommentsAdmin comments=c /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
pub fn AdminInbox() -> impl IntoView {
    view! {
        <Frame current="inbox" title="Hộp thư" subtitle="Tin nhắn từ form liên hệ trên website.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_messages("all".into()));
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(m) => view! { <Inbox messages=m /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
pub fn AdminMedia() -> impl IntoView {
    view! { <Frame current="media" title="Thư viện ảnh" subtitle="Ảnh trên Cloudinary (web_vando/). Ảnh đang dùng được đánh dấu."><MediaLibrary /></Frame> }
}

#[component]
pub fn AdminContent() -> impl IntoView {
    view! {
        <Frame current="content" title="Nội dung trang" subtitle="Hero, SEO và thông tin liên hệ hiển thị công khai.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_content());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(s) => view! { <ContentForm settings=s /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
pub fn AdminAccount() -> impl IntoView {
    view! { <Frame current="account" title="Tài khoản" subtitle="Bảo mật đăng nhập quản trị."><PasswordForm /></Frame> }
}

#[component]
pub fn AdminActivity() -> impl IntoView {
    view! {
        <Frame current="activity" title="Nhật ký hoạt động" subtitle="Đăng nhập, thay đổi nội dung và sự kiện bảo mật.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_activities());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await {
                    Ok(items) => view! { <div class="cluster" style="margin-bottom:12px"><PruneActivities /></div><section class="card panel"><ActivityList items=items /></section> }.into_any(),
                    Err(e) => fail_view(e),
                } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
pub fn AdminProfile() -> impl IntoView {
    view! {
        <Frame current="profile" title="Hồ sơ" subtitle="Thông tin cá nhân, ảnh đại diện và mạng xã hội theo từng ngôn ngữ.">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_profile("vi".into()));
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(p) => view! { <ProfileEditor profile=p /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

#[component]
pub fn AdminEducation() -> impl IntoView {
    view! {
        <Frame current="education" title="Học vấn" subtitle="Học vấn, chứng chỉ và ngôn ngữ (song ngữ).">
            {move || {
                let data = Resource::new_blocking(|| (), |_| admin_credentials());
                view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await { Ok(c) => view! { <CredentialsEditor credentials=c /> }.into_any(), Err(e) => fail_view(e) } })}</Suspense> }
            }}
        </Frame>
    }
}

fn query_locale() -> String {
    let query = use_query_map();
    if query.with_untracked(|q| q.get("locale")).as_deref() == Some("en") { "en".into() } else { "vi".into() }
}

#[component]
pub fn AdminExperiences() -> impl IntoView {
    let locale = query_locale();
    view! {
        <Frame current="experiences" title="Kinh nghiệm" subtitle="Kinh nghiệm làm việc theo từng ngôn ngữ, sắp xếp theo thứ tự hiển thị.">
            {
                let locale = locale.clone();
                move || {
                    let locale = locale.clone();
                    let data = Resource::new_blocking(|| (), { let locale = locale.clone(); move |_| admin_experiences(locale.clone()) });
                    view! { <Suspense fallback=|| ()>{move || { let locale = locale.clone(); Suspend::new(async move { match data.await {
                        Ok(items) => view! { <ExperiencesTable items=items locale=locale /> }.into_any(),
                        Err(e) => fail_view(e),
                    } }) }}</Suspense> }
                }
            }
        </Frame>
    }
}

#[component]
pub fn AdminExperienceEdit() -> impl IntoView {
    let params = use_params_map();
    let id = params.with_untracked(|p| p.get("id").unwrap_or_default());
    let locale = query_locale();
    let is_new = id == "new";
    view! {
        <Frame current="experiences" title=if is_new { "Kinh nghiệm mới" } else { "Sửa kinh nghiệm" } subtitle="Vị trí, mô tả, điểm nổi bật và hình ảnh.">
            {
                let (id, locale) = (id.clone(), locale.clone());
                move || {
                    let (id, locale) = (id.clone(), locale.clone());
                    let data = Resource::new_blocking(|| (), move |_| {
                        let (id, locale) = (id.clone(), locale.clone());
                        async move { if id == "new" { Ok(Some(AdminExperience { locale, ..Default::default() })) } else { admin_get_experience(id).await } }
                    });
                    view! { <Suspense fallback=|| ()>{move || Suspend::new(async move { match data.await {
                        Ok(Some(x)) => view! { <ExperienceEditor experience=x /> }.into_any(),
                        Ok(None) => view! { <p class="alert">"Không tìm thấy kinh nghiệm."</p> }.into_any(),
                        Err(e) => fail_view(e),
                    } })}</Suspense> }
                }
            }
        </Frame>
    }
}
