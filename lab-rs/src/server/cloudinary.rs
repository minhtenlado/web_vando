//! Cloudinary REST client: signed uploads, folder listing and deletion (same folders as before).
use crate::model::MediaItem;
use serde_json::Value;
use sha1::{Digest, Sha1};
use std::time::Duration;

struct Creds { cloud: String, key: String, secret: String }

fn creds() -> Result<Creds, String> {
    let get = |k: &str| std::env::var(k).ok().filter(|v| !v.trim().is_empty()).ok_or_else(|| format!("{k} is not configured"));
    Ok(Creds { cloud: get("CLOUDINARY_CLOUD_NAME")?, key: get("CLOUDINARY_API_KEY")?, secret: get("CLOUDINARY_API_SECRET")? })
}

fn signature(params: &[(&str, String)], secret: &str) -> String {
    let mut sorted: Vec<_> = params.iter().filter(|(_, v)| !v.is_empty()).collect();
    sorted.sort_by(|a, b| a.0.cmp(b.0));
    let joined = sorted.iter().map(|(k, v)| format!("{k}={v}")).collect::<Vec<_>>().join("&");
    hex::encode(Sha1::digest(format!("{joined}{secret}").as_bytes()))
}

/// `kind`: "image" or "raw" (PDF and other documents).
pub async fn upload(http: &reqwest::Client, bytes: Vec<u8>, filename: &str, folder: &str, kind: &str) -> Result<String, String> {
    let c = creds()?;
    let timestamp = chrono::Utc::now().timestamp().to_string();
    let params = [("folder", folder.to_string()), ("timestamp", timestamp.clone())];
    let form = reqwest::multipart::Form::new()
        .part("file", reqwest::multipart::Part::bytes(bytes).file_name(filename.to_string()))
        .text("api_key", c.key.clone())
        .text("timestamp", timestamp)
        .text("folder", folder.to_string())
        .text("signature", signature(&params, &c.secret));
    let response = http
        .post(format!("https://api.cloudinary.com/v1_1/{}/{kind}/upload", c.cloud))
        .multipart(form)
        .timeout(Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let body: Value = response.json().await.map_err(|e| e.to_string())?;
    body.get("secure_url").and_then(Value::as_str).map(str::to_string).ok_or_else(|| body.get("error").and_then(|e| e.get("message")).and_then(Value::as_str).unwrap_or("upload failed").to_string())
}

pub async fn list(http: &reqwest::Client, prefix: &str, cursor: Option<String>) -> Result<(Vec<MediaItem>, Option<String>), String> {
    let c = creds()?;
    let mut request = http
        .get(format!("https://api.cloudinary.com/v1_1/{}/resources/image/upload", c.cloud))
        .basic_auth(&c.key, Some(&c.secret))
        .query(&[("prefix", prefix), ("max_results", "100")])
        .timeout(Duration::from_secs(20));
    if let Some(cursor) = cursor.filter(|c| !c.is_empty()) { request = request.query(&[("next_cursor", cursor)]); }
    let body: Value = request.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;
    let items = body.get("resources").and_then(Value::as_array).ok_or_else(|| body.get("error").and_then(|e| e.get("message")).and_then(Value::as_str).unwrap_or("listing failed").to_string())?;
    let media = items.iter().map(|r| MediaItem {
        public_id: r.get("public_id").and_then(Value::as_str).unwrap_or("").to_string(),
        url: r.get("secure_url").and_then(Value::as_str).unwrap_or("").to_string(),
        bytes: r.get("bytes").and_then(Value::as_i64).unwrap_or(0),
        width: r.get("width").and_then(Value::as_i64).unwrap_or(0),
        height: r.get("height").and_then(Value::as_i64).unwrap_or(0),
        format: r.get("format").and_then(Value::as_str).unwrap_or("").to_string(),
        created_at: r.get("created_at").and_then(Value::as_str).unwrap_or("").to_string(),
        used_by: Vec::new(),
    }).collect();
    Ok((media, body.get("next_cursor").and_then(Value::as_str).map(str::to_string)))
}

pub async fn destroy(http: &reqwest::Client, public_id: &str) -> Result<(), String> {
    let c = creds()?;
    let timestamp = chrono::Utc::now().timestamp().to_string();
    let params = [("public_id", public_id.to_string()), ("timestamp", timestamp.clone())];
    let form = [("public_id", public_id.to_string()), ("timestamp", timestamp), ("api_key", c.key.clone()), ("signature", signature(&params, &c.secret))];
    let body: Value = http.post(format!("https://api.cloudinary.com/v1_1/{}/image/destroy", c.cloud)).form(&form).timeout(Duration::from_secs(20))
        .send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;
    match body.get("result").and_then(Value::as_str) { Some("ok") | Some("not found") => Ok(()), _ => Err(body.to_string()) }
}

#[cfg(test)]
mod tests {
    #[test]
    fn signature_matches_cloudinary_docs_example() {
        // https://cloudinary.com/documentation/authentication_signatures example
        let params = [("eager", "w_400,h_300,c_pad|w_260,h_200,c_crop".to_string()), ("public_id", "sample_image".to_string()), ("timestamp", "1315060510".to_string())];
        assert_eq!(super::signature(&params, "abcd"), "bfd09f95f331f558cbd1320e67aa8d488770583e");
    }
}
