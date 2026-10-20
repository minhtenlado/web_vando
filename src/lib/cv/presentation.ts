/** CMS fields can contain localized objects, HTML, or schemeless URLs. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/đ/g, "d").trim();
}

export function localizedText(value: unknown, locale: "vi" | "en"): string {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (value && typeof value === "object") {
    const translations = value as Record<string, unknown>;
    return localizedText(
      translations[locale] ?? translations.vi ?? translations.en,
      locale,
    );
  }
  return "";
}

export function plainText(value: unknown): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function externalUrl(value: unknown): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  const normalized = raw.replace(/^https?\/\//i, "https://");
  try {
    const url = new URL(
      /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`,
    );
    if (!url.hostname.includes(".") || url.username || url.password)
      return undefined;
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
