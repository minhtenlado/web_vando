use crate::api::get_post;
use crate::islands::article::{Comments, Engagement};
use crate::model::{Locale, PostCard, PostDetail, SiteSettings};
use crate::pages::{ErrorState, JsonLd, Seo, SITE};
use crate::text::{format_date, truncate};
use crate::ui::icons::Icon;
use crate::ui::{Breadcrumb, Img, Layout, NoteCardView};
use leptos::prelude::*;
use leptos_meta::Meta;
use leptos_router::hooks::use_params_map;

#[component]
pub fn PostPage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let params = use_params_map();
    let slug = params.with_untracked(|p| p.get("slug").unwrap_or_default());
    let data = Resource::new_blocking(|| (), move |_| get_post(slug.clone(), locale));
    view! {
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                match data.await {
                    Err(_) => view! { <ErrorState locale=locale /> }.into_any(),
                    Ok(None) => view! { <crate::pages::not_found::NotFound /> }.into_any(),
                    Ok(Some((post, posts, settings))) => view! { <Article post=post posts=posts settings=settings locale=locale /> }.into_any(),
                }
            })}
        </Suspense>
    }
}

#[component]
fn Article(post: PostDetail, posts: Vec<PostCard>, settings: SiteSettings, locale: Locale) -> impl IntoView {
    let title = post.seo_title.clone().unwrap_or_else(|| post.title.clone());
    let description = post.seo_description.clone().unwrap_or_else(|| truncate(&post.excerpt, 170));
    let related: Vec<PostCard> = posts.into_iter().filter(|p| p.slug != post.slug && (post.category.is_empty() || p.category == post.category)).take(3).collect();
    let json_ld = serde_json::json!({
        "@context": "https://schema.org", "@type": "TechArticle", "headline": post.title, "description": post.excerpt,
        "datePublished": post.created_at, "dateModified": post.updated_at, "mainEntityOfPage": format!("{SITE}/posts/{}", post.slug),
        "author": { "@type": "Organization", "name": "Engineering Lab" },
    });
    let headings = post.headings.clone();
    view! {
        <Seo title=format!("{title} | Engineering Notes") description=description path=format!("/posts/{}", post.slug) image=post.cover_image.clone() article=true />
        {post.seo_keywords.clone().map(|k| view! { <Meta name="keywords" content=k /> })}
        <Layout settings=settings locale=locale current="notes">
            <JsonLd value=json_ld />
            <div class="reading-progress" data-progress="" aria-hidden="true"></div>
            <div class="container">
                <div class="article-layout">
                    <article data-article="">
                        <header class="article-head" style="padding-top:calc(var(--header-h) + 8px)">
                            <Breadcrumb items=vec![(locale.t("Trang chủ", "Home").into(), Some("/".into())), ("Notes".into(), Some("/notes".into())), (post.title.clone(), None)] />
                            <div class="article-meta">
                                {(!post.category.is_empty()).then(|| view! { <span>{post.category.clone()}</span> })}
                                <span><time datetime=post.created_at.clone()>{format_date(&post.created_at, locale)}</time></span>
                                <span>{format!("~{} {}", post.reading_minutes, locale.t("phút đọc", "min read"))}</span>
                            </div>
                            <h1 class="h1">{post.title.clone()}</h1>
                            {(!post.excerpt.is_empty()).then(|| view! { <p class="lead">{post.excerpt.clone()}</p> })}
                        </header>
                        {post.cover_image.clone().map(|src| view! { <div class="media cover" style="margin-bottom:40px;cursor:default"><Img src=src alt=post.title.clone() eager=true sizes="(max-width: 800px) 100vw, 760px" /></div> })}
                        {post.pdf_url.clone().map(|href| view! {
                            <p class="alert" style="margin-bottom:32px"><a href=href target="_blank" rel="noopener noreferrer" class="cluster"><Icon name="file" />{locale.t("Mở tài liệu PDF đính kèm", "Open the attached PDF document")}</a></p>
                        })}
                        <div class="prose" inner_html=post.content_html.clone()></div>
                        <Engagement slug=post.slug.clone() likes=post.likes bookmarks=post.bookmarks views=post.views locale=locale.code().into() />
                        <Comments slug=post.slug.clone() locale=locale.code().into() />
                    </article>
                    {(!headings.is_empty()).then(|| view! {
                        <aside class="article-aside">
                            <nav class="card toc" data-toc="" aria-label=locale.t("Mục lục", "Table of contents")>
                                <h2>{locale.t("Trong bài viết", "In this note")}</h2>
                                <ol>{headings.iter().map(|h| view! {
                                    <li><a href=format!("#{}", h.id) style=if h.level == 3 { "padding-left:24px;font-size:13px" } else { "" }>{h.text.clone()}</a></li>
                                }).collect_view()}</ol>
                            </nav>
                        </aside>
                    })}
                </div>
                {(!related.is_empty()).then(|| view! {
                    <section class="section" aria-labelledby="related-notes">
                        <div class="section-head"><div><p class="eyebrow">{locale.t("Đọc tiếp", "Keep reading")}</p><h2 class="h2" id="related-notes">{locale.t("Bài viết liên quan.", "Related notes.")}</h2></div></div>
                        <div class="grid-3">{related.into_iter().enumerate().map(|(i, p)| view! { <NoteCardView post=p locale=locale index=i /> }).collect_view()}</div>
                    </section>
                })}
            </div>
        </Layout>
    }
}
