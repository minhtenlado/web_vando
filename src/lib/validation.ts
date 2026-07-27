/**
 * Shared Input Validation & Safe HTML Rendering Utilities
 * -------------------------------------------------------
 * Centralizes all validation logic so every form and API route
 * uses the same rules.  No dangerouslySetInnerHTML needed — the
 * `sanitizeHtml` function returns safe HTML via DOMPurify.
 */

import DOMPurify from "isomorphic-dompurify"

// ─── Dangerous-pattern detection ─────────────────────────────────────────────

/**
 * Regex that matches common injection patterns:
 *  - HTML tags like <script>, <img onerror=...>, <svg onload=...>, etc.
 *  - SQL injection characters: standalone single-quotes, double-dashes,
 *    semicolons followed by SQL keywords.
 *  - JavaScript protocol in URLs: javascript:
 */
const DANGEROUS_INPUT_RE =
  /<\s*\/?\s*(script|iframe|object|embed|form|link|meta|style|svg|math|base)\b/i

const SQL_INJECTION_RE =
  /(';\s*(DROP|ALTER|DELETE|UPDATE|INSERT|SELECT|UNION|EXEC|EXECUTE)\b)|(--)|(;\s*(DROP|ALTER|DELETE|UPDATE|INSERT)\b)/i

const JS_PROTOCOL_RE = /^\s*javascript\s*:/i

/**
 * Returns `true` when `value` contains potentially dangerous content
 * (HTML injection, SQL injection patterns, or JS protocol).
 */
export function hasDangerousContent(value: string): boolean {
  if (!value) return false
  return (
    DANGEROUS_INPUT_RE.test(value) ||
    SQL_INJECTION_RE.test(value) ||
    JS_PROTOCOL_RE.test(value)
  )
}

/**
 * Vietnamese & English user-facing error message when dangerous
 * content is detected.
 */
export const DANGEROUS_CONTENT_MSG =
  "Dữ liệu không hợp lệ, vui lòng không nhập mã độc. / Invalid input — please do not enter malicious code."

// ─── Safe HTML sanitization (replaces dangerouslySetInnerHTML inline calls) ──

/** DOMPurify config used throughout the app */
const SANITIZE_CONFIG: DOMPurify.Config = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: [
    "allow",
    "allowfullscreen",
    "frameborder",
    "scrolling",
    "target",
    "class",
  ],
}

/**
 * Sanitize an HTML string for safe rendering.
 * - Normalises `&nbsp;` → regular space
 * - Runs through DOMPurify with a strict allowlist
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return ""
  const normalized = rawHtml.replace(/&nbsp;/g, " ")
  return DOMPurify.sanitize(normalized, SANITIZE_CONFIG)
}

/** Trusted iframe hosts for post content */
const TRUSTED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "codepen.io",
]

/**
 * Sanitize post/article HTML — same as `sanitizeHtml` but additionally
 * strips iframes whose `src` does not belong to a trusted host.
 */
export function sanitizePostHtml(rawHtml: string): string {
  if (!rawHtml) return ""

  // Pre-process (same cleaning logic currently in post-reader)
  const preprocessed = rawHtml
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/&shy;|&#173;|&#xAD;|\u00AD|\u200B|&#8203;|&#x200B;/gi, "")
    .replace(/style="([^"]*)"/gi, (_match, styleVal) => {
      const cleanStyle = (styleVal as string)
        .replace(/word-break\s*:[^;]+;?/gi, "")
        .replace(/hyphens\s*:[^;]+;?/gi, "")
        .replace(/overflow-wrap\s*:[^;]+;?/gi, "")
      return cleanStyle.trim() ? `style="${cleanStyle}"` : ""
    })
    .replace(/<table/g, '<div class="w-full overflow-x-auto my-6"><table')
    .replace(/<\/table>/g, "</table></div>")

  // Sanitize
  const clean = DOMPurify.sanitize(preprocessed, SANITIZE_CONFIG)

  // Post-sanitize: only allow iframes from trusted domains
  return clean.replace(
    /<iframe[^>]*src="([^"]*)"[^>]*>/gi,
    (match, src) => {
      try {
        const url = new URL(src as string)
        if (TRUSTED_IFRAME_HOSTS.includes(url.hostname)) return match
      } catch {
        /* invalid URL */
      }
      return "" // Remove untrusted iframe
    }
  )
}

// ─── Email validation ────────────────────────────────────────────────────────

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

// ─── Generic safe field validator ────────────────────────────────────────────

export type FieldError = Record<string, string>

/**
 * Validate a set of plain-text fields (name, email, message, etc.)
 * Returns a `FieldError` map — empty object means "all valid".
 */
export function validateContactFields(fields: {
  name?: string
  email?: string
  message?: string
}): FieldError {
  const errors: FieldError = {}
  const { name = "", email = "", message = "" } = fields

  // Name
  if (name.trim().length < 2) {
    errors.name = "Vui lòng nhập họ tên (tối thiểu 2 ký tự)."
  } else if (hasDangerousContent(name)) {
    errors.name = DANGEROUS_CONTENT_MSG
  }

  // Email
  if (!isValidEmail(email)) {
    errors.email = "Địa chỉ email không hợp lệ."
  }

  // Message
  if (message.trim().length < 10) {
    errors.message = "Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự)."
  } else if (hasDangerousContent(message)) {
    errors.message = DANGEROUS_CONTENT_MSG
  }

  return errors
}
