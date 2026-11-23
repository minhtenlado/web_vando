//! Reader interactions: view count, likes, bookmarks and comments.
use crate::api::{add_comment, like_comment, list_comments, post_stat};
use crate::model::{CommentView, Locale};
use crate::text::format_date;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

#[cfg(feature = "hydrate")]
fn storage(session: bool) -> Option<web_sys::Storage> {
    let win = web_sys::window()?;
    if session { win.session_storage().ok().flatten() } else { win.local_storage().ok().flatten() }
}

fn remembered(_key: &str) -> bool {
    #[cfg(feature = "hydrate")]
    { return storage(false).and_then(|s| s.get_item(_key).ok().flatten()).is_some(); }
    #[allow(unreachable_code)]
    false
}

fn remember(_key: &str, _on: bool) {
    #[cfg(feature = "hydrate")]
    if let Some(s) = storage(false) {
        let _ = if _on { s.set_item(_key, "1") } else { s.remove_item(_key) };
    }
}

#[island]
pub fn Engagement(slug: String, likes: i32, bookmarks: i32, views: i32, locale: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let likes = RwSignal::new(likes);
    let bookmarks = RwSignal::new(bookmarks);
    let views = RwSignal::new(views);
    let liked = RwSignal::new(false);
    let saved = RwSignal::new(false);
    let like_key = format!("lab:like:{slug}");
    let save_key = format!("lab:bookmark:{slug}");
    {
        let (slug, like_key, save_key) = (slug.clone(), like_key.clone(), save_key.clone());
        Effect::new(move |_| {
            liked.set(remembered(&like_key));
            saved.set(remembered(&save_key));
            #[cfg(feature = "hydrate")]
            {
                let seen = format!("lab:view:{slug}");
                let first = storage(true).map(|s| s.get_item(&seen).ok().flatten().is_none()).unwrap_or(false);
                if first {
                    if let Some(s) = storage(true) { let _ = s.set_item(&seen, "1"); }
                    let slug = slug.clone();
                    spawn_local(async move {
                        if let Ok((v, _, _)) = post_stat(slug, "view".into()).await { views.set(v); }
                    });
                }
            }
            let _ = &slug;
        });
    }
    let toggle = move |kind: &'static str| {
        let slug = slug.clone();
        let (flag, count, key) = if kind == "like" { (liked, likes, like_key.clone()) } else { (saved, bookmarks, save_key.clone()) };
        let on = !flag.get_untracked();
        flag.set(on);
        count.update(|c| *c = (*c + if on { 1 } else { -1 }).max(0));
        remember(&key, on);
        let action = match (kind, on) { ("like", true) => "like", ("like", false) => "unlike", (_, true) => "bookmark", _ => "unbookmark" };
        spawn_local(async move {
            match post_stat(slug, action.into()).await {
                Ok((v, l, b)) => { views.set(v); likes.set(l); bookmarks.set(b); }
                Err(_) => { flag.set(!on); remember(&key, !on); count.update(|c| *c = (*c + if on { -1 } else { 1 }).max(0)); }
            }
        });
    };
    let toggle_like = toggle.clone();
    view! {
        <div class="engagement glass" role="group" aria-label=locale.t("Tương tác bài viết", "Article actions")>
            <button type="button" aria-pressed=move || liked.get().to_string() on:click=move |_| toggle_like("like")><Icon name="heart" />{move || likes.get()}<span class="sr-only">{locale.t(" lượt thích", " likes")}</span></button>
            <button type="button" aria-pressed=move || saved.get().to_string() on:click=move |_| toggle("bookmark")><Icon name="bookmark" />{move || bookmarks.get()}<span class="sr-only">{locale.t(" lượt lưu", " bookmarks")}</span></button>
            <span class="cluster muted" style="--gap:6px;margin-left:auto;font-size:13px"><Icon name="eye" />{move || views.get()}" "{locale.t("lượt xem", "views")}</span>
        </div>
    }
}

fn initials(name: &str) -> String {
    name.split_whitespace().filter_map(|w| w.chars().next()).last().map(|c| c.to_uppercase().collect()).unwrap_or_else(|| "?".into())
}

#[island]
pub fn Comments(slug: String, locale: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let items = RwSignal::new(None::<Result<Vec<CommentView>, String>>);
    let author = RwSignal::new(String::new());
    let content = RwSignal::new(String::new());
    let anonymous = RwSignal::new(false);
    let sending = RwSignal::new(false);
    let notice = RwSignal::new(None::<(bool, String)>);
    {
        let slug = slug.clone();
        Effect::new(move |_| {
            let slug = slug.clone();
            spawn_local(async move { items.set(Some(list_comments(slug).await.map_err(|e| e.to_string()))); });
        });
    }
    let slug_submit = slug.clone();
    let submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        if sending.get_untracked() { return; }
        sending.set(true);
        notice.set(None);
        let slug = slug_submit.clone();
        let (a, c, anon) = (author.get_untracked(), content.get_untracked(), anonymous.get_untracked());
        spawn_local(async move {
            match add_comment(slug, c, a, anon, None).await {
                Ok(comment) => {
                    items.update(|list| if let Some(Ok(list)) = list { list.insert(0, comment) });
                    content.set(String::new());
                    notice.set(Some((true, locale.t("Đã đăng bình luận.", "Comment posted.").into())));
                }
                Err(error) => {
                    let text = error.to_string();
                    notice.set(Some((false, text.split_once(": ").map(|(_, r)| r.to_string()).unwrap_or(text))));
                }
            }
            sending.set(false);
        });
    };
    let slug_like = StoredValue::new(slug.clone());
    view! {
        <section class="comments" aria-labelledby="comments-title">
            <h2 class="h3" id="comments-title">{locale.t("Bình luận", "Comments")}</h2>
            <form class="form card" style="padding:20px" on:submit=submit>
                <div class="form-row">
                    <div class="field">
                        <label for="cm-name">{locale.t("Tên hiển thị", "Display name")}</label>
                        <input id="cm-name" class="input" maxlength="50" prop:value=author on:input=move |ev| author.set(event_target_value(&ev)) disabled=move || anonymous.get() />
                    </div>
                    <label class="cluster" style="align-self:end;min-height:48px;color:var(--text-2);font-size:14px">
                        <input type="checkbox" prop:checked=anonymous on:change=move |ev| anonymous.set(event_target_checked(&ev)) />
                        {locale.t("Bình luận ẩn danh", "Post anonymously")}
                    </label>
                </div>
                <div class="field">
                    <label for="cm-content">{locale.t("Nội dung", "Comment")}</label>
                    <textarea id="cm-content" class="textarea" style="min-height:110px" required minlength="2" maxlength="1000" prop:value=content on:input=move |ev| content.set(event_target_value(&ev))></textarea>
                </div>
                {move || notice.get().map(|(ok, text)| view! { <p class="form-status" data-kind=if ok { "ok" } else { "error" } role="status">{text}</p> })}
                <div class="cluster" style="justify-content:space-between">
                    <span class="form-note">{move || format!("{} / 1000", content.get().chars().count())}</span>
                    <button type="submit" class="btn btn-primary btn-sm" disabled=move || sending.get()>{move || if sending.get() { locale.t("Đang gửi…", "Posting…") } else { locale.t("Đăng bình luận", "Post comment") }}<Icon name="send" /></button>
                </div>
            </form>
            {move || match items.get() {
                None => view! { <div class="card skeleton-card"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div> }.into_any(),
                Some(Err(_)) => view! { <p class="alert" role="alert">{locale.t("Không tải được bình luận. Vui lòng thử lại sau.", "Comments could not be loaded. Please try again later.")}</p> }.into_any(),
                Some(Ok(list)) if list.is_empty() => view! { <p class="muted">{locale.t("Chưa có bình luận nào. Hãy là người đầu tiên!", "No comments yet. Be the first!")}</p> }.into_any(),
                Some(Ok(list)) => {
                    let roots: Vec<CommentView> = list.iter().filter(|c| c.parent_id.is_none()).cloned().collect();
                    view! {
                        <div class="stack">
                            {roots.into_iter().map(|c| {
                                let replies: Vec<CommentView> = list.iter().filter(|r| r.parent_id.as_deref() == Some(&c.id)).cloned().collect();
                                view! { <CommentItem comment=c replies=replies locale=locale slug=slug_like /> }
                            }).collect_view()}
                        </div>
                    }.into_any()
                }
            }}
        </section>
    }
}

#[component]
fn CommentItem(comment: CommentView, replies: Vec<CommentView>, locale: Locale, slug: StoredValue<String>) -> impl IntoView {
    let likes = RwSignal::new(comment.likes);
    let key = format!("lab:comment-like:{}", comment.id);
    let liked = RwSignal::new(remembered(&key));
    let id = comment.id.clone();
    let like = move |_| {
        let on = !liked.get_untracked();
        liked.set(on);
        remember(&key, on);
        let (slug, id) = (slug.get_value(), id.clone());
        spawn_local(async move {
            if let Ok(n) = like_comment(slug, id, on).await { likes.set(n); }
        });
    };
    view! {
        <article class="comment card">
            <span class="avatar" aria-hidden="true">{initials(&comment.author)}</span>
            <div>
                <header>
                    <strong>{comment.author.clone()}</strong>
                    {comment.is_author.then(|| view! { <span class="author-badge">{locale.t("TÁC GIẢ", "AUTHOR")}</span> })}
                    <time datetime=comment.created_at.clone()>{format_date(&comment.created_at, locale)}</time>
                </header>
                <p>{comment.content.clone()}</p>
                <div class="cluster" style="margin-top:8px">
                    <button type="button" class="btn btn-ghost btn-sm" aria-pressed=move || liked.get().to_string() on:click=like><Icon name="heart" />{move || likes.get()}</button>
                </div>
                {(!replies.is_empty()).then(|| view! {
                    <div class="replies">
                        {replies.into_iter().map(|r| view! {
                            <div>
                                <header><strong>{r.author.clone()}</strong>{r.is_author.then(|| view! { <span class="author-badge">{locale.t("TÁC GIẢ", "AUTHOR")}</span> })}<time datetime=r.created_at.clone()>{format_date(&r.created_at, locale)}</time></header>
                                <p>{r.content.clone()}</p>
                            </div>
                        }).collect_view()}
                    </div>
                })}
            </div>
        </article>
    }
}
