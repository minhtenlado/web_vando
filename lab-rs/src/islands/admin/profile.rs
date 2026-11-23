//! Profile, education/certifications/languages and work experience editors.
use crate::api_admin::{admin_delete_experience, admin_move_experience, admin_profile, admin_save_credentials, admin_save_experience, admin_save_profile};
use crate::islands::admin::common::{confirm, err, go, ok, reload, Notice, Toast, UploadButton};
use crate::islands::admin::editors::{Field, ImageManager};
use crate::model::{AdminExperience, CertificationItem, Credentials, EducationItem, LanguageItem, ProfileForm, SocialLink};
use crate::text::cloudinary;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

fn lines(text: &str) -> Vec<String> {
    text.lines().map(str::trim).filter(|l| !l.is_empty()).map(str::to_string).collect()
}

/// Input for one field of a list row. Typing writes into the list without re-rendering it, so focus
/// and caret stay where they are; only adding or removing rows re-renders the list.
#[component]
fn ItemInput(#[prop(into)] placeholder: String, value: String, set: Callback<String>, #[prop(optional)] multiline: bool) -> impl IntoView {
    if multiline {
        view! { <textarea class="textarea" rows="3" style="min-height:auto" placeholder=placeholder.clone() aria-label=placeholder prop:value=value on:input=move |ev| set.run(event_target_value(&ev))></textarea> }.into_any()
    } else {
        view! { <input class="input" placeholder=placeholder.clone() aria-label=placeholder prop:value=value on:input=move |ev| set.run(event_target_value(&ev)) /> }.into_any()
    }
}

#[component]
fn ItemSwitch(#[prop(into)] label: String, checked: bool, set: Callback<bool>) -> impl IntoView {
    view! { <label class="switch"><input type="checkbox" prop:checked=checked on:change=move |ev| set.run(event_target_checked(&ev)) /><span class="track"></span>{label}</label> }
}

#[component]
fn RemoveButton(on_remove: Callback<()>) -> impl IntoView {
    view! { <button class="icon-btn sm danger" type="button" aria-label="Xóa dòng" on:click=move |_| on_remove.run(())><Icon name="x" /></button> }
}

#[island(lazy)]
pub fn ProfileEditor(profile: ProfileForm) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let saving = RwSignal::new(false);
    let loading = RwSignal::new(false);
    let locale = RwSignal::new(if profile.locale == "en" { "en".to_string() } else { "vi".to_string() });
    let s = |v: &str| RwSignal::new(v.to_string());
    let (name, role, tagline, location) = (s(&profile.name), s(&profile.role), s(&profile.tagline), s(&profile.location));
    let (phone, website, linkedin, avatar) = (s(&profile.phone), s(&profile.website), s(&profile.linkedin), s(&profile.avatar));
    let socials = RwSignal::new(profile.socials.clone());
    let apply = move |p: ProfileForm| {
        name.set(p.name); role.set(p.role); tagline.set(p.tagline); location.set(p.location);
        phone.set(p.phone); website.set(p.website); linkedin.set(p.linkedin); avatar.set(p.avatar);
        socials.set(p.socials);
    };
    let switch_locale = move |next: &'static str| {
        if locale.get_untracked() == next || loading.get_untracked() { return; }
        loading.set(true);
        spawn_local(async move {
            match admin_profile(next.to_string()).await {
                Ok(p) => { locale.set(next.to_string()); apply(p) }
                Err(e) => notice.set(err(e)),
            }
            loading.set(false);
        });
    };
    let save = move |_| {
        if saving.get_untracked() { return; }
        saving.set(true);
        let input = ProfileForm {
            locale: locale.get_untracked(), name: name.get_untracked(), role: role.get_untracked(), tagline: tagline.get_untracked(),
            location: location.get_untracked(), phone: phone.get_untracked(), website: website.get_untracked(), linkedin: linkedin.get_untracked(),
            avatar: avatar.get_untracked(), socials: socials.get_untracked(),
        };
        spawn_local(async move {
            match admin_save_profile(input).await {
                Ok(p) => { apply(p); notice.set(ok("Đã lưu hồ sơ.")) }
                Err(e) => notice.set(err(e)),
            }
            saving.set(false);
        });
    };

    view! {
        <div class="editor-layout">
            <div class="stack" style="--gap:16px">
                <section class="card fieldset" aria-busy=move || loading.get().to_string()>
                    <h2>"Thông tin cá nhân"</h2>
                    <div class="form-row"><Field label="Họ và tên" value=name /><Field label="Vai trò" value=role /></div>
                    <Field label="Khẩu hiệu" value=tagline />
                    <div class="form-row"><Field label="Địa điểm" value=location /><Field label="Số điện thoại" value=phone /></div>
                    <div class="form-row"><Field label="Website" value=website /><Field label="LinkedIn" value=linkedin /></div>
                    <span class="hint">"Email và GitHub công khai dùng chung cho cả hai ngôn ngữ, sửa trong "<a href="/admin/content">"Nội dung trang"</a>"."</span>
                </section>
                <section class="card fieldset">
                    <h2>"Mạng xã hội"</h2>
                    <div class="repeater">
                        {move || socials.with(|list| list.iter().cloned().enumerate().map(|(i, item)| {
                            let edit = move |f: fn(&mut SocialLink, String)| Callback::new(move |v: String| socials.update_untracked(|l| if let Some(x) = l.get_mut(i) { f(x, v) }));
                            view! {
                                <div class="repeater-row social">
                                    <ItemInput placeholder="Nền tảng" value=item.platform set=edit(|x, v| x.platform = v) />
                                    <ItemInput placeholder="Liên kết" value=item.url set=edit(|x, v| x.url = v) />
                                    <ItemSwitch label="Hiện" checked=item.enabled set=Callback::new(move |on: bool| socials.update_untracked(|l| if let Some(x) = l.get_mut(i) { x.enabled = on })) />
                                    <RemoveButton on_remove=Callback::new(move |_| socials.update(|l| { if i < l.len() { l.remove(i); } })) />
                                </div>
                            }
                        }).collect_view())}
                    </div>
                    <button class="btn btn-sm" type="button" on:click=move |_| socials.update(|l| l.push(SocialLink { enabled: true, ..Default::default() }))>"+ Thêm liên kết"</button>
                </section>
            </div>
            <aside class="editor-side">
                <section class="card fieldset">
                    <h2>"Ngôn ngữ hồ sơ"</h2>
                    <div class="tabs filters">
                        {[("vi", "Tiếng Việt"), ("en", "English")].into_iter().map(|(key, label)| view! {
                            <button class="filter" type="button" aria-pressed=move || (locale.get() == key).to_string() disabled=move || loading.get() on:click=move |_| switch_locale(key)>{label}</button>
                        }).collect_view()}
                    </div>
                    <span class="hint">"Mỗi ngôn ngữ có một hồ sơ riêng. Lưu trước khi chuyển ngôn ngữ."</span>
                    <button class="btn btn-primary" type="button" on:click=save disabled=move || saving.get() || loading.get()>{move || if saving.get() { "Đang lưu…" } else { "Lưu hồ sơ" }}<Icon name="check" /></button>
                </section>
                <section class="card fieldset">
                    <h2>"Ảnh đại diện"</h2>
                    <div class="avatar-preview">
                        {move || {
                            let src = avatar.get();
                            if src.is_empty() { view! { <span class="muted">"Chưa có ảnh"</span> }.into_any() } else { view! { <img src=cloudinary(&src, 240) alt="Ảnh đại diện" /> }.into_any() }
                        }}
                    </div>
                    <div class="cluster">
                        {move || {
                            let endpoint = if locale.get() == "en" { "/api/admin/upload-avatar?locale=en" } else { "/api/admin/upload-avatar?locale=vi" };
                            view! {
                                <UploadButton label="Tải ảnh lên" endpoint=endpoint accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" notice=notice
                                    on_uploaded=Callback::new(move |url: String| { avatar.set(url); notice.set(ok("Đã cập nhật ảnh đại diện.")) }) />
                            }
                        }}
                        {move || (!avatar.get().is_empty()).then(|| view! { <button class="btn btn-sm btn-ghost" type="button" on:click=move |_| avatar.set(String::new())>"Gỡ ảnh"</button> })}
                    </div>
                    <span class="hint">"Ảnh mới được lưu ngay khi tải lên. Gỡ ảnh cần bấm Lưu hồ sơ; ảnh cũ vẫn nằm trong Thư viện ảnh."</span>
                </section>
            </aside>
        </div>
        <Toast notice=notice />
    }
}

#[island(lazy)]
pub fn CredentialsEditor(credentials: Credentials) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let saving = RwSignal::new(false);
    let educations = RwSignal::new(credentials.educations.clone());
    let certifications = RwSignal::new(credentials.certifications.clone());
    let languages = RwSignal::new(credentials.languages.clone());
    let save = move |_| {
        if saving.get_untracked() { return; }
        saving.set(true);
        let input = Credentials { educations: educations.get_untracked(), certifications: certifications.get_untracked(), languages: languages.get_untracked() };
        spawn_local(async move {
            match admin_save_credentials(input).await {
                Ok(saved) => {
                    educations.set(saved.educations);
                    certifications.set(saved.certifications);
                    languages.set(saved.languages);
                    notice.set(ok("Đã lưu học vấn, chứng chỉ và ngôn ngữ."));
                }
                Err(e) => notice.set(err(e)),
            }
            saving.set(false);
        });
    };

    view! {
        <div class="stack" style="--gap:16px">
            <section class="card fieldset">
                <h2>"Học vấn"</h2>
                <div class="stack" style="--gap:12px">
                    {move || educations.with(|list| list.iter().cloned().enumerate().map(|(i, item)| {
                        let edit = move |f: fn(&mut EducationItem, String)| Callback::new(move |v: String| educations.update_untracked(|l| if let Some(x) = l.get_mut(i) { f(x, v) }));
                        let logo = item.logo.clone();
                        view! {
                            <div class="item-card">
                                <div class="item-head">
                                    <span class="index-tag">{format!("{:02}", i + 1)}</span>
                                    <RemoveButton on_remove=Callback::new(move |_| educations.update(|l| { if i < l.len() { l.remove(i); } })) />
                                </div>
                                <div class="form-row">
                                    <ItemInput placeholder="Bằng cấp (VI)" value=item.degree.vi set=edit(|x, v| x.degree.vi = v) />
                                    <ItemInput placeholder="Degree (EN)" value=item.degree.en set=edit(|x, v| x.degree.en = v) />
                                </div>
                                <div class="form-row">
                                    <ItemInput placeholder="Trường (VI)" value=item.school.vi set=edit(|x, v| x.school.vi = v) />
                                    <ItemInput placeholder="School (EN)" value=item.school.en set=edit(|x, v| x.school.en = v) />
                                </div>
                                <ItemInput placeholder="Thời gian (ví dụ 2021 – 2025)" value=item.period set=edit(|x, v| x.period = v) />
                                <div class="form-row">
                                    <ItemInput placeholder="Mô tả (VI)" value=item.detail.vi multiline=true set=edit(|x, v| x.detail.vi = v) />
                                    <ItemInput placeholder="Detail (EN)" value=item.detail.en multiline=true set=edit(|x, v| x.detail.en = v) />
                                </div>
                                <div class="cluster">
                                    {(!logo.is_empty()).then(|| view! { <img class="logo-thumb" src=cloudinary(&logo, 120) alt="Logo" /> })}
                                    <UploadButton label=if logo.is_empty() { "Tải logo" } else { "Đổi logo" } endpoint="/api/admin/upload-image" notice=notice
                                        on_uploaded=Callback::new(move |url: String| educations.update(|l| if let Some(x) = l.get_mut(i) { x.logo = url })) />
                                    {(!logo.is_empty()).then(|| view! { <button class="btn btn-sm btn-ghost" type="button" on:click=move |_| educations.update(|l| if let Some(x) = l.get_mut(i) { x.logo.clear() })>"Gỡ logo"</button> })}
                                </div>
                            </div>
                        }
                    }).collect_view())}
                </div>
                <button class="btn btn-sm" type="button" on:click=move |_| educations.update(|l| l.push(EducationItem::default()))>"+ Thêm học vấn"</button>
            </section>

            <section class="card fieldset">
                <h2>"Chứng chỉ"</h2>
                <div class="repeater">
                    {move || certifications.with(|list| list.iter().cloned().enumerate().map(|(i, item)| {
                        let edit = move |f: fn(&mut CertificationItem, String)| Callback::new(move |v: String| certifications.update_untracked(|l| if let Some(x) = l.get_mut(i) { f(x, v) }));
                        view! {
                            <div class="repeater-row cert">
                                <ItemInput placeholder="Tên chứng chỉ" value=item.name set=edit(|x, v| x.name = v) />
                                <ItemInput placeholder="Đơn vị cấp" value=item.issuer set=edit(|x, v| x.issuer = v) />
                                <ItemInput placeholder="Năm" value=item.year set=edit(|x, v| x.year = v) />
                                <ItemSwitch label="Hiện" checked=item.enabled set=Callback::new(move |on: bool| certifications.update_untracked(|l| if let Some(x) = l.get_mut(i) { x.enabled = on })) />
                                <RemoveButton on_remove=Callback::new(move |_| certifications.update(|l| { if i < l.len() { l.remove(i); } })) />
                            </div>
                        }
                    }).collect_view())}
                </div>
                <button class="btn btn-sm" type="button" on:click=move |_| certifications.update(|l| l.push(CertificationItem::default()))>"+ Thêm chứng chỉ"</button>
            </section>

            <section class="card fieldset">
                <h2>"Ngôn ngữ"</h2>
                <div class="repeater">
                    {move || languages.with(|list| list.iter().cloned().enumerate().map(|(i, item)| {
                        let edit = move |f: fn(&mut LanguageItem, String)| Callback::new(move |v: String| languages.update_untracked(|l| if let Some(x) = l.get_mut(i) { f(x, v) }));
                        view! {
                            <div class="repeater-row lang">
                                <ItemInput placeholder="Ngôn ngữ (VI)" value=item.name.vi set=edit(|x, v| x.name.vi = v) />
                                <ItemInput placeholder="Language (EN)" value=item.name.en set=edit(|x, v| x.name.en = v) />
                                <ItemInput placeholder="Trình độ (VI)" value=item.level.vi set=edit(|x, v| x.level.vi = v) />
                                <ItemInput placeholder="Level (EN)" value=item.level.en set=edit(|x, v| x.level.en = v) />
                                <ItemSwitch label="Hiện" checked=item.enabled set=Callback::new(move |on: bool| languages.update_untracked(|l| if let Some(x) = l.get_mut(i) { x.enabled = on })) />
                                <RemoveButton on_remove=Callback::new(move |_| languages.update(|l| { if i < l.len() { l.remove(i); } })) />
                            </div>
                        }
                    }).collect_view())}
                </div>
                <button class="btn btn-sm" type="button" on:click=move |_| languages.update(|l| l.push(LanguageItem::default()))>"+ Thêm ngôn ngữ"</button>
            </section>

            <div class="save-bar">
                <span class="hint">"Học vấn, chứng chỉ và ngôn ngữ dùng chung cho hồ sơ tiếng Việt và tiếng Anh."</span>
                <button class="btn btn-primary" type="button" on:click=save disabled=move || saving.get()>{move || if saving.get() { "Đang lưu…" } else { "Lưu thay đổi" }}<Icon name="check" /></button>
            </div>
        </div>
        <Toast notice=notice />
    }
}

#[island(lazy)]
pub fn ExperiencesTable(items: Vec<AdminExperience>, locale: String) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let count = items.len();
    let new_href = format!("/admin/experiences/new?locale={locale}");
    view! {
        <div class="toolbar glass" style="position:static">
            <div class="toolbar-row">
                <div class="tabs filters">
                    {[("vi", "Tiếng Việt"), ("en", "English")].into_iter().map(|(key, label)| view! {
                        <a class="filter" href=format!("/admin/experiences?locale={key}") aria-pressed=(locale == key).to_string()>{label}</a>
                    }).collect_view()}
                </div>
                <span class="result-count">{format!("{count:02} mục")}</span>
                <a class="btn btn-primary btn-sm" href=new_href.clone()><Icon name="sparkles" />"Thêm kinh nghiệm"</a>
            </div>
        </div>
        {if items.is_empty() {
            view! {
                <div class="card empty-state">
                    <Icon name="briefcase" />
                    <p>"Chưa có kinh nghiệm nào cho ngôn ngữ này."</p>
                    <a class="btn btn-sm" href=new_href>"Thêm mục đầu tiên"</a>
                </div>
            }.into_any()
        } else {
            view! {
                <div class="table-wrap-admin">
                    <table class="table cards">
                        <thead><tr><th>"Vị trí"</th><th>"Thời gian"</th><th>"Thứ tự"</th><th></th></tr></thead>
                        <tbody>
                            {items.into_iter().map(|x| {
                                let (edit_href, up_id, down_id, del_id) = (format!("/admin/experiences/{}", x.id), x.id.clone(), x.id.clone(), x.id.clone());
                                let label = format!("{} · {}", x.role, x.company);
                                let sub = [x.company.clone(), x.location.clone()].into_iter().filter(|s| !s.is_empty()).collect::<Vec<_>>().join(" · ");
                                view! {
                                    <tr>
                                        <td class="cell-main"><div class="title-cell"><a href=edit_href.clone()>{x.role.clone()}</a><small>{sub}</small></div></td>
                                        <td class="mono" data-label="Thời gian" style="font-size:12.5px">{if x.period.is_empty() { "—".to_string() } else { x.period.clone() }}</td>
                                        <td data-label="Thứ tự">
                                            <div class="row-actions" style="justify-content:flex-start">
                                                <button class="icon-btn sm" type="button" aria-label="Lên" on:click=move |_| { let id = up_id.clone(); spawn_local(async move { match admin_move_experience(id, true).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } }); }><Icon name="arrow-up" /></button>
                                                <button class="icon-btn sm" type="button" aria-label="Xuống" style="transform:rotate(180deg)" on:click=move |_| { let id = down_id.clone(); spawn_local(async move { match admin_move_experience(id, false).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } }); }><Icon name="arrow-up" /></button>
                                            </div>
                                        </td>
                                        <td class="cell-actions">
                                            <div class="row-actions">
                                                <a class="icon-btn sm" href=edit_href aria-label="Sửa"><Icon name="wrench" /></a>
                                                <button class="icon-btn sm danger" type="button" aria-label="Xóa" on:click=move |_| {
                                                    if !confirm(&format!("Xóa kinh nghiệm “{label}”? Ảnh của mục này vẫn còn trong Thư viện ảnh.")) { return; }
                                                    let id = del_id.clone();
                                                    spawn_local(async move { match admin_delete_experience(id).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } });
                                                }><Icon name="x" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                }
                            }).collect_view()}
                        </tbody>
                    </table>
                </div>
            }.into_any()
        }}
        <Toast notice=notice />
    }
}

#[island(lazy)]
pub fn ExperienceEditor(experience: AdminExperience) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let saving = RwSignal::new(false);
    let is_new = experience.id.is_empty();
    let id = RwSignal::new(experience.id.clone());
    let s = |v: &str| RwSignal::new(v.to_string());
    let (role, company, company_url, period, location) = (s(&experience.role), s(&experience.company), s(&experience.company_url), s(&experience.period), s(&experience.location));
    let description = s(&experience.description);
    let highlights = s(&experience.highlights.join("\n"));
    let stack = s(&experience.stack.join("\n"));
    let locale = s(if experience.locale == "en" { "en" } else { "vi" });
    let images = RwSignal::new(experience.images.clone());
    let order = experience.order;
    let save = move |_| {
        if saving.get_untracked() { return; }
        saving.set(true);
        let input = AdminExperience {
            id: id.get_untracked(), locale: locale.get_untracked(), role: role.get_untracked(), company: company.get_untracked(), company_url: company_url.get_untracked(),
            period: period.get_untracked(), location: location.get_untracked(), description: description.get_untracked(),
            highlights: lines(&highlights.get_untracked()), stack: lines(&stack.get_untracked()), images: images.get_untracked(), order,
        };
        spawn_local(async move {
            match admin_save_experience(input).await {
                Ok(saved) => {
                    notice.set(ok(format!("Đã lưu “{} · {}”.", saved.role, saved.company)));
                    if is_new { go(&format!("/admin/experiences/{}", saved.id)); }
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
                    <h2>"Vị trí"</h2>
                    <div class="form-row"><Field label="Vị trí / vai trò" value=role /><Field label="Công ty / tổ chức" value=company /></div>
                    <div class="form-row"><Field label="Thời gian" value=period hint="Ví dụ: 06/2024 – nay" /><Field label="Địa điểm" value=location /></div>
                    <Field label="Website công ty" value=company_url />
                    <Field label="Mô tả" value=description multiline=true rows=5 />
                </section>
                <section class="card fieldset">
                    <h2>"Điểm nổi bật & công nghệ"</h2>
                    <div class="form-row">
                        <Field label="Điểm nổi bật (mỗi dòng một mục)" value=highlights multiline=true rows=7 />
                        <Field label="Công nghệ (mỗi dòng một mục)" value=stack multiline=true rows=7 />
                    </div>
                </section>
                <section class="card fieldset">
                    <h2>"Hình ảnh"</h2>
                    <ImageManager images=images notice=notice gallery=true />
                </section>
            </div>
            <aside class="editor-side">
                <section class="card fieldset">
                    <h2>"Lưu"</h2>
                    <div class="field"><label for="exp-locale">"Ngôn ngữ"</label>
                        <select id="exp-locale" class="select" prop:value=locale on:change=move |ev| locale.set(event_target_value(&ev)) disabled=!is_new><option value="vi">"Tiếng Việt"</option><option value="en">"English"</option></select>
                    </div>
                    <button class="btn btn-primary" type="button" on:click=save disabled=move || saving.get()>{move || if saving.get() { "Đang lưu…" } else { "Lưu kinh nghiệm" }}<Icon name="check" /></button>
                    <a class="btn btn-sm btn-ghost" href=move || format!("/admin/experiences?locale={}", locale.get())><Icon name="arrow-left" />"Danh sách kinh nghiệm"</a>
                </section>
            </aside>
        </div>
        <Toast notice=notice />
    }
}
