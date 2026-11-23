//! Server-only code: database, auth, sanitizing, HTTP routes.
pub mod admin;
pub mod auth;
pub mod cloudinary;
pub mod db;
pub mod github;
pub mod http_app;
pub mod interact;
pub mod rest;
pub mod sanitize;
pub mod settings;
pub mod state;

pub use http_app::run;
