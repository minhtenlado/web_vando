//! CMS HTML sanitizing (replacement for the previous DOMPurify configuration).
use crate::model::Heading;
use crate::text::{plain_text, slugify};
use std::collections::HashSet;

const TRUSTED_IFRAME_HOSTS: [&str; 5] = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "codepen.io"];

fn clean_style(value: &str) -> Option<String> {
    let lower = value.to_ascii_lowercase();
    if lower.contains("url(") || lower.contains("expression") || lower.contains("@import") || lower.contains("javascript:") {
        return None;
    }
    let kept: Vec<&str> = value
        .split(';')
        .map(str::trim)
        .filter(|decl| {
            let name = decl.split(':').next().unwrap_or("").trim().to_ascii_lowercase();
            !decl.is_empty() && !matches!(name.as_str(), "word-break" | "hyphens" | "overflow-wrap" | "position" | "z-index")
        })
        .collect();
    (!kept.is_empty()).then(|| kept.join("; "))
}

fn trusted_iframe(src: &str) -> bool {
    let Some(rest) = src.strip_prefix("https://") else { return false };
    let host = rest.split(['/', '?', '#']).next().unwrap_or("");
    TRUSTED_IFRAME_HOSTS.contains(&host)
}

/// Sanitize CMS HTML. Mirrors the previous behaviour: DOMPurify defaults, `class`/`style`, `target`,
/// and iframes only from trusted video/code hosts.
pub fn sanitize_html(raw: &str) -> String {
    if raw.trim().is_empty() {
        return String::new();
    }
    let looks_like_html = raw.contains('<') && raw.contains('>');
    let source = if looks_like_html {
        raw.replace("&nbsp;", " ")
            .replace('\u{00A0}', " ")
            .replace(['\u{00AD}', '\u{200B}'], "")
            .replace("&shy;", "")
            .replace("<table", "<div class=\"table-wrap\"><table")
            .replace("</table>", "</table></div>")
    } else {
        // Plain text from older records: keep paragraphs readable.
        raw.split("\n\n").map(|p| format!("<p>{}</p>", html_escape(p.trim()))).collect::<String>()
    };

    let tags: HashSet<&str> = [
        "a", "abbr", "b", "blockquote", "br", "caption", "code", "col", "colgroup", "dd", "del", "details", "div", "dl", "dt", "em",
        "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "iframe", "img", "ins", "kbd", "li", "mark", "ol", "p",
        "pre", "s", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr",
        "u", "ul", "video",
    ]
    .into_iter()
    .collect();
    let mut builder = ammonia::Builder::default();
    builder
        .tags(tags)
        .generic_attributes(["class", "style", "title", "lang", "dir", "data-list", "data-language"].into_iter().collect())
        .add_tag_attributes("a", ["href", "target"])
        .add_tag_attributes("img", ["src", "alt", "width", "height"])
        .add_tag_attributes("iframe", ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"])
        .add_tag_attributes("video", ["src", "controls", "poster", "width", "height", "muted", "loop", "playsinline"])
        .add_tag_attributes("source", ["src", "type"])
        .add_tag_attributes("td", ["colspan", "rowspan"])
        .add_tag_attributes("th", ["colspan", "rowspan", "scope"])
        .add_tag_attributes("ol", ["start", "type"])
        .url_schemes(["http", "https", "mailto", "tel", "data"].into_iter().collect())
        .link_rel(Some("noopener noreferrer"))
        .attribute_filter(|element, attribute, value| match (element, attribute) {
            ("iframe", "src") => trusted_iframe(value).then(|| value.into()),
            (_, "style") => clean_style(value).map(Into::into),
            ("img", "src") => Some(value.into()),
            (_, "href" | "src" | "poster") if value.trim_start().to_ascii_lowercase().starts_with("data:") => None,
            ("a", "target") => (value == "_blank").then(|| value.into()),
            _ => Some(value.into()),
        });
    let clean = builder.clean(&source).to_string();
    // Iframes whose src was removed are useless boxes; drop them.
    let clean = remove_empty_iframes(&clean);
    clean
        .replace("<h1>", "<h2>")
        .replace("<h1 ", "<h2 ")
        .replace("</h1>", "</h2>")
        .replace("<img ", "<img loading=\"lazy\" decoding=\"async\" ")
}

fn remove_empty_iframes(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(start) = rest.find("<iframe") {
        out.push_str(&rest[..start]);
        let tail = &rest[start..];
        let open_end = tail.find('>').map(|i| i + 1).unwrap_or(tail.len());
        let open = &tail[..open_end];
        let close_end = tail.find("</iframe>").map(|i| i + "</iframe>".len()).unwrap_or(open_end);
        if open.contains(" src=") {
            out.push_str(&tail[..close_end]);
        }
        rest = &tail[close_end..];
    }
    out.push_str(rest);
    out
}

pub fn html_escape(value: &str) -> String {
    value.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

/// Add stable ids to h2/h3 headings of sanitized HTML and return the outline for a table of contents.
pub fn index_headings(html: &str) -> (String, Vec<Heading>) {
    let mut out = String::with_capacity(html.len() + 256);
    let mut headings = Vec::new();
    let mut used = HashSet::new();
    let mut rest = html;
    loop {
        let next = ["<h2", "<h3"].iter().filter_map(|tag| rest.find(tag).map(|i| (i, *tag))).min_by_key(|(i, _)| *i);
        let Some((start, tag)) = next else { break };
        let after = &rest[start + 3..];
        // Only real heading tags (`<h2>` or `<h2 ...>`).
        if !(after.starts_with('>') || after.starts_with(' ')) {
            out.push_str(&rest[..start + 3]);
            rest = after;
            continue;
        }
        let Some(open_end) = after.find('>') else { break };
        let close_tag = if tag == "<h2" { "</h2>" } else { "</h3>" };
        let body_start = start + 3 + open_end + 1;
        let Some(close) = rest[body_start..].find(close_tag) else { break };
        let inner = &rest[body_start..body_start + close];
        let text = plain_text(inner);
        let mut id = slugify(&text);
        if id.is_empty() { id = format!("muc-{}", headings.len() + 1); }
        let base = id.clone();
        let mut n = 2;
        while !used.insert(id.clone()) { id = format!("{base}-{n}"); n += 1; }
        out.push_str(&rest[..start]);
        out.push_str(tag);
        out.push_str(&format!(" id=\"{id}\""));
        out.push_str(&rest[start + 3..body_start]);
        out.push_str(inner);
        out.push_str(close_tag);
        headings.push(Heading { id, text, level: if tag == "<h2" { 2 } else { 3 } });
        rest = &rest[body_start + close + close_tag.len()..];
    }
    out.push_str(rest);
    (out, headings)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_scripts_and_handlers() {
        let out = sanitize_html("<p onclick=\"x()\">Hi<script>alert(1)</script></p><img src=x onerror=alert(1)>");
        assert!(!out.contains("script") && !out.contains("onclick") && !out.contains("onerror"));
        assert!(out.contains("<p>Hi</p>"));
    }

    #[test]
    fn keeps_trusted_iframes_only() {
        let out = sanitize_html("<iframe src=\"https://www.youtube.com/embed/abc\"></iframe><iframe src=\"https://evil.test/x\"></iframe>");
        assert!(out.contains("youtube.com/embed/abc"));
        assert!(!out.contains("evil.test"));
    }

    #[test]
    fn keeps_code_and_tables() {
        let out = sanitize_html("<pre class=\"ql-syntax\" data-language=\"c\"><code>int x;</code></pre><table><tr><td>1</td></tr></table>");
        assert!(out.contains("data-language=\"c\""));
        assert!(out.contains("<div class=\"table-wrap\"><table>"));
    }

    #[test]
    fn rejects_javascript_links() {
        let out = sanitize_html("<a href=\"javascript:alert(1)\">x</a><a href=\"https://ok.test\" target=\"_blank\">y</a>");
        assert!(!out.contains("javascript:"));
        assert!(out.contains("rel=\"noopener noreferrer\""));
    }

    #[test]
    fn indexes_headings() {
        let (html, headings) = index_headings("<h2>1. Giới thiệu</h2><p>x</p><h3 class=\"a\">Chi tiết</h3><h2>1. Giới thiệu</h2>");
        assert_eq!(headings.len(), 3);
        assert_eq!(headings[0].id, "1-gioi-thieu");
        assert_eq!(headings[2].id, "1-gioi-thieu-2");
        assert!(html.contains("<h3 id=\"chi-tiet\" class=\"a\">"));
    }
}
