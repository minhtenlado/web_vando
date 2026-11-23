use crate::api::get_home;
use crate::model::Locale;
use leptos::prelude::*;

#[component]
pub fn HomePage() -> impl IntoView {
    let locale = expect_context::<Locale>();
    let data = Resource::new_blocking(|| (), move |_| get_home(locale));
    view! {
        <Suspense fallback=|| ()>
            {move || data.get().map(|result| match result {
                Ok(home) => view! {
                    <main>
                        <h1>{home.settings.hero_headline.clone()}</h1>
                        <ul>{home.projects.into_iter().map(|p| view! { <li>{p.title}" — "{p.domains.join(", ")}</li> }).collect_view()}</ul>
                    </main>
                }.into_any(),
                Err(error) => view! { <p>{error.to_string()}</p> }.into_any(),
            })}
        </Suspense>
    }
}
