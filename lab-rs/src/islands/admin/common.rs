//! Browser helpers for admin islands: uploads, confirmation, navigation and the Quill editor.
use leptos::prelude::*;

#[derive(Clone, Debug, PartialEq)]
pub struct Notice { pub ok: bool, pub text: String }

pub fn ok(text: impl Into<String>) -> Option<Notice> { Some(Notice { ok: true, text: text.into() }) }
pub fn err(error: impl std::fmt::Display) -> Option<Notice> {
    let text = error.to_string();
    let text = text.rsplit_once(": ").map(|(_, rest)| rest.to_string()).unwrap_or(text);
    Some(Notice { ok: false, text })
}

#[component]
pub fn Toast(notice: RwSignal<Option<Notice>>) -> impl IntoView {
    view! {
        {move || notice.get().map(|n| view! {
            <div class="toast" data-kind=if n.ok { "ok" } else { "error" } role="status" on:click=move |_| notice.set(None)>{n.text}</div>
        })}
    }
}

pub fn confirm(message: &str) -> bool {
    #[cfg(feature = "hydrate")]
    { return web_sys::window().and_then(|w| w.confirm_with_message(message).ok()).unwrap_or(false); }
    #[allow(unreachable_code)]
    { let _ = message; false }
}

pub fn go(url: &str) {
    #[cfg(feature = "hydrate")]
    if let Some(w) = web_sys::window() { let _ = w.location().assign(url); }
    let _ = url;
}

pub fn reload() {
    #[cfg(feature = "hydrate")]
    if let Some(w) = web_sys::window() { let _ = w.location().reload(); }
}

/// Upload a file to an admin endpoint (`/api/admin/upload-image` or `/api/admin/upload-file`); returns the URL.
#[cfg(feature = "hydrate")]
pub async fn upload(file: web_sys::File, endpoint: &str) -> Result<String, String> {
    use wasm_bindgen::JsCast;
    use wasm_bindgen_futures::JsFuture;
    let form = web_sys::FormData::new().map_err(|_| "FormData unavailable")?;
    form.append_with_blob_and_filename("file", &file, &file.name()).map_err(|_| "Không đọc được tệp")?;
    let init = web_sys::RequestInit::new();
    init.set_method("POST");
    init.set_body(&form);
    let request = web_sys::Request::new_with_str_and_init(endpoint, &init).map_err(|_| "Request error")?;
    let window = web_sys::window().ok_or("no window")?;
    let response: web_sys::Response = JsFuture::from(window.fetch_with_request(&request)).await.map_err(|_| "Không kết nối được máy chủ")?.dyn_into().map_err(|_| "Bad response")?;
    let json = JsFuture::from(response.json().map_err(|_| "Bad JSON")?).await.map_err(|_| "Bad JSON")?;
    let get = |key: &str| js_sys::Reflect::get(&json, &key.into()).ok();
    if response.ok() {
        get("url").and_then(|v| v.as_string()).ok_or_else(|| "Máy chủ không trả về URL".into())
    } else {
        Err(get("message").and_then(|v| v.as_string()).unwrap_or_else(|| format!("Lỗi tải lên ({})", response.status())))
    }
}

/// File input button that uploads the chosen file(s) and reports each URL.
#[component]
pub fn UploadButton(
    #[prop(into)] label: String,
    endpoint: &'static str,
    #[prop(default = "image/png,image/jpeg,image/webp,image/gif")] accept: &'static str,
    #[prop(optional)] multiple: bool,
    on_uploaded: Callback<String>,
    notice: RwSignal<Option<Notice>>,
) -> impl IntoView {
    let busy = RwSignal::new(false);
    let input = NodeRef::<leptos::html::Input>::new();
    #[cfg(not(feature = "hydrate"))]
    let _ = (endpoint, on_uploaded, notice);
    let on_change = move |_| {
        #[cfg(feature = "hydrate")]
        {
            let Some(el) = input.get() else { return };
            let Some(files) = el.files() else { return };
            let files: Vec<web_sys::File> = (0..files.length()).filter_map(|i| files.get(i)).collect();
            el.set_value("");
            if files.is_empty() { return; }
            busy.set(true);
            leptos::task::spawn_local(async move {
                for file in files {
                    match upload(file, endpoint).await {
                        Ok(url) => on_uploaded.run(url),
                        Err(e) => notice.set(err(e)),
                    }
                }
                busy.set(false);
            });
        }
    };
    view! {
        <label class="btn btn-sm" aria-busy=move || busy.get().to_string()>
            <input node_ref=input type="file" accept=accept multiple=multiple on:change=on_change style="display:none" />
            {move || if busy.get() { "Đang tải lên…".to_string() } else { label.clone() }}
        </label>
    }
}

/// Mount Quill (loaded from /vendor/quill) on `host` with `html`; returns the editor instance.
#[cfg(feature = "hydrate")]
pub fn mount_quill(host: &web_sys::HtmlElement, html: &str, notice: RwSignal<Option<Notice>>) -> Option<wasm_bindgen::JsValue> {
    use js_sys::{Array, Function, Object, Reflect};
    use wasm_bindgen::{prelude::*, JsCast};
    let window = web_sys::window()?;
    let ctor: Function = Reflect::get(&window, &"Quill".into()).ok()?.dyn_into().ok()?;
    let toolbar = Array::new();
    let group = |items: &[JsValue]| { let a = Array::new(); for i in items { a.push(i); } a };
    let header = Object::new();
    let _ = Reflect::set(&header, &"header".into(), &group(&[2.into(), 3.into(), 4.into(), JsValue::FALSE]));
    toolbar.push(&group(&[header.into()]));
    toolbar.push(&group(&["bold".into(), "italic".into(), "underline".into(), "strike".into(), "link".into()]));
    let ordered = Object::new(); let _ = Reflect::set(&ordered, &"list".into(), &"ordered".into());
    let bullet = Object::new(); let _ = Reflect::set(&bullet, &"list".into(), &"bullet".into());
    toolbar.push(&group(&[ordered.into(), bullet.into(), "blockquote".into(), "code-block".into()]));
    toolbar.push(&group(&["image".into(), "video".into(), "clean".into()]));
    let toolbar_options = Object::new();
    let _ = Reflect::set(&toolbar_options, &"container".into(), &toolbar);
    let handlers = Object::new();
    let quill_cell: std::rc::Rc<std::cell::RefCell<Option<JsValue>>> = Default::default();
    {
        let cell = quill_cell.clone();
        let image = Closure::<dyn FnMut()>::new(move || {
            let Some(document) = web_sys::window().and_then(|w| w.document()) else { return };
            let Ok(input) = document.create_element("input") else { return };
            let input: web_sys::HtmlInputElement = input.unchecked_into();
            input.set_type("file");
            input.set_accept("image/png,image/jpeg,image/webp,image/gif");
            let cell = cell.clone();
            let picker = input.clone();
            let on_change = Closure::once_into_js(move || {
                let Some(file) = picker.files().and_then(|f| f.get(0)) else { return };
                leptos::task::spawn_local(async move {
                    match upload(file, "/api/admin/upload-image").await {
                        Ok(url) => {
                            if let Some(quill) = cell.borrow().clone() {
                                let range = Reflect::get(&quill, &"getSelection".into()).ok().and_then(|f| f.dyn_into::<Function>().ok()).and_then(|f| f.call1(&quill, &JsValue::TRUE).ok());
                                let index = range.and_then(|r| Reflect::get(&r, &"index".into()).ok()).and_then(|i| i.as_f64()).unwrap_or(0.0);
                                if let Some(insert) = Reflect::get(&quill, &"insertEmbed".into()).ok().and_then(|f| f.dyn_into::<Function>().ok()) {
                                    let _ = insert.call3(&quill, &index.into(), &"image".into(), &url.into());
                                }
                            }
                        }
                        Err(e) => notice.set(err(e)),
                    }
                });
            });
            input.set_onchange(Some(on_change.unchecked_ref()));
            input.click();
        });
        let _ = Reflect::set(&handlers, &"image".into(), image.as_ref());
        image.forget();
    }
    let _ = Reflect::set(&toolbar_options, &"handlers".into(), &handlers);
    let modules = Object::new();
    let _ = Reflect::set(&modules, &"toolbar".into(), &toolbar_options);
    let options = Object::new();
    let _ = Reflect::set(&options, &"theme".into(), &"snow".into());
    let _ = Reflect::set(&options, &"modules".into(), &modules);
    let _ = Reflect::set(&options, &"placeholder".into(), &"Viết nội dung…".into());
    let editor_host: JsValue = host.clone().into();
    let quill = Reflect::construct(&ctor, &group(&[editor_host, options.into()])).ok()?;
    if let Ok(root) = Reflect::get(&quill, &"root".into()) {
        if let Ok(root) = root.dyn_into::<web_sys::HtmlElement>() { root.set_inner_html(html); }
    }
    *quill_cell.borrow_mut() = Some(quill.clone());
    Some(quill)
}

#[cfg(feature = "hydrate")]
pub fn quill_html(quill: &wasm_bindgen::JsValue) -> Option<String> {
    use wasm_bindgen::JsCast;
    let root = js_sys::Reflect::get(quill, &"root".into()).ok()?.dyn_into::<web_sys::HtmlElement>().ok()?;
    let html = root.inner_html();
    Some(if html == "<p><br></p>" { String::new() } else { html })
}
