//! Project and post tables with publish/featured toggles, ordering and deletion.
use crate::api_admin::{admin_delete_post, admin_delete_project, admin_move_project, admin_save_post, admin_save_project};
use crate::islands::admin::common::{confirm, err, ok, reload, Notice, Toast};
use crate::model::{AdminPost, AdminProject, Locale};
use crate::text::{cloudinary, format_date, normalize_search, status_label};
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

#[component]
fn Switch(checked: bool, label: &'static str, on_toggle: Callback<bool>) -> impl IntoView {
    let state = RwSignal::new(checked);
    view! {
        <label class="switch" title=label>
            <input type="checkbox" prop:checked=state on:change=move |ev| { let v = event_target_checked(&ev); state.set(v); on_toggle.run(v); } aria-label=label />
            <span class="track"></span>
        </label>
    }
}

#[island]
pub fn ProjectsTable(projects: Vec<AdminProject>) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let query = RwSignal::new(String::new());
    let rows = StoredValue::new(projects);
    let count = rows.with_value(|r| r.len());
    let toggle = move |project: AdminProject, field: &'static str, value: bool| {
        spawn_local(async move {
            let mut p = project;
            if field == "published" { p.published = value } else { p.featured = value }
            match admin_save_project(p).await {
                Ok(saved) => notice.set(ok(format!("{} “{}”", if field == "published" { if value { "Đã xuất bản" } else { "Đã chuyển về nháp" } } else if value { "Đã đánh dấu nổi bật" } else { "Đã bỏ nổi bật" }, saved.title))),
                Err(e) => notice.set(err(e)),
            }
        });
    };
    view! {
        <div class="toolbar glass" style="position:static">
            <div class="toolbar-row">
                <label class="search"><Icon name="search" /><input type="search" placeholder="Tìm dự án…" prop:value=query on:input=move |ev| query.set(event_target_value(&ev)) /></label>
                <span class="result-count">{format!("{count:02} dự án")}</span>
                <a class="btn btn-primary btn-sm" href="/admin/projects/new"><Icon name="sparkles" />"Dự án mới"</a>
            </div>
        </div>
        <div class="table-wrap-admin">
            <table class="table cards">
                <thead><tr><th></th><th>"Dự án"</th><th>"Trạng thái"</th><th>"Xuất bản"</th><th>"Nổi bật"</th><th>"Thứ tự"</th><th></th></tr></thead>
                <tbody>
                    {rows.get_value().into_iter().map(|p| {
                        let search = normalize_search(&format!("{} {} {}", p.title, p.category, p.tech.join(" ")));
                        let (pub_p, feat_p, id, del_id, up_id, down_id) = (p.clone(), p.clone(), p.id.clone(), p.id.clone(), p.id.clone(), p.id.clone());
                        let title = p.title.clone();
                        view! {
                            <tr style:display=move || if search.contains(&normalize_search(&query.get())) { "" } else { "none" }>
                                <td><div class="thumb">{(!p.image.is_empty()).then(|| view! { <img src=cloudinary(&p.image, 160) alt="" loading="lazy" /> })}</div></td>
                                <td class="cell-main"><div class="title-cell"><a href=format!("/admin/projects/{id}")>{p.title.clone()}</a><small>{format!("{} · {} · {}", p.locale.to_uppercase(), if p.category.is_empty() { "—".into() } else { p.category.clone() }, p.year)}</small></div></td>
                                <td class="cell-status">{status_label(&p.status, Locale::Vi).map(|l| view! { <span class="status" data-status=p.status.clone()>{l}</span> })}</td>
                                <td data-label="Xuất bản"><Switch checked=p.published label="Xuất bản" on_toggle=Callback::new(move |v| toggle(pub_p.clone(), "published", v)) /></td>
                                <td data-label="Nổi bật"><Switch checked=p.featured label="Nổi bật" on_toggle=Callback::new(move |v| toggle(feat_p.clone(), "featured", v)) /></td>
                                <td data-label="Thứ tự">
                                    <div class="row-actions" style="justify-content:flex-start">
                                        <button class="icon-btn sm" type="button" aria-label="Lên" on:click=move |_| { let id = up_id.clone(); spawn_local(async move { match admin_move_project(id, true).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } }); }><Icon name="arrow-up" /></button>
                                        <button class="icon-btn sm" type="button" aria-label="Xuống" on:click=move |_| { let id = down_id.clone(); spawn_local(async move { match admin_move_project(id, false).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } }); } style="transform:rotate(180deg)"><Icon name="arrow-up" /></button>
                                    </div>
                                </td>
                                <td class="cell-actions">
                                    <div class="row-actions">
                                        <a class="icon-btn sm" href=format!("/projects/{}", p.id) target="_blank" aria-label="Xem"><Icon name="eye" /></a>
                                        <a class="icon-btn sm" href=format!("/admin/projects/{}", p.id) aria-label="Sửa"><Icon name="wrench" /></a>
                                        <button class="icon-btn sm danger" type="button" aria-label="Xóa" on:click=move |_| {
                                            if !confirm(&format!("Xóa vĩnh viễn dự án “{title}”? Thao tác không thể hoàn tác.")) { return; }
                                            let id = del_id.clone();
                                            spawn_local(async move { match admin_delete_project(id).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } });
                                        }><Icon name="x" /></button>
                                    </div>
                                </td>
                            </tr>
                        }
                    }).collect_view()}
                </tbody>
            </table>
        </div>
        <Toast notice=notice />
    }
}

#[island]
pub fn PostsTable(posts: Vec<AdminPost>) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let query = RwSignal::new(String::new());
    let count = posts.len();
    view! {
        <div class="toolbar glass" style="position:static">
            <div class="toolbar-row">
                <label class="search"><Icon name="search" /><input type="search" placeholder="Tìm bài viết…" prop:value=query on:input=move |ev| query.set(event_target_value(&ev)) /></label>
                <span class="result-count">{format!("{count:02} bài viết")}</span>
                <a class="btn btn-primary btn-sm" href="/admin/posts/new"><Icon name="sparkles" />"Bài viết mới"</a>
            </div>
        </div>
        <div class="table-wrap-admin">
            <table class="table cards">
                <thead><tr><th>"Bài viết"</th><th>"Chuyên mục"</th><th>"Ngày"</th><th>"Lượt xem"</th><th>"Xuất bản"</th><th></th></tr></thead>
                <tbody>
                    {posts.into_iter().map(|p| {
                        let search = normalize_search(&format!("{} {} {}", p.title, p.category, p.slug));
                        let (id, title, slug) = (p.id.clone(), p.title.clone(), p.slug.clone());
                        let toggle_id = p.id.clone();
                        let published = RwSignal::new(p.published);
                        view! {
                            <tr style:display=move || if search.contains(&normalize_search(&query.get())) { "" } else { "none" }>
                                <td class="cell-main"><div class="title-cell"><a href=format!("/admin/posts/{id}")>{p.title.clone()}</a><small>{format!("/{} · {}", p.slug, p.layout)}</small></div></td>
                                <td data-label="Chuyên mục">{if p.category.is_empty() { "—".to_string() } else { p.category.clone() }}</td>
                                <td class="mono" data-label="Ngày" style="font-size:12.5px">{format_date(&p.created_at, Locale::Vi)}</td>
                                <td class="mono" data-label="Lượt xem">{p.views}</td>
                                <td data-label="Xuất bản">
                                    <label class="switch">
                                        <input type="checkbox" prop:checked=published aria-label="Xuất bản" on:change=move |ev| {
                                            let value = event_target_checked(&ev);
                                            published.set(value);
                                            let id = toggle_id.clone();
                                            spawn_local(async move {
                                                let result = async {
                                                    let mut post = crate::api_admin::admin_get_post(id).await?.ok_or_else(|| ServerFnError::new("Không tìm thấy bài viết."))?;
                                                    post.published = value;
                                                    admin_save_post(post).await
                                                }.await;
                                                match result { Ok(p) => notice.set(ok(format!("{} “{}”", if value { "Đã xuất bản" } else { "Đã chuyển về nháp" }, p.title))), Err(e) => { published.set(!value); notice.set(err(e)) } }
                                            });
                                        } />
                                        <span class="track"></span>
                                    </label>
                                </td>
                                <td class="cell-actions">
                                    <div class="row-actions">
                                        <a class="icon-btn sm" href=format!("/posts/{slug}") target="_blank" aria-label="Xem"><Icon name="eye" /></a>
                                        <a class="icon-btn sm" href=format!("/admin/posts/{}", p.id) aria-label="Sửa"><Icon name="wrench" /></a>
                                        <button class="icon-btn sm danger" type="button" aria-label="Xóa" on:click=move |_| {
                                            if !confirm(&format!("Xóa vĩnh viễn bài viết “{title}”? Thao tác không thể hoàn tác.")) { return; }
                                            let id = id.clone();
                                            spawn_local(async move { match admin_delete_post(id).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } });
                                        }><Icon name="x" /></button>
                                    </div>
                                </td>
                            </tr>
                        }
                    }).collect_view()}
                </tbody>
            </table>
        </div>
        <Toast notice=notice />
    }
}
