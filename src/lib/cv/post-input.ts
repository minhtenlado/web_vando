export type PostInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  published?: boolean;
  locale?: string;
  category?: string;
  layout?: string;
  createdAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  coverImage?: string | null;
  pdfUrl?: string | null;
};

export function postPayloadError(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Body không hợp lệ.";
  const body = value as Record<string, unknown>;
  for (const key of ["title", "slug", "excerpt", "content", "locale", "category", "layout", "createdAt", "seoTitle", "seoDescription", "seoKeywords"]) {
    if (body[key] !== undefined && typeof body[key] !== "string") return "Trường văn bản không hợp lệ: " + key;
  }
  if (typeof body.title === "string" && !body.title.trim()) return "Tiêu đề là bắt buộc.";
  if (body.published !== undefined && typeof body.published !== "boolean") return "Trạng thái không hợp lệ.";
  for (const key of ["coverImage", "pdfUrl"]) {
    if (body[key] != null && typeof body[key] !== "string") return "URL không hợp lệ.";
  }
  if (body.createdAt !== undefined && !Number.isFinite(Date.parse(body.createdAt as string))) return "Ngày đăng không hợp lệ.";
}
