#![recursion_limit = "256"]
pub mod api;
pub mod app;
pub mod islands;
pub mod model;
pub mod pages;
pub mod text;
pub mod ui;

#[cfg(feature = "ssr")]
pub mod server;

#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn hydrate() {
    console_error_panic_hook::set_once();
    leptos::mount::hydrate_islands();
}
