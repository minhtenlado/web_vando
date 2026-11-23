//! Port of `getPublicSettings` + `toPresentationData`: only allowlisted presentation keys leave the server.
use crate::model::{Locale, SiteSettings};
use crate::server::db::safe_url;
use serde_json::Value;

const DEFAULT_NAME: &str = "Engineering Lab";
const DEFAULT_TAGLINE: &str = "Embedded systems, edge AI, and robotics projects.";

/// Strings that older CMS versions stored as defaults and which should be replaced by the current ones.
const OLD_DEFAULTS: [&str; 8] = [
    "Phần cứng.\nPhần mềm.\nThử nghiệm.", "Hardware.\nSoftware.\nExperiments.",
    "Dự án và bài viết kỹ thuật", "Engineering projects and notes",
    "Dự án kỹ thuật. Sản phẩm thực tế.", "Engineering projects. Built systems.",
    "Khám phá các hệ thống phần cứng, phần mềm, trí tuệ nhân tạo và công nghệ nhúng — từ thiết kế đến thử nghiệm.",
    "Explore hardware, software, artificial intelligence, and embedded systems through real project work.",
];

fn has_personal_name(text: &str) -> bool {
    // The public brand is "Engineering Lab"; the owner chose not to put the personal name in hero/meta copy.
    let folded = crate::text::normalize_search(text);
    folded.contains("phan huynh van do")
}

fn setting(source: &Value, key: &str, fallback: &str) -> String {
    let text = source.get(key).and_then(Value::as_str).map(str::trim).unwrap_or("");
    if text.is_empty() || has_personal_name(text) || OLD_DEFAULTS.contains(&text) { fallback.to_string() } else { text.to_string() }
}

pub fn public_settings(source: &Value, locale: Locale, email: Option<&str>, github: Option<&str>) -> SiteSettings {
    let (headline_key, description_key, primary_key, secondary_key) = match locale {
        Locale::Vi => ("heroHeadlineVi", "heroDescriptionVi", "heroPrimaryLabelVi", "heroSecondaryLabelVi"),
        Locale::En => ("heroHeadlineEn", "heroDescriptionEn", "heroPrimaryLabelEn", "heroSecondaryLabelEn"),
    };
    let tagline = setting(source, "portfolioTagline", DEFAULT_TAGLINE);
    let tagline = if ["developer", "software developer", "software engineer", "embedded engineer", "programmer"]
        .iter()
        .any(|prefix| tagline.to_ascii_lowercase().starts_with(prefix))
    { DEFAULT_TAGLINE.to_string() } else { tagline };
    let meta_title = source.get("metaTitle").or_else(|| source.get("title")).and_then(Value::as_str).unwrap_or("");
    let meta_description = source.get("metaDescription").or_else(|| source.get("description")).and_then(Value::as_str).unwrap_or("");
    let analytics_enabled = source.get("analyticsEnabled").and_then(Value::as_bool).unwrap_or(false);
    let analytics_id = source.get("analyticsId").and_then(Value::as_str).unwrap_or("");
    let secondary_url = source.get("heroSecondaryUrl").and_then(Value::as_str).and_then(|v| safe_url(Some(v)));
    // The previous home page listed projects under `#projects`; here they live on /projects.
    let primary_url = source.get("heroPrimaryUrl").and_then(Value::as_str).and_then(|v| safe_url(Some(v)))
        .filter(|u| u != "#projects").unwrap_or_else(|| "/projects".into());
    let og_title = source.get("ogTitle").and_then(Value::as_str).map(str::trim)
        .filter(|t| !t.is_empty() && !has_personal_name(t)).map(str::to_string);
    let og_image = source.get("ogImageUrl").and_then(Value::as_str).map(crate::server::db::safe_image).filter(|u| !u.is_empty());
    SiteSettings {
        portfolio_name: setting(source, "portfolioName", DEFAULT_NAME),
        tagline,
        hero_headline: setting(source, headline_key, locale.t("Dự án &\nthử nghiệm.", "Projects &\nexperiments.")),
        hero_description: setting(source, description_key, locale.t(
            "Các dự án phần cứng, hệ thống nhúng, AI, IoT và ghi chép trong quá trình phát triển.",
            "Hardware, embedded systems, AI, and IoT projects, with technical notes from their development.")),
        hero_primary_label: setting(source, primary_key, locale.t("Khám phá dự án", "Explore projects")),
        hero_secondary_label: setting(source, secondary_key, locale.t("Mã nguồn trên GitHub", "GitHub source code")),
        meta_title: if meta_title.trim().is_empty() || has_personal_name(meta_title) { "Engineering Lab | Embedded Systems, Edge AI & Robotics".into() } else { meta_title.trim().into() },
        meta_description: if meta_description.trim().is_empty() || has_personal_name(meta_description) {
            "Technical projects across embedded systems, edge AI, robotics, IoT, hardware, and software.".into()
        } else { meta_description.trim().into() },
        github_url: secondary_url.or_else(|| github.and_then(|g| safe_url(Some(g)))),
        email: email.map(str::trim).filter(|e| e.contains('@')).map(str::to_string),
        analytics_id: (analytics_enabled
            && !analytics_id.is_empty()
            && analytics_id.len() <= 128
            && analytics_id.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-'))
        .then(|| analytics_id.to_string()),
        hero_primary_url: primary_url,
        og_title,
        og_image,
        featured_enabled: source.get("sectionFeaturedEnabled").and_then(Value::as_bool) != Some(false),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn filters_identity_and_old_defaults() {
        let source = serde_json::json!({ "heroHeadlineVi": "Dự án và bài viết kỹ thuật", "portfolioName": "Phan Huỳnh Văn Đô", "metaTitle": "Lab" });
        let s = public_settings(&source, Locale::Vi, Some("a@b.c"), Some("github.com/minhtenlado"));
        assert_eq!(s.hero_headline, "Dự án &\nthử nghiệm.");
        assert_eq!(s.portfolio_name, "Engineering Lab");
        assert_eq!(s.meta_title, "Lab");
        assert_eq!(s.github_url.as_deref(), Some("https://github.com/minhtenlado"));
        assert_eq!(s.hero_primary_url, "/projects");
        assert!(s.featured_enabled && s.og_title.is_none() && s.og_image.is_none());
    }

    #[test]
    fn reads_hero_link_og_and_section_toggle() {
        let source = serde_json::json!({
            "heroPrimaryUrl": "/hardware-lab", "ogTitle": "Engineering Lab", "sectionFeaturedEnabled": false,
            "ogImageUrl": "https://res.cloudinary.com/s4sbshc3/image/upload/v1/web_vando/images/og.png",
        });
        let s = public_settings(&source, Locale::En, None, None);
        assert_eq!(s.hero_primary_url, "/hardware-lab");
        assert_eq!(s.og_title.as_deref(), Some("Engineering Lab"));
        assert!(s.og_image.is_some() && !s.featured_enabled);
        let unsafe_image = serde_json::json!({ "ogImageUrl": "https://evil.test/a.png", "heroPrimaryUrl": "#projects" });
        let s = public_settings(&unsafe_image, Locale::Vi, None, None);
        assert!(s.og_image.is_none());
        assert_eq!(s.hero_primary_url, "/projects");
    }
}
