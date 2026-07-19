import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteData } from "@/lib/cv/site-data-server";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";
  const data = await getSiteData(locale);
  // Admin sees all (including unpublished), but already filtered by locale in getSiteData
  return NextResponse.json({ ok: true, posts: data.posts });
}

type PostInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  published?: boolean;
  locale?: string;
  createdAt?: string;
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

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  let body: PostInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ ok: false, message: "Tiêu đề là bắt buộc." }, { status: 422 });
  }

  const locale = body.locale === "en" ? "en" : "vi";
  let slug = slugify((body.slug ?? title));
  if (!slug) slug = `post-${Date.now()}`;

  // ensure unique slug per locale
  const existing = await db.post.findUnique({ 
    where: { slug_locale: { slug, locale } } 
  });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const created = await db.post.create({
    data: {
      locale,
      title,
      slug,
      excerpt: (body.excerpt ?? "").slice(0, 600),
      content: (body.content ?? "").slice(0, 5000000),
      published: !!body.published,
      ...(body.createdAt ? { createdAt: new Date(body.createdAt) } : {}),
    },
  });

  return NextResponse.json({ ok: true, post: created });
}
