const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com", ".public.blob.vercel-storage.com"];

export function normalizeProjectUrl(value: unknown, options: { allowRelative?: boolean; youtubeOnly?: boolean } = {}): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw || raw.length > 500) return null;
  if (options.youtubeOnly && /^[\w-]{11}$/.test(raw)) return raw;
  if (options.allowRelative && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  if (options.allowRelative && raw.startsWith("#")) return raw;

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (options.youtubeOnly && !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname.toLowerCase())) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeProjectImage(value: unknown): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (raw.length > 500) return "";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase();
    const allowed = ALLOWED_IMAGE_HOSTS.some((host) => host.startsWith(".") ? hostname.endsWith(host) : hostname === host);
    return url.protocol === "https:" && allowed ? url.href : "";
  } catch {
    return "";
  }
}

export function normalizeStringList(value: unknown, maxItems = 100, maxLength = 300): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function normalizeResponsibilities(value: unknown): { title: string; subtitle: string; icon: string }[] {
  if (!Array.isArray(value)) return [];
  const icons = new Set(["cpu", "layers", "zap", "code", "wifi", "shieldcheck", "wrench", "sparkles", "terminal", "chart"]);
  return value.slice(0, 100).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim().slice(0, 300) : "";
    const subtitle = typeof row.subtitle === "string" ? row.subtitle.trim().slice(0, 1000) : "";
    const icon = typeof row.icon === "string" && icons.has(row.icon.toLowerCase()) ? row.icon.toLowerCase() : "cpu";
    return title || subtitle ? [{ title, subtitle, icon }] : [];
  });
}

export function normalizeProjectResults(value: unknown): { number: string; label: string }[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const number = typeof row.number === "string" ? row.number.trim().slice(0, 120) : typeof row.value === "string" ? row.value.trim().slice(0, 120) : "";
    const label = typeof row.label === "string" ? row.label.trim().slice(0, 300) : "";
    return number || label ? [{ number, label }] : [];
  });
}
