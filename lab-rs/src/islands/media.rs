//! Image viewer (cover, gallery and layer strip with a shared lightbox) and click-to-load video.
use crate::model::Locale;
use crate::text::cloudinary;
use crate::ui::icons::Icon;
use crate::ui::Img;
use leptos::prelude::*;

/// `mode`: "cover" renders the hero image, "grid" the gallery (all images after the cover),
/// "strip" labelled thumbnails (Hardware Lab). All modes open the same lightbox.
#[island]
pub fn ImageViewer(images: Vec<String>, labels: Vec<String>, title: String, mode: String, locale: String, transition: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let count = images.len();
    let open = RwSignal::new(None::<usize>);
    let touch_x = StoredValue::new(None::<f64>);
    let all = StoredValue::new(images.clone());
    let name = StoredValue::new(title.clone());
    let step = move |delta: isize| {
        open.update(|current| {
            if let Some(i) = current {
                *i = ((*i as isize + delta).rem_euclid(count as isize)) as usize;
            }
        });
    };
    let close = move || open.set(None);

    #[cfg(feature = "hydrate")]
    {
        let handle = window_event_listener(leptos::ev::keydown, move |ev| {
            if open.get_untracked().is_none() { return; }
            match ev.key().as_str() {
                "Escape" => open.set(None),
                "ArrowRight" => step(1),
                "ArrowLeft" => step(-1),
                _ => {}
            }
        });
        on_cleanup(move || handle.remove());
        Effect::new(move |_| {
            let locked = open.get().is_some();
            if let Some(body) = web_sys::window().and_then(|w| w.document()).and_then(|d| d.body()) {
                let _ = body.style().set_property("overflow", if locked { "hidden" } else { "" });
            }
        });
    }

    let trigger = match mode.as_str() {
        "cover" => images.first().cloned().map(|src| {
            let alt = title.clone();
            let style = (!transition.is_empty()).then(|| format!("view-transition-name:{transition}"));
            view! {
                <button type="button" class="cover" data-reveal="image" on:click=move |_| open.set(Some(0)) aria-label=locale.t("Phóng to ảnh dự án", "Enlarge project image")>
                    <img src=cloudinary(&src, 1600) srcset=crate::text::srcset(&src, &[640, 960, 1280, 1600, 2200]) sizes="(max-width: 1240px) 100vw, 1240px"
                        alt=alt width="1600" height="900" fetchpriority="high" decoding="async" style=style />
                    <span class="hint glass"><Icon name="expand" />{if count > 1 { format!("1 / {count}") } else { locale.t("Phóng to", "Enlarge").to_string() }}</span>
                </button>
            }.into_any()
        }).unwrap_or_else(|| ().into_any()),
        "strip" => view! {
            <div class="layer-strip">
                {images.iter().cloned().enumerate().map(|(i, src)| {
                    let label = labels.get(i).cloned().unwrap_or_default();
                    view! {
                        <button type="button" on:click=move |_| open.set(Some(i)) aria-label=format!("{} {}", locale.t("Xem ảnh", "View image"), i + 1) data-reveal="scale" style=format!("--i:{}", i % 4)>
                            <Img src=src alt=label.clone() sizes="(max-width: 640px) 50vw, 200px" width=600 height=600 />
                            {(!label.is_empty()).then(|| view! { <span>{label.clone()}</span> })}
                        </button>
                    }
                }).collect_view()}
            </div>
        }.into_any(),
        _ => view! {
            <div class="gallery">
                {images.iter().cloned().enumerate().skip(1).map(|(i, src)| {
                    let alt = format!("{} — {}", title, i + 1);
                    view! {
                        <button type="button" on:click=move |_| open.set(Some(i)) aria-label=format!("{} {}", locale.t("Xem ảnh", "View image"), i + 1) data-reveal="" style=format!("--i:{}", i % 2)>
                            <Img src=src alt=alt sizes="(max-width: 640px) 100vw, 420px" width=1200 height=900 />
                        </button>
                    }
                }).collect_view()}
            </div>
        }.into_any(),
    };

    view! {
        {trigger}
        <Show when=move || open.get().is_some()>
            <div class="lightbox" role="dialog" aria-modal="true" aria-label=name.get_value()
                on:click=move |ev| {
                    #[cfg(feature = "hydrate")]
                    {
                        use wasm_bindgen::JsCast;
                        if let Some(el) = ev.target().and_then(|t| t.dyn_into::<web_sys::Element>().ok()) {
                            if el.class_list().contains("lightbox-stage") { close(); }
                        }
                    }
                    let _ = &ev;
                }>
                <div class="lightbox-top">
                    <span>{move || open.get().map(|i| format!("{:02} / {:02}", i + 1, count)).unwrap_or_default()}</span>
                    <button type="button" class="icon-btn" on:click=move |_| close() aria-label=locale.t("Đóng", "Close")><Icon name="x" /></button>
                </div>
                <div class="lightbox-stage"
                    on:touchstart=move |ev| {
                        let x = ev.touches().get(0).map(|t| t.client_x() as f64);
                        touch_x.set_value(x);
                    }
                    on:touchend=move |ev| {
                        if let (Some(start), Some(end)) = (touch_x.get_value(), ev.changed_touches().get(0).map(|t| t.client_x() as f64)) {
                            let dx = end - start;
                            if dx.abs() > 50.0 && count > 1 { step(if dx < 0.0 { 1 } else { -1 }); }
                        }
                        touch_x.set_value(None);
                    }>
                    {move || open.get().map(|i| {
                        let src = all.with_value(|imgs| imgs.get(i).cloned().unwrap_or_default());
                        view! { <img src=cloudinary(&src, 2200) alt=format!("{} — {}", name.get_value(), i + 1) /> }
                    })}
                </div>
                <div class="lightbox-controls">
                    <button type="button" class="icon-btn" disabled=count < 2 on:click=move |_| step(-1) aria-label=locale.t("Ảnh trước", "Previous image")><Icon name="chevron-left" /></button>
                    <button type="button" class="icon-btn" disabled=count < 2 on:click=move |_| step(1) aria-label=locale.t("Ảnh tiếp", "Next image")><Icon name="chevron-right" /></button>
                </div>
            </div>
        </Show>
    }
}

#[island]
pub fn VideoEmbed(id: String, title: String, locale: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let (playing, set_playing) = signal(false);
    let thumb = format!("https://i.ytimg.com/vi/{id}/hqdefault.jpg");
    let src = format!("https://www.youtube-nocookie.com/embed/{id}?autoplay=1&rel=0&modestbranding=1");
    view! {
        <div class="video" data-reveal="">
            <Show when=move || playing.get() fallback={
                let thumb = thumb.clone();
                let title = title.clone();
                move || view! {
                    <img src=thumb.clone() alt="" loading="lazy" decoding="async" width="480" height="360" />
                    <button type="button" on:click=move |_| set_playing.set(true) aria-label=format!("{}: {}", locale.t("Phát video", "Play video"), title)>
                        <span class="play"><Icon name="play" /></span>
                    </button>
                }
            }>
                <iframe src=src.clone() title=title.clone() allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe>
            </Show>
        </div>
    }
}
