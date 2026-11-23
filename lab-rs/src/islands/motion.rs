//! Global behaviour layer: one small island that progressively enhances server-rendered markup.
//! Everything is driven by data attributes and only animates `transform`/`opacity`/CSS variables.
use leptos::prelude::*;

#[island]
pub fn Motion(locale: String) -> impl IntoView {
    #[cfg(feature = "hydrate")]
    {
        let locale = locale.clone();
        Effect::new(move |_| behaviors::install(&locale));
    }
    let _ = &locale;
    view! { <div class="cursor-glow" aria-hidden="true"></div> }
}

#[cfg(feature = "hydrate")]
mod behaviors {
    use std::cell::{Cell, RefCell};
    use std::rc::Rc;
    use wasm_bindgen::{prelude::*, JsCast};
    use web_sys::{Document, Element, HtmlElement, IntersectionObserver, IntersectionObserverEntry, IntersectionObserverInit, Window};

    fn media(win: &Window, query: &str) -> bool {
        win.match_media(query).ok().flatten().map(|m| m.matches()).unwrap_or(false)
    }

    fn all(doc: &Document, selector: &str) -> Vec<Element> {
        let Ok(list) = doc.query_selector_all(selector) else { return Vec::new() };
        (0..list.length()).filter_map(|i| list.item(i)).filter_map(|n| n.dyn_into::<Element>().ok()).collect()
    }

    fn closest(event: &web_sys::Event, selector: &str) -> Option<Element> {
        event.target()?.dyn_into::<Element>().ok()?.closest(selector).ok().flatten()
    }

    fn set_var(el: &Element, name: &str, value: &str) {
        if let Some(el) = el.dyn_ref::<HtmlElement>() {
            let _ = el.style().set_property(name, value);
        }
    }

    fn raf(win: &Window, f: &Closure<dyn FnMut()>) {
        let _ = win.request_animation_frame(f.as_ref().unchecked_ref());
    }

    pub fn install(locale: &str) {
        let Some(win) = web_sys::window() else { return };
        let Some(doc) = win.document() else { return };
        let reduced = media(&win, "(prefers-reduced-motion: reduce)");
        let fine = media(&win, "(hover: hover) and (pointer: fine)");
        reveal(&doc, reduced);
        scroll_effects(&win, &doc, reduced);
        clicks(&win, &doc);
        code_copy(&doc, locale);
        toc(&doc);
        if fine && !reduced {
            if let Some(root) = doc.document_element() {
                let _ = root.class_list().add_1("has-pointer");
            }
            pointer_effects(&win, &doc);
        }
    }

    fn reveal(doc: &Document, reduced: bool) {
        let targets = all(doc, "[data-reveal], [data-reveal-split]");
        if reduced {
            for t in &targets { let _ = t.class_list().add_1("revealed"); }
            return;
        }
        let callback = Closure::<dyn FnMut(js_sys::Array, IntersectionObserver)>::new(|entries: js_sys::Array, observer: IntersectionObserver| {
            for entry in entries.iter() {
                let entry: IntersectionObserverEntry = entry.unchecked_into();
                if entry.is_intersecting() {
                    let target = entry.target();
                    let _ = target.class_list().add_1("revealed");
                    observer.unobserve(&target);
                }
            }
        });
        let init = IntersectionObserverInit::new();
        init.set_root_margin("0px 0px -6% 0px");
        init.set_threshold(&JsValue::from_f64(0.08));
        let Ok(observer) = IntersectionObserver::new_with_options(callback.as_ref().unchecked_ref(), &init) else {
            for t in &targets { let _ = t.class_list().add_1("revealed"); }
            return;
        };
        for t in &targets { observer.observe(t); }
        callback.forget();
    }

    fn scroll_effects(win: &Window, doc: &Document, reduced: bool) {
        let header = doc.query_selector("[data-header]").ok().flatten();
        let hero = doc.query_selector(".hero").ok().flatten();
        let progress = doc.query_selector("[data-progress]").ok().flatten();
        let article = doc.query_selector("[data-article]").ok().flatten();
        let ticking = Rc::new(Cell::new(false));
        let w = win.clone();
        let t = ticking.clone();
        let update: Rc<Closure<dyn FnMut()>> = Rc::new(Closure::new(move || {
            t.set(false);
            let y = w.scroll_y().unwrap_or(0.0);
            let vh = w.inner_height().ok().and_then(|v| v.as_f64()).unwrap_or(800.0);
            if let Some(header) = &header {
                let _ = header.set_attribute("data-scrolled", if y > 8.0 { "true" } else { "false" });
            }
            if let (Some(hero), false) = (&hero, reduced) {
                let p = (y / vh).clamp(0.0, 1.2);
                set_var(hero, "--parallax", &format!("{p:.4}"));
            }
            if let (Some(bar), Some(article)) = (&progress, &article) {
                let rect = article.get_bounding_client_rect();
                let total = (rect.height() - vh).max(1.0);
                let p = (-rect.top() / total).clamp(0.0, 1.0);
                set_var(bar, "--progress", &format!("{p:.4}"));
            }
        }));
        let w = win.clone();
        let u = update.clone();
        let on_scroll = Closure::<dyn FnMut()>::new(move || {
            if !ticking.get() {
                ticking.set(true);
                raf(&w, &u);
            }
        });
        let options = web_sys::AddEventListenerOptions::new();
        options.set_passive(true);
        let _ = win.add_event_listener_with_callback_and_add_event_listener_options("scroll", on_scroll.as_ref().unchecked_ref(), &options);
        raf(win, &update);
        on_scroll.forget();
        std::mem::forget(update);
    }

    fn set_menu(doc: &Document, open: bool) {
        if let Some(menu) = doc.get_element_by_id("mobile-nav") {
            let _ = menu.set_attribute("data-open", if open { "true" } else { "false" });
        }
        for button in all(doc, "[data-menu-open]") {
            let _ = button.set_attribute("aria-expanded", if open { "true" } else { "false" });
        }
        if let Some(body) = doc.body() {
            let _ = body.style().set_property("overflow", if open { "hidden" } else { "" });
        }
    }

    fn clicks(win: &Window, doc: &Document) {
        let d = doc.clone();
        let w = win.clone();
        let on_click = Closure::<dyn FnMut(web_sys::Event)>::new(move |event: web_sys::Event| {
            if closest(&event, "[data-menu-open]").is_some() {
                set_menu(&d, true);
            } else if closest(&event, "[data-menu-close]").is_some() || closest(&event, "#mobile-nav a").is_some() {
                set_menu(&d, false);
            } else if let Some(button) = closest(&event, "[data-locale-switch]") {
                let value = button.get_attribute("data-locale-switch").unwrap_or_default();
                if value == "vi" || value == "en" {
                    if let Ok(html) = d.clone().dyn_into::<web_sys::HtmlDocument>() {
                        let _ = html.set_cookie(&format!("cv-locale={value}; path=/; max-age=31536000; samesite=lax"));
                    }
                    let _ = w.location().reload();
                }
            }
        });
        let _ = doc.add_event_listener_with_callback("click", on_click.as_ref().unchecked_ref());
        on_click.forget();
        let d = doc.clone();
        let on_key = Closure::<dyn FnMut(web_sys::KeyboardEvent)>::new(move |event: web_sys::KeyboardEvent| {
            if event.key() == "Escape" { set_menu(&d, false); }
        });
        let _ = doc.add_event_listener_with_callback("keydown", on_key.as_ref().unchecked_ref());
        on_key.forget();
    }

    fn pointer_effects(win: &Window, doc: &Document) {
        let glow = doc.query_selector(".cursor-glow").ok().flatten();
        let pos = Rc::new(Cell::new((0.0f64, 0.0f64)));
        let ticking = Rc::new(Cell::new(false));
        let magnet: Rc<RefCell<Option<Element>>> = Rc::new(RefCell::new(None));
        let (p, t) = (pos.clone(), ticking.clone());
        let frame: Rc<Closure<dyn FnMut()>> = Rc::new(Closure::new(move || {
            t.set(false);
            let (x, y) = p.get();
            if let Some(glow) = &glow {
                set_var(glow, "--cx", &format!("{x:.1}px"));
                set_var(glow, "--cy", &format!("{y:.1}px"));
            }
        }));
        let w = win.clone();
        let on_move = Closure::<dyn FnMut(web_sys::PointerEvent)>::new(move |event: web_sys::PointerEvent| {
            let (x, y) = (event.client_x() as f64, event.client_y() as f64);
            pos.set((x, y));
            if !ticking.get() { ticking.set(true); raf(&w, &frame); }
            let ev: &web_sys::Event = event.as_ref();
            if let Some(card) = closest(ev, ".card") {
                let r = card.get_bounding_client_rect();
                set_var(&card, "--mx", &format!("{:.1}px", x - r.left()));
                set_var(&card, "--my", &format!("{:.1}px", y - r.top()));
            }
            if let Some(tilt) = closest(ev, "[data-tilt]") {
                let r = tilt.get_bounding_client_rect();
                let nx = ((x - r.left()) / r.width() - 0.5).clamp(-0.5, 0.5);
                let ny = ((y - r.top()) / r.height() - 0.5).clamp(-0.5, 0.5);
                set_var(&tilt, "--ry", &format!("{:.2}deg", nx * 14.0));
                set_var(&tilt, "--rx", &format!("{:.2}deg", -ny * 12.0));
            }
            let current = closest(ev, "[data-magnetic]");
            let mut held = magnet.borrow_mut();
            if let Some(prev) = held.as_ref() {
                if current.as_ref() != Some(prev) {
                    set_var(prev, "--bx", "0px");
                    set_var(prev, "--by", "0px");
                }
            }
            if let Some(el) = &current {
                let r = el.get_bounding_client_rect();
                let dx = (x - (r.left() + r.width() / 2.0)) * 0.22;
                let dy = (y - (r.top() + r.height() / 2.0)) * 0.32;
                set_var(el, "--bx", &format!("{dx:.1}px"));
                set_var(el, "--by", &format!("{dy:.1}px"));
            }
            *held = current;
        });
        let options = web_sys::AddEventListenerOptions::new();
        options.set_passive(true);
        let _ = doc.add_event_listener_with_callback_and_add_event_listener_options("pointermove", on_move.as_ref().unchecked_ref(), &options);
        on_move.forget();
        let d = doc.clone();
        let on_leave = Closure::<dyn FnMut(web_sys::PointerEvent)>::new(move |event: web_sys::PointerEvent| {
            let ev: &web_sys::Event = event.as_ref();
            if let Some(tilt) = closest(ev, "[data-tilt]") {
                set_var(&tilt, "--rx", "0deg");
                set_var(&tilt, "--ry", "0deg");
            }
            let _ = &d;
        });
        let _ = doc.add_event_listener_with_callback_and_add_event_listener_options("pointerout", on_leave.as_ref().unchecked_ref(), &options);
        on_leave.forget();
    }

    fn clipboard_write(text: &str) {
        let Some(win) = web_sys::window() else { return };
        let navigator = win.navigator();
        let Ok(clipboard) = js_sys::Reflect::get(&navigator, &JsValue::from_str("clipboard")) else { return };
        if clipboard.is_undefined() { return; }
        if let Ok(write) = js_sys::Reflect::get(&clipboard, &JsValue::from_str("writeText")) {
            if let Some(write) = write.dyn_ref::<js_sys::Function>() {
                let _ = write.call1(&clipboard, &JsValue::from_str(text));
            }
        }
    }

    fn code_copy(doc: &Document, locale: &str) {
        let (label, done) = if locale == "en" { ("Copy", "Copied") } else { ("Sao chép", "Đã chép") };
        for pre in all(doc, ".prose pre") {
            let Ok(button) = doc.create_element("button") else { continue };
            let _ = button.set_attribute("type", "button");
            let _ = button.set_attribute("class", "copy-code");
            button.set_text_content(Some(label));
            let source = pre.clone();
            let target = button.clone();
            let on_click = Closure::<dyn FnMut()>::new(move || {
                let text = source.query_selector("code").ok().flatten().and_then(|c| c.text_content()).or_else(|| source.text_content()).unwrap_or_default();
                let text = text.trim_end_matches([' ', '\n']).to_string();
                clipboard_write(&text);
                target.set_text_content(Some(done));
                let reset = target.clone();
                let restore = Closure::once_into_js(move || reset.set_text_content(Some(label)));
                if let Some(win) = web_sys::window() {
                    let _ = win.set_timeout_with_callback_and_timeout_and_arguments_0(restore.unchecked_ref(), 1600);
                }
            });
            let _ = button.add_event_listener_with_callback("click", on_click.as_ref().unchecked_ref());
            on_click.forget();
            let _ = pre.append_child(&button);
        }
    }

    fn toc(doc: &Document) {
        let links = all(doc, "[data-toc] a[href^='#']");
        if links.is_empty() { return; }
        let links = Rc::new(links);
        let l = links.clone();
        let callback = Closure::<dyn FnMut(js_sys::Array)>::new(move |entries: js_sys::Array| {
            for entry in entries.iter() {
                let entry: IntersectionObserverEntry = entry.unchecked_into();
                if !entry.is_intersecting() { continue; }
                let id = entry.target().id();
                for link in l.iter() {
                    let active = link.get_attribute("href").map(|h| h == format!("#{id}")).unwrap_or(false);
                    let _ = link.set_attribute("aria-current", if active { "true" } else { "false" });
                }
            }
        });
        let init = IntersectionObserverInit::new();
        init.set_root_margin("-20% 0px -70% 0px");
        let Ok(observer) = IntersectionObserver::new_with_options(callback.as_ref().unchecked_ref(), &init) else { return };
        for link in links.iter() {
            if let Some(id) = link.get_attribute("href").and_then(|h| h.strip_prefix('#').map(str::to_string)) {
                if let Some(target) = doc.get_element_by_id(&id) { observer.observe(&target); }
            }
        }
        callback.forget();
    }
}
