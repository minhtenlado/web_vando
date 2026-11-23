use crate::api::get_posts;
use crate::model::Locale;
use crate::pages::Seo;
use crate::ui::{Breadcrumb, Layout};
use leptos::prelude::*;

const LEGAL: &str = include_str!("legal.json");
const UPDATED_VI: &str = "19/08/2026";
const UPDATED_EN: &str = "August 19, 2026";

fn pairs(kind: &str, locale: Locale) -> Vec<String> {
    let all: serde_json::Value = serde_json::from_str(LEGAL).unwrap_or_default();
    all.get(kind)
        .and_then(|v| v.as_array())
        .map(|items| items.iter().filter_map(|pair| pair.get(if locale == Locale::Vi { 0 } else { 1 }).and_then(|s| s.as_str()).map(str::to_string)).collect())
        .unwrap_or_default()
}

#[component]
pub fn PrivacyPage() -> impl IntoView { view! { <LegalPage kind="privacy" /> } }

#[component]
pub fn TermsPage() -> impl IntoView { view! { <LegalPage kind="terms" /> } }

#[component]
fn LegalPage(kind: &'static str) -> impl IntoView {
    let locale = expect_context::<Locale>();
    let data = Resource::new_blocking(|| (), move |_| get_posts(locale));
    view! {
        <Suspense fallback=|| ()>
            {move || Suspend::new(async move {
                let settings = data.await.map(|(_, s)| s).unwrap_or_default();
                let text = pairs(kind, locale);
                let get = |i: usize| text.get(i).cloned().unwrap_or_default();
                let (crumb, title, updated, intro) = (get(1), get(2), get(3), get(4));
                let email = settings.email.clone().unwrap_or_else(|| "phanhuynhvando@gmail.com".into());
                let mut blocks = Vec::new();
                let mut i = 4;
                while i < text.len() {
                    let item = text[i].clone();
                    let is_heading = item.chars().next().is_some_and(|c| c.is_ascii_digit()) && item.contains(". ");
                    if is_heading {
                        blocks.push(view! { <h2>{item}</h2> }.into_any());
                    } else if item.trim_end().ends_with(':') && i + 1 < text.len() && kind == "privacy" && !item.contains("Website") && text.get(i + 1).is_some_and(|n| !n.starts_with(char::is_numeric)) && (i == 7 || i == 9 || i == 13) {
                        let next = text[i + 1].clone();
                        blocks.push(view! { <p><strong>{item}</strong>" "{next}</p> }.into_any());
                        i += 1;
                    } else if kind == "privacy" && i == 16 {
                        let mid = get(17);
                        blocks.push(view! { <p>{item}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">"Google Ads Settings"</a>{mid}<a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">"aboutads.info"</a>"."</p> }.into_any());
                        i += 1;
                    } else {
                        blocks.push(view! { <p>{item}</p> }.into_any());
                    }
                    i += 1;
                }
                let contact = if kind == "privacy" {
                    view! { <ul><li>"Phan Huỳnh Văn Đô"</li><li>"Email: "<a href=format!("mailto:{email}")>{email.clone()}</a></li><li>"Website: "<a href="https://phanhuynh.id.vn">"https://phanhuynh.id.vn"</a></li></ul> }.into_any()
                } else {
                    view! { <p><a href=format!("mailto:{email}")>{email.clone()}</a></p> }.into_any()
                };
                                view! {
                    <Seo title=format!("{crumb} | Engineering Lab") description=intro.clone() path=format!("/{kind}") image=None />
                    <Layout settings=settings locale=locale current="">
                        <section class="page-hero">
                            <div class="container">
                                <Breadcrumb items=vec![(locale.t("Trang chủ", "Home").into(), Some("/".into())), (crumb.clone(), None)] />
                                <h1 class="h1">{title}</h1>
                                <p class="muted mono" style="font-size:13px">{updated}{if locale == Locale::Vi { UPDATED_VI } else { UPDATED_EN }}</p>
                            </div>
                        </section>
                        <section class="section">
                            <div class="container">
                                <article class="prose" style="max-width:780px">
                                    <p class="lead">{intro}</p>
                                    {blocks.into_iter().skip(1).collect_view()}
                                    {contact}
                                </article>
                            </div>
                        </section>
                    </Layout>
                }
            })}
        </Suspense>
    }
}
