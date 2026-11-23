//! Project and post editors.
use crate::api_admin::{admin_save_post, admin_save_project};
use crate::islands::admin::common::{err, go, ok, Notice, Toast, UploadButton};
use crate::model::{AdminPost, AdminProject, Responsibility, ResultItem};
use crate::text::cloudinary;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

fn lines(text: &str) -> Vec<String> {
    text.lines().map(str::trim).filter(|l| !l.is_empty()).map(str::to_string).collect()
}

#[component]
fn Field(#[prop(into)] label: String, value: RwSignal<String>, #[prop(optional)] multiline: bool, #[prop(optional, into)] hint: String, #[prop(optional)] rows: Option<u32>) -> impl IntoView {
    let id = format!("f-{}", crate::text::slugify(&label));
    view! {
        <div class="field">
            <label for=id.clone()>{label}</label>
            {if multiline {
                view! { <textarea id=id class="textarea" rows=rows.unwrap_or(4) style="min-height:auto" prop:value=value on:input=move |ev| value.set(event_target_value(&ev))></textarea> }.into_any()
            } else {
                view! { <input id=id class="input" prop:value=value on:input=move |ev| value.set(event_target_value(&ev)) /> }.into_any()
            }}
            {(!hint.is_empty()).then(|| view! { <span class="hint">{hint}</span> })}
        </div>
    }
}

#[component]
fn Toggle(#[prop(into)] label: String, value: RwSignal<bool>) -> impl IntoView {
    view! {
        <label class="switch"><input type="checkbox" prop:checked=value on:change=move |ev| value.set(event_target_checked(&ev)) /><span class="track"></span>{label}</label>
    }
}

/// Rich-text area backed by Quill; `html` mirrors the editor content on demand.
#[component]
fn RichText(initial: String, editor: StoredValue<Option<wasm_bindgen::JsValue>, LocalStorage>, notice: RwSignal<Option<Notice>>) -> impl IntoView {
    let host = NodeRef::<leptos::html::Div>::new();
    let fallback = RwSignal::new(false);
    #[cfg(feature = "hydrate")]
    {
        let initial = initial.clone();
        Effect::new(move |_| {
            let Some(el) = host.get() else { return };
            match crate::islands::admin::common::mount_quill(&el, &initial, notice) {
                Some(quill) => editor.set_value(Some(quill)),
                None => fallback.set(true),
            }
        });
    }
    let _ = (&initial, notice, editor);
    view! {
        <div class="quill-host"><div node_ref=host></div></div>
        <Show when=move || fallback.get()><p class="alert">"Không tải được trình soạn thảo. Kiểm tra kết nối và tải lại trang."</p></Show>
    }
}

#[cfg(feature = "hydrate")]
fn editor_html(editor: StoredValue<Option<wasm_bindgen::JsValue>, LocalStorage>) -> Option<String> {
    editor.with_value(|e| e.as_ref().and_then(crate::islands::admin::common::quill_html))
}
#[cfg(not(feature = "hydrate"))]
fn editor_html(_: StoredValue<Option<wasm_bindgen::JsValue>, LocalStorage>) -> Option<String> { None }

#[component]
fn ImageManager(images: RwSignal<Vec<String>>, notice: RwSignal<Option<Notice>>) -> impl IntoView {
    let remove = move |i: usize| images.update(|v| { if i < v.len() { v.remove(i); } });
    let first = move |i: usize| images.update(|v| { if i < v.len() { let item = v.remove(i); v.insert(0, item); } });
    let url = RwSignal::new(String::new());
    view! {
        <div class="image-manager">
            {move || images.get().into_iter().enumerate().map(|(i, src)| view! {
                <div class="image-tile">
                    <img src=cloudinary(&src, 320) alt="" loading="lazy" />
                    {(i == 0).then(|| view! { <span class="tag">"BÌA"</span> })}
                    <div class="tools">
                        <button type="button" title="Đặt làm ảnh bìa" on:click=move |_| first(i)><Icon name="star" /></button>
                        <button type="button" title="Gỡ ảnh" on:click=move |_| remove(i)><Icon name="x" /></button>
                    </div>
                </div>
            }).collect_view()}
        </div>
        <div class="cluster">
            <UploadButton label="Tải ảnh lên" endpoint="/api/admin/upload-image" multiple=true notice=notice
                on_uploaded=Callback::new(move |u: String| images.update(|v| v.push(u))) />
            <input class="input" style="flex:1;min-width:220px" placeholder="…hoặc dán URL Cloudinary" prop:value=url on:input=move |ev| url.set(event_target_value(&ev)) />
            <button class="btn btn-sm" type="button" on:click=move |_| { let u = url.get_untracked(); if !u.trim().is_empty() { images.update(|v| v.push(u.trim().to_string())); url.set(String::new()); } }>"Thêm"</button>
        </div>
        <span class="hint">"Ảnh đầu tiên là ảnh bìa. Ảnh lưu trên Cloudinary (thư mục web_vando/images)."</span>
    }
}

#[island]
pub fn ProjectEditor(project: AdminProject) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let saving = RwSignal::new(false);
    let is_new = project.id.is_empty();
    let id = RwSignal::new(project.id.clone());
    let s = |v: &str| RwSignal::new(v.to_string());
    let (title, subtitle, quote, year, role, highlight, kind, category) = (s(&project.title), s(&project.subtitle), s(&project.overview_quote), s(&project.year), s(&project.role), s(&project.highlight), s(&project.project_type), s(&project.category));
    let (visuals, video_title, youtube, link, repo, status, locale) = (s(&project.visuals_title), s(&project.video_title), s(&project.youtube_url), s(&project.link), s(&project.repo), s(&project.status), s(if project.locale.is_empty() { "vi" } else { &project.locale }));
    let features = s(&project.features.join("\n"));
    let tech = s(&project.tech.join("\n"));
    let mut all_images = Vec::new();
    if !project.image.is_empty() { all_images.push(project.image.clone()); }
    for i in &project.images { if !all_images.contains(i) { all_images.push(i.clone()); } }
    let images = RwSignal::new(all_images);
    let published = RwSignal::new(project.published);
    let featured = RwSignal::new(project.featured);
    let show_video = RwSignal::new(project.show_video_demo);
    let responsibilities = RwSignal::new(project.responsibilities.clone());
    let results = RwSignal::new(project.results.clone());
    let editor = StoredValue::new_local(None::<wasm_bindgen::JsValue>);
    let description = project.description.clone();
    let original_description = StoredValue::new(project.description.clone());
    let order = project.order;

    let save = move |_| {
        if saving.get_untracked() { return; }
        saving.set(true);
        let imgs = images.get_untracked();
        let input = AdminProject {
            id: id.get_untracked(), locale: locale.get_untracked(), title: title.get_untracked(), subtitle: subtitle.get_untracked(),
            overview_quote: quote.get_untracked(), year: year.get_untracked(), role: role.get_untracked(), highlight: highlight.get_untracked(),
            project_type: kind.get_untracked(), category: category.get_untracked(),
            description: editor_html(editor).unwrap_or_else(|| original_description.get_value()),
            visuals_title: visuals.get_untracked(), video_title: video_title.get_untracked(), features: lines(&features.get_untracked()), tech: lines(&tech.get_untracked()),
            image: imgs.first().cloned().unwrap_or_default(), images: imgs.iter().skip(1).cloned().collect(), show_video_demo: show_video.get_untracked(),
            published: published.get_untracked(), featured: featured.get_untracked(), status: status.get_untracked(), youtube_url: youtube.get_untracked(),
            link: link.get_untracked(), repo: repo.get_untracked(), order, responsibilities: responsibilities.get_untracked(), results: results.get_untracked(), updated_at: String::new(),
        };
        spawn_local(async move {
            match admin_save_project(input).await {
                Ok(saved) => {
                    notice.set(ok(format!("Đã lưu “{}”.", saved.title)));
                    if is_new { go(&format!("/admin/projects/{}", saved.id)); }
                    id.set(saved.id);
                }
                Err(e) => notice.set(err(e)),
            }
            saving.set(false);
        });
    };

    view! {
        <div class="editor-layout">
            <div class="stack" style="--gap:16px">
                <section class="card fieldset">
                    <h2>"Thông tin chính"</h2>
                    <Field label="Tiêu đề" value=title />
                    <Field label="Phụ đề" value=subtitle multiline=true rows=2 />
                    <Field label="Trích dẫn tổng quan" value=quote multiline=true rows=3 hint="Hiển thị nổi bật đầu mục Tổng quan." />
                </section>
                <section class="card fieldset">
                    <h2>"Nội dung chi tiết"</h2>
                    <span class="hint">"Dùng Heading 2/3 để chia mục — mỗi heading thành một mục riêng trên trang dự án (ví dụ: Kiến trúc hệ thống, Thiết kế phần cứng, Phần mềm)."</span>
                    <RichText initial=description editor=editor notice=notice />
                </section>
                <section class="card fieldset">
                    <h2>"Hình ảnh"</h2>
                    <Field label="Tiêu đề thư viện ảnh" value=visuals hint="Để trống: tự dùng “PCB Gallery” cho dự án phần cứng." />
                    <ImageManager images=images notice=notice />
                </section>
                <section class="card fieldset">
                    <h2>"Tính năng & công nghệ"</h2>
                    <div class="form-row">
                        <Field label="Tính năng (mỗi dòng một mục)" value=features multiline=true rows=8 />
                        <Field label="Công nghệ (mỗi dòng một mục)" value=tech multiline=true rows=8 />
                    </div>
                </section>
                <section class="card fieldset">
                    <h2>"Quá trình phát triển"</h2>
                    <div class="repeater">
                        {move || responsibilities.get().into_iter().enumerate().map(|(i, r)| view! {
                            <div class="repeater-row">
                                <input class="input" placeholder="Tiêu đề" prop:value=r.title.clone() on:change=move |ev| responsibilities.update(|v| v[i].title = event_target_value(&ev)) />
                                <textarea class="textarea" style="min-height:48px" rows="2" placeholder="Mô tả" prop:value=r.subtitle.clone() on:change=move |ev| responsibilities.update(|v| v[i].subtitle = event_target_value(&ev))></textarea>
                                <select class="select" prop:value=r.icon.clone() on:change=move |ev| responsibilities.update(|v| v[i].icon = event_target_value(&ev))>
                                    {["cpu", "layers", "zap", "code", "wifi", "shieldcheck", "wrench", "sparkles", "terminal", "chart"].into_iter().map(|icon| view! { <option value=icon>{icon}</option> }).collect_view()}
                                </select>
                                <button class="icon-btn sm danger" type="button" aria-label="Xóa dòng" on:click=move |_| responsibilities.update(|v| { v.remove(i); })><Icon name="x" /></button>
                            </div>
                        }).collect_view()}
                    </div>
                    <button class="btn btn-sm" type="button" on:click=move |_| responsibilities.update(|v| v.push(Responsibility { icon: "cpu".into(), ..Default::default() }))>"+ Thêm bước"</button>
                </section>
                <section class="card fieldset">
                    <h2>"Kết quả"</h2>
                    <div class="repeater">
                        {move || results.get().into_iter().enumerate().map(|(i, r)| view! {
                            <div class="repeater-row two">
                                <input class="input" placeholder="Số liệu" prop:value=r.number.clone() on:change=move |ev| results.update(|v| v[i].number = event_target_value(&ev)) />
                                <input class="input" placeholder="Mô tả" prop:value=r.label.clone() on:change=move |ev| results.update(|v| v[i].label = event_target_value(&ev)) />
                                <button class="icon-btn sm danger" type="button" aria-label="Xóa dòng" on:click=move |_| results.update(|v| { v.remove(i); })><Icon name="x" /></button>
                            </div>
                        }).collect_view()}
                    </div>
                    <button class="btn btn-sm" type="button" on:click=move |_| results.update(|v| v.push(ResultItem::default()))>"+ Thêm kết quả"</button>
                </section>
            </div>
            <aside class="editor-side">
                <section class="card fieldset">
                    <h2>"Xuất bản"</h2>
                    <Toggle label="Công khai trên website" value=published />
                    <Toggle label="Dự án nổi bật" value=featured />
                    <div class="field"><label>"Trạng thái"</label>
                        <select class="select" prop:value=status on:change=move |ev| status.set(event_target_value(&ev))>
                            <option value="">"Không ghi"</option><option value="completed">"Hoàn thành"</option><option value="in-development">"Đang phát triển"</option><option value="prototype">"Nguyên mẫu"</option><option value="research">"Nghiên cứu"</option>
                        </select>
                    </div>
                    <div class="field"><label>"Ngôn ngữ"</label>
                        <select class="select" prop:value=locale on:change=move |ev| locale.set(event_target_value(&ev)) disabled=!is_new><option value="vi">"Tiếng Việt"</option><option value="en">"English"</option></select>
                    </div>
                    <button class="btn btn-primary" type="button" on:click=save disabled=move || saving.get()>{move || if saving.get() { "Đang lưu…" } else { "Lưu dự án" }}<Icon name="check" /></button>
                    {move || (!id.get().is_empty()).then(|| view! { <a class="btn btn-sm" href=format!("/projects/{}", id.get()) target="_blank"><Icon name="eye" />"Xem trang dự án"</a> })}
                </section>
                <section class="card fieldset">
                    <h2>"Thông số"</h2>
                    <Field label="Danh mục" value=category hint="Ví dụ: Hardware · Embedded & IoT — dùng để phân lĩnh vực." />
                    <Field label="Thời gian" value=year />
                    <Field label="Vai trò" value=role />
                    <Field label="Loại dự án" value=kind />
                    <Field label="Điểm nhấn" value=highlight multiline=true rows=2 />
                </section>
                <section class="card fieldset">
                    <h2>"Liên kết & video"</h2>
                    <Field label="Repository (GitHub)" value=repo />
                    <Field label="Tài nguyên khác" value=link />
                    <Field label="YouTube" value=youtube />
                    <Field label="Tiêu đề video" value=video_title />
                    <Toggle label="Hiển thị video demo" value=show_video />
                </section>
            </aside>
        </div>
        <Toast notice=notice />
    }
}

#[island]
pub fn PostEditor(post: AdminPost) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let saving = RwSignal::new(false);
    let is_new = post.id.is_empty();
    let id = RwSignal::new(post.id.clone());
    let s = |v: &str| RwSignal::new(v.to_string());
    let (title, slug, excerpt, category, cover, pdf) = (s(&post.title), s(&post.slug), s(&post.excerpt), s(&post.category), s(&post.cover_image), s(&post.pdf_url));
    let (seo_title, seo_description, seo_keywords, layout) = (s(&post.seo_title), s(&post.seo_description), s(&post.seo_keywords), s(if post.layout.is_empty() { "article" } else { &post.layout }));
    let locale = s(if post.locale.is_empty() { "vi" } else { &post.locale });
    let date = s(post.created_at.get(..10).unwrap_or(""));
    let published = RwSignal::new(post.published);
    let editor = StoredValue::new_local(None::<wasm_bindgen::JsValue>);
    let original = StoredValue::new(post.content.clone());
    let content = post.content.clone();
    let save = move |_| {
        if saving.get_untracked() { return; }
        saving.set(true);
        let day = date.get_untracked();
        let input = AdminPost {
            id: id.get_untracked(), locale: locale.get_untracked(), title: title.get_untracked(), slug: slug.get_untracked(), excerpt: excerpt.get_untracked(),
            content: editor_html(editor).unwrap_or_else(|| original.get_value()), published: published.get_untracked(), category: category.get_untracked(),
            layout: layout.get_untracked(), cover_image: cover.get_untracked(), pdf_url: pdf.get_untracked(), seo_title: seo_title.get_untracked(),
            seo_description: seo_description.get_untracked(), seo_keywords: seo_keywords.get_untracked(), views: 0, likes: 0,
            created_at: if day.len() == 10 { format!("{day}T09:00:00+07:00") } else { String::new() }, updated_at: String::new(),
        };
        spawn_local(async move {
            match admin_save_post(input).await {
                Ok(saved) => {
                    notice.set(ok(format!("Đã lưu “{}”.", saved.title)));
                    slug.set(saved.slug.clone());
                    if is_new { go(&format!("/admin/posts/{}", saved.id)); }
                    id.set(saved.id);
                }
                Err(e) => notice.set(err(e)),
            }
            saving.set(false);
        });
    };
    view! {
        <div class="editor-layout">
            <div class="stack" style="--gap:16px">
                <section class="card fieldset">
                    <Field label="Tiêu đề" value=title />
                    <Field label="Tóm tắt" value=excerpt multiline=true rows=3 />
                </section>
                <section class="card fieldset">
                    <h2>"Nội dung"</h2>
                    <RichText initial=content editor=editor notice=notice />
                </section>
                <section class="card fieldset">
                    <h2>"SEO"</h2>
                    <Field label="Tiêu đề SEO" value=seo_title />
                    <Field label="Mô tả SEO" value=seo_description multiline=true rows=2 />
                    <Field label="Từ khóa" value=seo_keywords />
                </section>
            </div>
            <aside class="editor-side">
                <section class="card fieldset">
                    <h2>"Xuất bản"</h2>
                    <Toggle label="Công khai" value=published />
                    <Field label="Đường dẫn (slug)" value=slug hint="Để trống để tạo tự động từ tiêu đề." />
                    <div class="field"><label for="post-date">"Ngày đăng"</label><input id="post-date" class="input" type="date" prop:value=date on:input=move |ev| date.set(event_target_value(&ev)) /></div>
                    <div class="field"><label>"Bố cục"</label><select class="select" prop:value=layout on:change=move |ev| layout.set(event_target_value(&ev))><option value="article">"Bài viết"</option><option value="tutorial">"Hướng dẫn"</option></select></div>
                    <div class="field"><label>"Ngôn ngữ"</label><select class="select" prop:value=locale on:change=move |ev| locale.set(event_target_value(&ev)) disabled=!is_new><option value="vi">"Tiếng Việt"</option><option value="en">"English"</option></select></div>
                    <Field label="Chuyên mục" value=category />
                    <button class="btn btn-primary" type="button" on:click=save disabled=move || saving.get()>{move || if saving.get() { "Đang lưu…" } else { "Lưu bài viết" }}<Icon name="check" /></button>
                    {move || (!id.get().is_empty() && published.get()).then(|| view! { <a class="btn btn-sm" href=format!("/posts/{}", slug.get()) target="_blank"><Icon name="eye" />"Xem bài viết"</a> })}
                </section>
                <section class="card fieldset">
                    <h2>"Ảnh bìa & tài liệu"</h2>
                    {move || (!cover.get().is_empty()).then(|| view! { <div class="image-tile"><img src=cloudinary(&cover.get(), 480) alt="" /></div> })}
                    <div class="cluster">
                        <UploadButton label="Tải ảnh bìa" endpoint="/api/admin/upload-image" notice=notice on_uploaded=Callback::new(move |u: String| cover.set(u)) />
                        {move || (!cover.get().is_empty()).then(|| view! { <button class="btn btn-sm" type="button" on:click=move |_| cover.set(String::new())>"Gỡ"</button> })}
                    </div>
                    <Field label="PDF đính kèm" value=pdf />
                    <UploadButton label="Tải PDF lên" endpoint="/api/admin/upload-file" accept="application/pdf" notice=notice on_uploaded=Callback::new(move |u: String| pdf.set(u)) />
                </section>
            </aside>
        </div>
        <Toast notice=notice />
    }
}
