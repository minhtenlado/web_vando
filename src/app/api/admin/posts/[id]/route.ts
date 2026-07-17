import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type PostInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  published?: boolean;
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
  if (typeof body.content === "string") data.content = body.content.slice(0, 50000);
  if (typeof body.published === "boolean") data.published = body.published;

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
