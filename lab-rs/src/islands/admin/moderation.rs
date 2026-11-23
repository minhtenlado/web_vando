//! Comment moderation and contact inbox.
use crate::api_admin::{admin_delete_comment, admin_message_flag, admin_messages, admin_reply};
use crate::islands::admin::common::{confirm, err, ok, reload, Notice, Toast};
use crate::model::{AdminComment, AdminMessage, Locale};
use crate::text::format_date;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

#[island]
pub fn CommentsAdmin(comments: Vec<AdminComment>) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let replying = RwSignal::new(None::<String>);
    let reply_text = RwSignal::new(String::new());
    if comments.is_empty() {
        return view! { <div class="card panel"><p class="muted">"Chưa có bình luận nào."</p></div> }.into_any();
    }
    view! {
        <div class="stack" style="--gap:12px">
            {comments.into_iter().map(|c| {
                let (id, del_id, slug) = (c.comment.id.clone(), c.comment.id.clone(), c.post_slug.clone());
                let open_id = id.clone();
                let is_open = move || replying.get().as_deref() == Some(open_id.as_str());
                let is_open2 = is_open.clone();
                view! {
                    <article class="card message-card">
                        <header>
                            <span><strong>{c.comment.author.clone()}</strong>{c.comment.is_author.then(|| view! { " " <span class="author-badge">"TÁC GIẢ"</span> })}
                                <span class="muted" style="font-size:13px">{format!(" · {}", if c.comment.parent_id.is_some() { "trả lời" } else { "bình luận" })}</span></span>
                            <small class="muted mono">{format_date(&c.comment.created_at, Locale::Vi)}</small>
                        </header>
                        <p>{c.comment.content.clone()}</p>
                        <div class="cluster" style="justify-content:space-between">
                            <a class="muted" style="font-size:13px" href=format!("/posts/{}", c.post_slug) target="_blank">{format!("↗ {}", c.post_title)}</a>
                            <div class="cluster" style="--gap:6px">
                                <span class="muted" style="font-size:13px">{format!("♥ {}", c.comment.likes)}</span>
                                <button class="btn btn-sm" type="button" on:click=move |_| { reply_text.set(String::new()); replying.set(Some(id.clone())); }><Icon name="message" />"Trả lời"</button>
                                <button class="icon-btn sm danger" type="button" aria-label="Xóa bình luận" on:click=move |_| {
                                    if !confirm("Xóa bình luận này (kèm các trả lời)? Thao tác không thể hoàn tác.") { return; }
                                    let id = del_id.clone();
                                    spawn_local(async move { match admin_delete_comment(id).await { Ok(()) => reload(), Err(e) => notice.set(err(e)) } });
                                }><Icon name="x" /></button>
                            </div>
                        </div>
                        <Show when=is_open2>
                            {
                                let slug = slug.clone();
                                let parent = c.comment.parent_id.clone().unwrap_or_else(|| c.comment.id.clone());
                                view! {
                                    <div class="stack" style="--gap:8px">
                                        <textarea class="textarea" style="min-height:90px" placeholder="Trả lời với tư cách tác giả…" prop:value=reply_text on:input=move |ev| reply_text.set(event_target_value(&ev))></textarea>
                                        <div class="cluster">
                                            <button class="btn btn-primary btn-sm" type="button" on:click=move |_| {
                                                let (slug, parent, text) = (slug.clone(), parent.clone(), reply_text.get_untracked());
                                                spawn_local(async move { match admin_reply(slug, Some(parent), text).await { Ok(()) => { notice.set(ok("Đã gửi phản hồi.")); reload() } Err(e) => notice.set(err(e)) } });
                                            }><Icon name="send" />"Gửi"</button>
                                            <button class="btn btn-sm" type="button" on:click=move |_| replying.set(None)>"Hủy"</button>
                                        </div>
                                    </div>
                                }
                            }
                        </Show>
                    </article>
                }
            }).collect_view()}
        </div>
        <Toast notice=notice />
    }.into_any()
}

#[island]
pub fn Inbox(messages: Vec<AdminMessage>) -> impl IntoView {
    let notice = RwSignal::new(None::<Notice>);
    let filter = RwSignal::new("all".to_string());
    let list = RwSignal::new(messages);
    let load = move |f: &'static str| {
        filter.set(f.into());
        spawn_local(async move { match admin_messages(f.into()).await { Ok(m) => list.set(m), Err(e) => notice.set(err(e)) } });
    };
    let flag = move |id: String, field: &'static str, value: bool| {
        list.update(|items| if let Some(m) = items.iter_mut().find(|m| m.id == id) {
            match field { "read" => m.read = value, "starred" => m.starred = value, _ => m.archived = value }
        });
        spawn_local(async move { if let Err(e) = admin_message_flag(id, field.into(), value).await { notice.set(err(e)) } });
    };
    view! {
        <div class="tabs filters">
            {[("all", "Hộp thư"), ("unread", "Chưa đọc"), ("starred", "Gắn sao"), ("archived", "Lưu trữ")].into_iter().map(|(key, label)| view! {
                <button class="filter" type="button" aria-pressed=move || (filter.get() == key).to_string() on:click=move |_| load(key)>{label}</button>
            }).collect_view()}
        </div>
        {move || {
            let items = list.get();
            if items.is_empty() { return view! { <div class="card panel"><p class="muted">"Không có tin nhắn."</p></div> }.into_any(); }
            view! {
                <div class="stack" style="--gap:12px">
                    {items.into_iter().map(|m| {
                        let (a, b, c, d) = (m.id.clone(), m.id.clone(), m.id.clone(), m.id.clone());
                        let subject = if m.topic.is_empty() { "Liên hệ".to_string() } else { m.topic.clone() };
                        view! {
                            <article class="card message-card" data-unread=(!m.read).to_string()>
                                <header>
                                    <span><strong>{m.name.clone()}</strong>" · "<a href=format!("mailto:{}?subject={}", m.email, subject) class="muted">{m.email.clone()}</a></span>
                                    <small class="muted mono">{format!("{} · {}", m.ticket, format_date(&m.created_at, Locale::Vi))}</small>
                                </header>
                                {(!m.topic.is_empty()).then(|| view! { <span class="chip" data-tone="cyan" style="width:fit-content">{m.topic.clone()}</span> })}
                                <p>{m.message.clone()}</p>
                                <div class="cluster" style="--gap:6px">
                                    <button class="btn btn-sm" type="button" on:click=move |_| flag(a.clone(), "read", !m.read)>{if m.read { "Đánh dấu chưa đọc" } else { "Đánh dấu đã đọc" }}</button>
                                    <button class="btn btn-sm" type="button" on:click=move |_| flag(b.clone(), "starred", !m.starred)><Icon name="star" />{if m.starred { "Bỏ sao" } else { "Gắn sao" }}</button>
                                    <button class="btn btn-sm" type="button" on:click=move |_| flag(c.clone(), "archived", !m.archived)>{if m.archived { "Bỏ lưu trữ" } else { "Lưu trữ" }}</button>
                                    <a class="btn btn-sm" href=format!("mailto:{}?subject=Re: {}", m.email, subject) on:click=move |_| flag(d.clone(), "read", true)><Icon name="mail" />"Trả lời qua email"</a>
                                </div>
                            </article>
                        }
                    }).collect_view()}
                </div>
            }.into_any()
        }}
        <Toast notice=notice />
    }
}
