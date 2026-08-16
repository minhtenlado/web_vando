import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type PostInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  published?: boolean;
  category?: string;
  layout?: string;
  createdAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  coverImage?: string;
  pdfUrl?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function sanitizePostContent(c: string): string {
  return c
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/&shy;|&#173;|&#xAD;|\u00AD|\u200B|&#8203;|&#x200B;/gi, "")
    .replace(/style="([^"]*)"/gi, (_match, styleVal) => {
      const cleanStyle = styleVal
        .replace(/word-break\s*:[^;]+;?/gi, "")
        .replace(/hyphens\s*:[^;]+;?/gi, "")
        .replace(/overflow-wrap\s*:[^;]+;?/gi, "");
      return cleanStyle.trim() ? `style="${cleanStyle}"` : "";
    });
}

/** Chỉ cho phép URL an toàn — chặn javascript:, vbscript: */
function sanitizeUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  if (/^(javascript|vbscript):/i.test(s)) return null;
  if (s.startsWith("data:image/")) return s.slice(0, 5000000); // Cho phép base64 ảnh tới 5MB
  if (s.startsWith("data:")) return null; // Chặn data url khác
  if (!s.startsWith("https://") && !s.startsWith("http://") && !s.startsWith("/")) return null;
  return s.slice(0, 2000);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  let body: PostInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  const existingPost = await db.post.findUnique({ where: { id } });
  if (!existingPost) {
    return NextResponse.json({ ok: false, message: "Không tìm thấy bài viết." }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim().slice(0, 300);
  if (typeof body.slug === "string") {
    const slug = slugify(body.slug) || `post-${Date.now()}`;
    const existing = await db.post.findUnique({ 
      where: { slug_locale: { slug, locale: existingPost.locale } } 
    });
    if (existing && existing.id !== id) {
      return NextResponse.json({ ok: false, message: "Slug đã tồn tại." }, { status: 422 });
    }
    data.slug = slug;
  }
  if (typeof body.excerpt === "string") data.excerpt = body.excerpt.slice(0, 600);
  if (typeof body.category === "string") data.category = body.category.slice(0, 100);
  if (typeof body.content === "string") data.content = sanitizePostContent(body.content).slice(0, 5000000);
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.seoTitle === "string") data.seoTitle = body.seoTitle.slice(0, 300);
  if (typeof body.seoDescription === "string") data.seoDescription = body.seoDescription.slice(0, 600);
  if (typeof body.seoKeywords === "string") data.seoKeywords = body.seoKeywords.slice(0, 300);
  if (typeof body.coverImage === "string") data.coverImage = sanitizeUrl(body.coverImage);
  if (body.coverImage === null || body.coverImage === "") data.coverImage = null;
  if (typeof body.pdfUrl === "string") data.pdfUrl = sanitizeUrl(body.pdfUrl);
  if (body.pdfUrl === null || body.pdfUrl === "") data.pdfUrl = null;
  if (typeof body.createdAt === "string") data.createdAt = new Date(body.createdAt);
  if (typeof body.layout === "string" && ["article", "tutorial"].includes(body.layout)) data.layout = body.layout;

  try {
    const updated = await db.post.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post: updated });
  } catch {
    return NextResponse.json({ ok: false, message: "Lỗi cập nhật bài viết." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  try {
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Không tìm thấy bài viết." }, { status: 404 });
  }
}
