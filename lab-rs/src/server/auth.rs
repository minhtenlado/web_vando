//! Admin authentication, byte-compatible with the previous Next.js implementation:
//! cookie `admin_session` = base64url(JSON{exp,v}) + "." + base64url(HMAC-SHA256(SESSION_SECRET, body)),
//! passwords stored as `salt:hex(scrypt(password, salt, N=16384, r=8, p=1, 64))`.
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use subtle::ConstantTimeEq;

pub const COOKIE: &str = "admin_session";
pub const MAX_AGE_SECONDS: i64 = 60 * 60 * 24 * 7;

fn secret() -> Option<String> {
    std::env::var("SESSION_SECRET").ok().filter(|s| !s.is_empty())
}

fn hmac(secret: &str, body: &str) -> Vec<u8> {
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).expect("hmac accepts any key length");
    mac.update(body.as_bytes());
    mac.finalize().into_bytes().to_vec()
}

pub fn sign(exp_ms: i64, v: &str) -> Option<String> {
    let secret = secret()?;
    let body = URL_SAFE_NO_PAD.encode(serde_json::json!({ "exp": exp_ms, "v": v }).to_string());
    let sig = URL_SAFE_NO_PAD.encode(hmac(&secret, &body));
    Some(format!("{body}.{sig}"))
}

/// Returns the `v` claim of a valid, unexpired token.
pub fn verify(token: &str) -> Option<String> {
    let secret = secret()?;
    let (body, sig) = token.split_once('.')?;
    if sig.contains('.') { return None; }
    let expected = URL_SAFE_NO_PAD.encode(hmac(&secret, body));
    if expected.as_bytes().ct_eq(sig.as_bytes()).unwrap_u8() != 1 { return None; }
    let payload: serde_json::Value = serde_json::from_slice(&URL_SAFE_NO_PAD.decode(body).ok()?).ok()?;
    let exp = payload.get("exp")?.as_f64()?;
    if (chrono::Utc::now().timestamp_millis() as f64) > exp { return None; }
    Some(payload.get("v").and_then(|v| v.as_str()).unwrap_or("").to_string())
}

pub fn cookie_value(headers: &http::HeaderMap) -> Option<String> {
    headers.get_all(http::header::COOKIE).iter().filter_map(|v| v.to_str().ok()).flat_map(|v| v.split(';')).find_map(|pair| {
        pair.trim().strip_prefix(&format!("{COOKIE}=")).map(str::to_string)
    })
}

pub fn session_cookie(token: &str) -> String {
    let secure = if std::env::var("LEPTOS_ENV").map(|e| e.eq_ignore_ascii_case("PROD")).unwrap_or(true) { "; Secure" } else { "" };
    format!("{COOKIE}={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={MAX_AGE_SECONDS}{secure}")
}

pub fn clear_cookie() -> String {
    format!("{COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0")
}

async fn stored_hash(pool: &PgPool) -> sqlx::Result<Option<String>> {
    let rows = sqlx::query_scalar::<_, Option<String>>(r#"SELECT "passwordHash" FROM "Profile" WHERE id IN ('profile-vi', 'profile-en', 'profile') ORDER BY id"#)
        .fetch_all(pool)
        .await?;
    Ok(rows.into_iter().flatten().find(|h| !h.is_empty()))
}

/// Session version: first 10 characters of the stored hash, so changing the password invalidates sessions.
pub async fn session_version(pool: &PgPool) -> sqlx::Result<String> {
    Ok(stored_hash(pool).await?.map(|h| h.chars().take(10).collect()).unwrap_or_default())
}

pub async fn is_authed(pool: &PgPool, headers: &http::HeaderMap) -> bool {
    let Some(v) = cookie_value(headers).as_deref().and_then(verify) else { return false };
    match session_version(pool).await {
        Ok(current) => current == v,
        // Same as before: a database outage must not lock the owner out of an otherwise valid session.
        Err(_) => true,
    }
}

fn scrypt_hex(password: &str, salt: &str) -> Option<String> {
    let params = scrypt::Params::new(14, 8, 1, 64).ok()?;
    let mut out = [0u8; 64];
    scrypt::scrypt(password.as_bytes(), salt.as_bytes(), &params, &mut out).ok()?;
    Some(hex::encode(out))
}

pub fn hash_password(password: &str) -> Option<String> {
    use rand::RngCore;
    let mut salt = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt);
    let salt = hex::encode(salt);
    Some(format!("{salt}:{}", scrypt_hex(password, &salt)?))
}

pub fn compare_password(password: &str, stored: &str) -> bool {
    let Some((salt, key)) = stored.split_once(':') else { return false };
    let Some(derived) = scrypt_hex(password, salt) else { return false };
    derived.as_bytes().ct_eq(key.as_bytes()).unwrap_u8() == 1
}

pub async fn verify_password(pool: &PgPool, password: &str) -> bool {
    let password = password.to_string();
    match stored_hash(pool).await {
        Ok(Some(hash)) => tokio::task::spawn_blocking(move || compare_password(&password, &hash)).await.unwrap_or(false),
        _ => std::env::var("ADMIN_PASSWORD")
            .ok()
            .filter(|p| !p.is_empty())
            .map(|expected| expected.as_bytes().ct_eq(password.as_bytes()).unwrap_u8() == 1)
            .unwrap_or(false),
    }
}

/// Five failed attempts within a minute lock the address for five minutes (previous behaviour).
#[derive(Default)]
pub struct LoginGuard {
    attempts: Mutex<HashMap<String, (Instant, u32)>>,
}

impl LoginGuard {
    pub fn retry_after(&self, ip: &str) -> Option<u64> {
        let mut map = self.attempts.lock().expect("login guard");
        let now = Instant::now();
        map.retain(|_, (first, _)| now.duration_since(*first) < Duration::from_secs(300));
        let (first, count) = map.get(ip)?;
        (*count >= 5).then(|| 300u64.saturating_sub(now.duration_since(*first).as_secs()).max(1))
    }
    pub fn fail(&self, ip: &str) {
        let mut map = self.attempts.lock().expect("login guard");
        let now = Instant::now();
        let entry = map.entry(ip.to_string()).or_insert((now, 0));
        if now.duration_since(entry.0) > Duration::from_secs(60) && entry.1 < 5 { *entry = (now, 0); }
        entry.1 += 1;
    }
    pub fn clear(&self, ip: &str) {
        self.attempts.lock().expect("login guard").remove(ip);
    }
}

pub async fn log_activity(pool: &PgPool, category: &str, action: &str, title: &str, detail: &str, resource: &str, status: &str) {
    let result = sqlx::query(r#"INSERT INTO "ActivityLog" (id, category, action, title, detail, resource, "user", status) VALUES ($1, $2, $3, $4, $5, $6, 'Admin', $7)"#)
        .bind(crate::server::interact::new_id()).bind(category).bind(action).bind(title).bind(detail).bind(resource).bind(status)
        .execute(pool).await;
    if let Err(error) = result { tracing::warn!("[activity] not recorded: {error}"); }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn password_hash_round_trip() {
        let hash = hash_password("correct horse").unwrap();
        assert!(compare_password("correct horse", &hash));
        assert!(!compare_password("wrong", &hash));
    }

    #[test]
    fn matches_node_scrypt_vector() {
        // crypto.scryptSync("lab-vector-pass", "00112233445566778899aabbccddeeff", 64).toString("hex")
        let key = scrypt_hex("lab-vector-pass", "00112233445566778899aabbccddeeff").unwrap();
        assert_eq!(key, "2e5ce6a76c713f3cda7db37684f0a16caef344555e3384980f7bdf0c5ef4ccf13bd8376ab19603c805e32d2f76bb9f158a1a76f79e5f6e2fc79908e02accc6c4");
        assert!(compare_password("lab-vector-pass", &format!("00112233445566778899aabbccddeeff:{key}")));
    }

    #[test]
    fn token_round_trip_and_tamper() {
        unsafe { std::env::set_var("SESSION_SECRET", "test-secret") };
        let exp = chrono::Utc::now().timestamp_millis() + 60_000;
        let token = sign(exp, "abcdef0123").unwrap();
        assert_eq!(verify(&token).as_deref(), Some("abcdef0123"));
        let mut tampered = token.clone();
        tampered.push('x');
        assert!(verify(&tampered).is_none());
        // Token produced by the Node.js implementation with the same secret.
        let node = "eyJleHAiOjQxMDI0NDQ4MDAwMDAsInYiOiJhYmNkZWYwMTIzIn0.l5nXof8f1If8Wp4W_5vI5aZS_dk-gUfxoTZsVmJ8Bm0";
        assert_eq!(verify(node).as_deref(), Some("abcdef0123"));
        assert_eq!(sign(4102444800000, "abcdef0123").as_deref(), Some(node));
        let expired = sign(chrono::Utc::now().timestamp_millis() - 1, "v").unwrap();
        assert!(verify(&expired).is_none());
    }
}
