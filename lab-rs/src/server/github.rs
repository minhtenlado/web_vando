//! Public GitHub repositories with a one-hour in-memory cache (port of `src/lib/cv/github.ts`).
use crate::model::GithubRepo;
use serde_json::Value;
use std::time::{Duration, Instant};

#[derive(Default)]
pub struct Cache {
    pub user: String,
    pub fetched: Option<Instant>,
    pub repos: Vec<GithubRepo>,
}

const TTL: Duration = Duration::from_secs(3600);

pub fn username(value: &str) -> Option<String> {
    let raw = value.trim();
    let valid = |name: &str| {
        !name.is_empty() && name.len() <= 39 && name.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') && !name.starts_with('-') && !name.ends_with('-') && !name.contains("--")
    };
    if valid(raw) { return Some(raw.to_string()); }
    let rest = raw.strip_prefix("https://").or_else(|| raw.strip_prefix("http://")).unwrap_or(raw);
    let rest = rest.strip_prefix("www.").unwrap_or(rest);
    let path = rest.strip_prefix("github.com/")?;
    let name = path.split(['/', '?', '#']).next()?;
    valid(name).then(|| name.to_string())
}

/// Repository name for a GitHub URL owned by `owner`, used to link repositories to case studies.
pub fn repo_name(url: &str, owner: &str) -> Option<String> {
    let rest = url.trim().strip_prefix("https://").or_else(|| url.trim().strip_prefix("http://"))?;
    let rest = rest.strip_prefix("www.").unwrap_or(rest);
    let path = rest.strip_prefix("github.com/")?;
    let mut parts = path.split('/').filter(|p| !p.is_empty());
    let (user, repo) = (parts.next()?, parts.next()?);
    user.eq_ignore_ascii_case(owner).then(|| repo.trim_end_matches(".git").to_ascii_lowercase())
}

fn text(value: &Value, key: &str) -> String {
    value.get(key).and_then(Value::as_str).map(str::trim).unwrap_or("").to_string()
}

pub async fn fetch(http: &reqwest::Client, user: &str) -> Result<Vec<GithubRepo>, String> {
    let mut request = http
        .get(format!("https://api.github.com/users/{user}/repos?per_page=100&type=owner&sort=pushed"))
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "engineering-lab-site")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .timeout(Duration::from_secs(8));
    if let Ok(token) = std::env::var("GITHUB_TOKEN") {
        if !token.trim().is_empty() { request = request.bearer_auth(token.trim()); }
    }
    let response = request.send().await.map_err(|e| e.to_string())?;
    if !response.status().is_success() { return Err(format!("GitHub responded {}", response.status())); }
    let body: Value = response.json().await.map_err(|e| e.to_string())?;
    let items = body.as_array().ok_or("unexpected GitHub response")?;
    let mut repos: Vec<GithubRepo> = items
        .iter()
        .filter(|r| r.get("fork") != Some(&Value::Bool(true)) && r.get("archived") != Some(&Value::Bool(true)) && r.get("private") != Some(&Value::Bool(true)))
        .filter(|r| { let name = text(r, "name"); !name.is_empty() && !name.eq_ignore_ascii_case(user) })
        .map(|r| GithubRepo {
            name: text(r, "name"),
            description: text(r, "description").chars().take(300).collect(),
            url: { let u = text(r, "html_url"); if u.starts_with("https://") { u } else { format!("https://github.com/{user}/{}", text(r, "name")) } },
            homepage: Some(text(r, "homepage")).filter(|h| h.starts_with("https://")),
            language: Some(text(r, "language")).filter(|l| !l.is_empty()),
            stars: r.get("stargazers_count").and_then(Value::as_i64).unwrap_or(0),
            forks: r.get("forks_count").and_then(Value::as_i64).unwrap_or(0),
            pushed_at: text(r, "pushed_at"),
            topics: r.get("topics").and_then(Value::as_array).map(|t| t.iter().filter_map(|x| x.as_str().map(str::to_string)).take(6).collect()).unwrap_or_default(),
        })
        .collect();
    repos.sort_by(|a, b| b.pushed_at.cmp(&a.pushed_at));
    Ok(repos)
}

/// Cached repositories; stale data is served if a refresh fails.
pub async fn repos(state: &crate::server::state::AppState, user: &str) -> Result<Vec<GithubRepo>, String> {
    {
        let cache = state.github.read().await;
        if cache.user == user && cache.fetched.is_some_and(|t| t.elapsed() < TTL) { return Ok(cache.repos.clone()); }
    }
    match fetch(&state.http, user).await {
        Ok(repos) => {
            let mut cache = state.github.write().await;
            *cache = Cache { user: user.to_string(), fetched: Some(Instant::now()), repos: repos.clone() };
            Ok(repos)
        }
        Err(error) => {
            let cache = state.github.read().await;
            if cache.user == user && !cache.repos.is_empty() { Ok(cache.repos.clone()) } else { Err(error) }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn parses_usernames_and_repos() {
        assert_eq!(username("github.com/minhtenlado").as_deref(), Some("minhtenlado"));
        assert_eq!(username("https://github.com/minhtenlado/x").as_deref(), Some("minhtenlado"));
        assert_eq!(username("https://gitlab.com/x"), None);
        assert_eq!(repo_name("https://github.com/minhtenlado/robot_2026.git", "minhtenlado").as_deref(), Some("robot_2026"));
        assert_eq!(repo_name("https://github.com/other/x", "minhtenlado"), None);
    }
}
