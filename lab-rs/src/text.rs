//! Presentation helpers shared by server rendering and islands.
use crate::model::Locale;

/// Lowercase, strip Vietnamese diacritics (including đ) and collapse whitespace for accent-insensitive search.
pub fn normalize_search(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for ch in value.chars().flat_map(char::to_lowercase) {
        out.push(fold_vietnamese(ch));
    }
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn fold_vietnamese(ch: char) -> char {
    match ch {
        'à' | 'á' | 'ả' | 'ã' | 'ạ' | 'ă' | 'ằ' | 'ắ' | 'ẳ' | 'ẵ' | 'ặ' | 'â' | 'ầ' | 'ấ' | 'ẩ' | 'ẫ' | 'ậ' => 'a',
        'è' | 'é' | 'ẻ' | 'ẽ' | 'ẹ' | 'ê' | 'ề' | 'ế' | 'ể' | 'ễ' | 'ệ' => 'e',
        'ì' | 'í' | 'ỉ' | 'ĩ' | 'ị' => 'i',
        'ò' | 'ó' | 'ỏ' | 'õ' | 'ọ' | 'ô' | 'ồ' | 'ố' | 'ổ' | 'ỗ' | 'ộ' | 'ơ' | 'ờ' | 'ớ' | 'ở' | 'ỡ' | 'ợ' => 'o',
        'ù' | 'ú' | 'ủ' | 'ũ' | 'ụ' | 'ư' | 'ừ' | 'ứ' | 'ử' | 'ữ' | 'ự' => 'u',
        'ỳ' | 'ý' | 'ỷ' | 'ỹ' | 'ỵ' => 'y',
        'đ' => 'd',
        '\u{0300}'..='\u{036f}' => ' ',
        other => other,
    }
}

fn has_word(haystack: &str, word: &str) -> bool {
    haystack
        .split(|c: char| !c.is_alphanumeric())
        .any(|token| token == word)
}

/// Engineering domains used for navigation and filtering, in display order.
pub const DOMAINS: [Domain; 6] = [
    Domain { key: "embedded", label_vi: "Hệ thống nhúng", label_en: "Embedded Systems", short: "Embedded", tone: "cyan",
        description_vi: "Firmware vi điều khiển, giao tiếp ngoại vi và xử lý tín hiệu thời gian thực.",
        description_en: "Microcontroller firmware, peripheral interfaces and real-time signal handling." },
    Domain { key: "pcb", label_vi: "Thiết kế PCB", label_en: "PCB Design", short: "PCB", tone: "amber",
        description_vi: "Sơ đồ nguyên lý, PCB nhiều lớp, khối nguồn và hồ sơ sản xuất.",
        description_en: "Schematics, multi-layer boards, power stages and manufacturing files." },
    Domain { key: "iot", label_vi: "Internet vạn vật", label_en: "IoT", short: "IoT", tone: "green",
        description_vi: "Thiết bị kết nối, truyền dữ liệu không dây và giám sát từ xa.",
        description_en: "Connected devices, wireless telemetry and remote monitoring." },
    Domain { key: "edge-ai", label_vi: "Edge AI", label_en: "Edge AI", short: "Edge AI", tone: "violet",
        description_vi: "Mô hình học sâu chạy trực tiếp trên thiết bị biên như Raspberry Pi.",
        description_en: "Deep learning models running on edge devices such as Raspberry Pi." },
    Domain { key: "robotics", label_vi: "Robot tự hành", label_en: "Robotics", short: "Robotics", tone: "pink",
        description_vi: "Động học, điều khiển chuyển động và mô phỏng robot.",
        description_en: "Kinematics, motion control and robot simulation." },
    Domain { key: "ai", label_vi: "Trí tuệ nhân tạo", label_en: "Artificial Intelligence", short: "AI", tone: "blue",
        description_vi: "Thị giác máy tính, học sâu và công cụ dữ liệu.",
        description_en: "Computer vision, deep learning and data tooling." },
];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Domain {
    pub key: &'static str,
    pub label_vi: &'static str,
    pub label_en: &'static str,
    pub short: &'static str,
    pub tone: &'static str,
    pub description_vi: &'static str,
    pub description_en: &'static str,
}

impl Domain {
    pub fn label(&self, locale: Locale) -> &'static str {
        match locale { Locale::Vi => self.label_vi, Locale::En => self.label_en }
    }
    pub fn description(&self, locale: Locale) -> &'static str {
        match locale { Locale::Vi => self.description_vi, Locale::En => self.description_en }
    }
}

pub fn domain(key: &str) -> Option<&'static Domain> {
    DOMAINS.iter().find(|domain| domain.key == key)
}

/// Classify a CMS project into engineering domains from its stored category and technology list.
/// The stored category is never rewritten; this only drives presentation.
pub fn classify_domains(category: &str, tech: &[String]) -> Vec<String> {
    let category = normalize_search(category);
    let tech = normalize_search(&tech.join(" "));
    let ai = has_word(&category, "ai") || category.contains("artificial intelligence") || category.contains("tri tue nhan tao")
        || category.contains("computer vision") || category.contains("machine learning");
    let embedded = category.contains("embedded") || category.contains("he thong nhung") || category.contains("firmware");
    let iot = has_word(&category, "iot") || category.contains("iot&") || category.contains("internet of things");
    let pcb = category.contains("hardware") || category.contains("phan cung") || has_word(&category, "pcb");
    let robotics = category.contains("robot");
    let edge_device = ["raspberry pi", "jetson", "esp32", "edge", "stm32"].iter().any(|needle| tech.contains(needle) || category.contains(needle));
    let edge_ai = ai && (iot || embedded || edge_device);
    let mut out = Vec::new();
    if embedded { out.push("embedded"); }
    if pcb { out.push("pcb"); }
    if iot { out.push("iot"); }
    if edge_ai { out.push("edge-ai"); }
    if robotics { out.push("robotics"); }
    if ai { out.push("ai"); }
    out.into_iter().map(str::to_string).collect()
}

pub fn status_label(status: &str, locale: Locale) -> Option<&'static str> {
    Some(match status {
        "completed" => locale.t("Hoàn thành", "Completed"),
        "in-development" => locale.t("Đang phát triển", "In development"),
        "prototype" => locale.t("Nguyên mẫu", "Prototype"),
        "research" => locale.t("Nghiên cứu", "Research"),
        _ => return None,
    })
}

/// Insert a Cloudinary delivery transformation; other hosts are returned unchanged.
pub fn cloudinary(url: &str, width: u32) -> String {
    match url.split_once("/image/upload/") {
        Some((head, tail)) if url.starts_with("https://res.cloudinary.com/") => {
            format!("{head}/image/upload/f_auto,q_auto,c_limit,w_{width}/{tail}")
        }
        _ => url.to_string(),
    }
}

/// `srcset` for responsive images served through Cloudinary.
pub fn srcset(url: &str, widths: &[u32]) -> Option<String> {
    if !url.starts_with("https://res.cloudinary.com/") {
        return None;
    }
    Some(widths.iter().map(|w| format!("{} {w}w", cloudinary(url, *w))).collect::<Vec<_>>().join(", "))
}

pub fn youtube_id(url: &str) -> Option<String> {
    let url = url.trim();
    if url.len() == 11 && url.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_') {
        return Some(url.to_string());
    }
    for marker in ["v=", "youtu.be/", "embed/", "shorts/"] {
        if let Some(index) = url.find(marker) {
            let id: String = url[index + marker.len()..].chars().take(11).collect();
            if id.len() == 11 && id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_') {
                return Some(id);
            }
        }
    }
    None
}

/// Medium date in Vietnam time, matching the previous `Intl.DateTimeFormat` output.
pub fn format_date(iso: &str, locale: Locale) -> String {
    let Ok(date) = chrono::DateTime::parse_from_rfc3339(iso) else { return String::new() };
    let local = date.with_timezone(&chrono::FixedOffset::east_opt(7 * 3600).expect("valid offset"));
    use chrono::Datelike;
    match locale {
        Locale::Vi => format!("{} thg {}, {}", local.day(), local.month(), local.year()),
        Locale::En => {
            const MONTHS: [&str; 12] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            format!("{} {}, {}", MONTHS[local.month0() as usize], local.day(), local.year())
        }
    }
}

/// Plain text from HTML or Markdown-ish CMS fields, for summaries and meta descriptions.
pub fn plain_text(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    let mut in_tag = false;
    for ch in value.chars() {
        match ch {
            '<' => in_tag = true,
            '>' if in_tag => { in_tag = false; out.push(' '); }
            _ if !in_tag => out.push(ch),
            _ => {}
        }
    }
    let decoded = out.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'");
    decoded.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn truncate(value: &str, max: usize) -> String {
    if value.chars().count() <= max {
        return value.to_string();
    }
    let mut out: String = value.chars().take(max).collect();
    if let Some(space) = out.rfind(' ') {
        out.truncate(space);
    }
    out.push('…');
    out
}

/// URL-safe anchor id from a heading, keeping it readable for Vietnamese text.
pub fn slugify(value: &str) -> String {
    let folded = normalize_search(value);
    let mut out = String::new();
    for ch in folded.chars() {
        if ch.is_ascii_alphanumeric() { out.push(ch); } else if !out.ends_with('-') { out.push('-'); }
    }
    out.trim_matches('-').chars().take(64).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn search_is_accent_insensitive() {
        assert_eq!(normalize_search("  Điều KHIỂN  relay "), "dieu khien relay");
    }

    #[test]
    fn classifies_existing_categories() {
        let tech = vec!["Raspberry Pi 5".to_string()];
        assert_eq!(classify_domains("IoT&AI", &tech), vec!["iot", "edge-ai", "ai"]);
        assert_eq!(classify_domains("Hardware · Embedded & IoT", &[]), vec!["embedded", "pcb", "iot"]);
        assert_eq!(classify_domains("Robotics & AI Simulation", &[]), vec!["robotics", "ai"]);
        assert_eq!(classify_domains("AI · Computer Vision", &[]), vec!["ai"]);
    }

    #[test]
    fn cloudinary_transform() {
        let url = "https://res.cloudinary.com/x/image/upload/v1/web_vando/images/a.png";
        assert_eq!(cloudinary(url, 640), "https://res.cloudinary.com/x/image/upload/f_auto,q_auto,c_limit,w_640/v1/web_vando/images/a.png");
        assert_eq!(cloudinary("https://example.com/a.png", 640), "https://example.com/a.png");
    }

    #[test]
    fn youtube_ids() {
        assert_eq!(youtube_id("https://youtu.be/IKx4tfbNLrI").as_deref(), Some("IKx4tfbNLrI"));
        assert_eq!(youtube_id("https://youtu.be/XB6H3NwzJS8?si=Ez").as_deref(), Some("XB6H3NwzJS8"));
        assert_eq!(youtube_id("https://example.com"), None);
    }

    #[test]
    fn dates_use_vietnam_time() {
        assert_eq!(format_date("2025-10-17T18:30:00Z", Locale::Vi), "18 thg 10, 2025");
        assert_eq!(format_date("2026-08-17T00:00:00Z", Locale::En), "Aug 17, 2026");
    }
}
