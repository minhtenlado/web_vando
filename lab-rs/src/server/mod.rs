//! Server-only code: database, auth, sanitizing, HTTP routes.
pub mod db;
pub mod github;
pub mod http_app;
pub mod interact;
pub mod rest;
pub mod sanitize;
pub mod settings;
pub mod state;

pub use http_app::run;
