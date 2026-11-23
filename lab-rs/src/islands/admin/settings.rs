//! Site content settings, account password, media library and activity pruning.
use crate::api_admin::{admin_change_password, admin_delete_media, admin_media, admin_prune_activities, admin_save_content};
use crate::islands::admin::common::{confirm, err, ok, reload, Notice, Toast, UploadButton};
use crate::model::{ContentSettings, MediaItem};
use crate::text::cloudinary;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

#[island]
pub fn ContentForm(settings: ContentSettings) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let state = RwSignal::new(settings);
    let saving = RwSignal::new(false);
    macro_rules! text {
        ($label:expr, $field:ident) => {
            view! { <div class="field"><label>{$label}</label><input class="input" prop:value=move || state.with(|s| s.$field.clone()) on:input=move |ev| state.update(|s| s.$field = event_target_value(&ev)) /></div> }
        };
        ($label:expr, $field:ident, area) => {
            view! { <div class="field"><label>{$label}</label><textarea class="textarea" rows="3" style="min-height:auto" prop:value=move || state.with(|s| s.$field.clone()) on:input=move |ev| state.update(|s| s.$field = event_target_value(&ev))></textarea></div> }
        };
    }
    let save = move |_| {
        saving.set(true);
        let input = state.get_untracked();
        spawn_local(async move {
            match admin_save_content(input).await { Ok(saved) => { state.set(saved); notice.set(ok("Đã lưu nội dung trang.")) } Err(e) => notice.set(err(e)) }
            saving.set(false);
        });
    };
    view! {
        <div class="editor-layout">
            <div class="stack" style="--gap:16px">
                <section class="card fieldset"><h2>"Thương hiệu"</h2>{text!("Tên website", portfolio_name)}{text!("Khẩu hiệu (footer)", portfolio_tagline)}</section>
                <section class="card fieldset"><h2>"Hero — Tiếng Việt"</h2>
                    {text!("Tiêu đề (xuống dòng = dòng mới)", hero_headline_vi, area)}{text!("Mô tả", hero_description_vi, area)}
                    <div class="form-row">{text!("Nút chính", hero_primary_label_vi)}{text!("Nút phụ", hero_secondary_label_vi)}</div>
                </section>
                <section class="card fieldset"><h2>"Hero — English"</h2>
                    {text!("Headline", hero_headline_en, area)}{text!("Description", hero_description_en, area)}
                    <div class="form-row">{text!("Primary button", hero_primary_label_en)}{text!("Secondary button", hero_secondary_label_en)}</div>
                </section>
                <section class="card fieldset"><h2>"SEO"</h2>{text!("Meta title", meta_title)}{text!("Meta description", meta_description, area)}</section>
            </div>
            <aside class="editor-side">
                <section class="card fieldset"><h2>"Liên hệ công khai"</h2>{text!("Email", email)}{text!("GitHub", github)}{text!("URL nút phụ (để trống = GitHub)", hero_secondary_url)}</section>
                <section class="card fieldset"><h2>"Google Analytics"</h2>
                    <label class="switch"><input type="checkbox" prop:checked=move || state.with(|s| s.analytics_enabled) on:change=move |ev| state.update(|s| s.analytics_enabled = event_target_checked(&ev)) /><span class="track"></span>"Bật Analytics"</label>
                    {text!("Measurement ID", analytics_id)}
                </section>
                <button class="btn btn-primary" type="button" on:click=save disabled=move || saving.get()>{move || if saving.get() { "Đang lưu…" } else { "Lưu thay đổi" }}<Icon name="check" /></button>
            </aside>
        </div>
        <Toast notice=notice />
    }
}

#[island]
pub fn PasswordForm() -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let (current, new, confirm_pw) = (RwSignal::new(String::new()), RwSignal::new(String::new()), RwSignal::new(String::new()));
    let busy = RwSignal::new(false);
    let submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        busy.set(true);
        let (c, n, k) = (current.get_untracked(), new.get_untracked(), confirm_pw.get_untracked());
        spawn_local(async move {
            match admin_change_password(c, n, k).await {
                Ok(()) => { current.set(String::new()); new.set(String::new()); confirm_pw.set(String::new()); notice.set(ok("Đã đổi mật khẩu. Các phiên đăng nhập khác đã bị đăng xuất.")) }
                Err(e) => notice.set(err(e)),
            }
            busy.set(false);
        });
    };
    view! {
        <form class="card fieldset" on:submit=submit style="max-width:520px">
            <h2>"Đổi mật khẩu quản trị"</h2>
            <div class="field"><label for="pw-current">"Mật khẩu hiện tại"</label><input id="pw-current" class="input" type="password" autocomplete="current-password" prop:value=current on:input=move |ev| current.set(event_target_value(&ev)) /></div>
            <div class="field"><label for="pw-new">"Mật khẩu mới (tối thiểu 6 ký tự)"</label><input id="pw-new" class="input" type="password" autocomplete="new-password" prop:value=new on:input=move |ev| new.set(event_target_value(&ev)) /></div>
            <div class="field"><label for="pw-confirm">"Nhập lại mật khẩu mới"</label><input id="pw-confirm" class="input" type="password" autocomplete="new-password" prop:value=confirm_pw on:input=move |ev| confirm_pw.set(event_target_value(&ev)) /></div>
            <button class="btn btn-primary" type="submit" disabled=move || busy.get()>"Cập nhật mật khẩu"</button>
            <Toast notice=notice />
        </form>
    }
}

#[island]
pub fn MediaLibrary() -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let items = RwSignal::new(None::<Vec<MediaItem>>);
    let cursor = RwSignal::new(None::<String>);
    let load = move |next: Option<String>| spawn_local(async move {
        match admin_media(next.clone()).await {
            Ok((list, more)) => { items.update(|v| match (v, next.is_some()) { (Some(v), true) => v.extend(list), (slot, _) => *slot = Some(list) }); cursor.set(more); }
            Err(e) => { notice.set(err(e)); items.update(|v| if v.is_none() { *v = Some(Vec::new()) }); }
        }
    });
    Effect::new(move |_| load(None));
    view! {
        <div class="cluster" style="margin-bottom:16px">
            <UploadButton label="Tải ảnh lên" endpoint="/api/admin/upload-image" multiple=true notice=notice on_uploaded=Callback::new(move |_u: String| { notice.set(ok("Đã tải ảnh lên.")); load(None); }) />
            <span class="hint">"Ảnh đang được dùng trong dự án/bài viết không thể xóa."</span>
        </div>
        {move || match items.get() {
            None => view! { <div class="media-grid">{(0..8).map(|_| view! { <div class="card skeleton-card"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div> }).collect_view()}</div> }.into_any(),
            Some(list) => view! {
                <div class="media-grid">
                    {list.into_iter().map(|m| {
                        let (url, copy_url, pid) = (m.url.clone(), m.url.clone(), m.public_id.clone());
                        let used = !m.used_by.is_empty();
                        let used_text = m.used_by.join(", ");
                        view! {
                            <div class="card media-item">
                                <a class="preview" href=url target="_blank"><img src=cloudinary(&m.url, 360) alt="" loading="lazy" /></a>
                                <div class="meta">
                                    <code title=m.public_id.clone()>{m.public_id.rsplit('/').next().unwrap_or("").to_string()}</code>
                                    <span class="muted">{format!("{}×{} · {} KB", m.width, m.height, m.bytes / 1024)}</span>
                                    {used.then(|| view! { <span class="chip" data-tone="green" title=used_text.clone() style="width:fit-content">"Đang dùng"</span> })}
                                    <div class="cluster" style="--gap:6px">
                                        <button class="btn btn-sm" type="button" on:click=move |_| {
                                            #[cfg(feature = "hydrate")]
                                            if let Some(w) = web_sys::window() {
                                                let clipboard = js_sys::Reflect::get(&w.navigator(), &"clipboard".into()).ok();
                                                if let Some(c) = clipboard { if let Some(f) = js_sys::Reflect::get(&c, &"writeText".into()).ok().and_then(|f| wasm_bindgen::JsCast::dyn_into::<js_sys::Function>(f).ok()) { let _ = f.call1(&c, &copy_url.clone().into()); } }
                                            }
                                            let _ = &copy_url;
                                            notice.set(ok("Đã sao chép URL."));
                                        }><Icon name="copy" />"URL"</button>
                                        {(!used).then(|| view! {
                                            <button class="icon-btn sm danger" type="button" aria-label="Xóa ảnh" on:click=move |_| {
                                                if !confirm("Xóa vĩnh viễn ảnh này khỏi Cloudinary?") { return; }
                                                let id = pid.clone();
                                                spawn_local(async move { match admin_delete_media(id).await { Ok(()) => load(None), Err(e) => notice.set(err(e)) } });
                                            }><Icon name="x" /></button>
                                        })}
                                    </div>
                                </div>
                            </div>
                        }
                    }).collect_view()}
                </div>
                {move || cursor.get().map(|next| view! { <div class="grid-load"><button class="btn" type="button" on:click=move |_| load(Some(next.clone()))>"Tải thêm"</button></div> })}
            }.into_any(),
        }}
        <Toast notice=notice />
    }
}

#[island]
pub fn PruneActivities() -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    view! {
        <button class="btn btn-sm" type="button" on:click=move |_| {
            if !confirm("Xóa các mục nhật ký cũ hơn 30 ngày?") { return; }
            spawn_local(async move { match admin_prune_activities().await { Ok(n) => { notice.set(ok(format!("Đã xóa {n} mục."))); reload() } Err(e) => notice.set(err(e)) } });
        }>"Dọn nhật ký > 30 ngày"</button>
        <Toast notice=notice />
    }
}
