import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requests = new Map<string, { count: number; resetAt: number }>();
const publicPost = (slug: string) => db.post.findFirst({ where: { slug, published: true }, select: { id: true } });
const missing = () => NextResponse.json({ ok: false, message: "Không tìm thấy bài viết hoặc bình luận." }, { status: 404 });
const invalid = (message: string) => NextResponse.json({ ok: false, message }, { status: 422 });
const cleanText = (value: string) => value.replace(/<[^>]*>/g, "").trim();

export async function GET(_req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await props.params;
    if (!await publicPost(slug)) return missing();
    const comments = await db.comment.findMany({ where: { postSlug: slug }, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ ok: true, comments }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, message: "Không tải được bình luận. Vui lòng thử lại." }, { status: 503 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  try {
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const action = input.action ?? "create";
    if (!["create", "like", "unlike"].includes(String(action))) return invalid("Action không hợp lệ.");

    const now = Date.now();
    for (const [key, value] of requests) if (value.resetAt <= now) requests.delete(key);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rate = requests.get(ip) || { count: 0, resetAt: now + 60000 };
    if (++rate.count > 10) return NextResponse.json({ ok: false, message: "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau 1 phút." }, { status: 429, headers: { "Retry-After": "60" } });
    requests.set(ip, rate);

    const { slug } = await props.params;
    if (!await publicPost(slug)) return missing();

    if (action === "like" || action === "unlike") {
      if (typeof input.commentId !== "string" || !input.commentId) return invalid("Thiếu ID bình luận.");
      const where = { id: input.commentId, postSlug: slug };
      if (!await db.comment.findFirst({ where, select: { id: true } })) return missing();
      await db.comment.updateMany({
        where: { ...where, ...(action === "unlike" ? { likes: { gt: 0 } } : {}) },
        data: { likes: action === "like" ? { increment: 1 } : { decrement: 1 } },
      });
      const updated = await db.comment.findFirst({ where, select: { likes: true } });
      if (!updated) return missing();
      return NextResponse.json({ ok: true, likes: Math.max(0, updated.likes), commentId: input.commentId });
    }

    if (typeof input.content !== "string" || (input.author !== undefined && typeof input.author !== "string") ||
        (input.isAnonymous !== undefined && typeof input.isAnonymous !== "boolean") ||
        (input.parentId != null && typeof input.parentId !== "string")) return invalid("Dữ liệu bình luận không hợp lệ.");
    const content = cleanText(input.content);
    if (content.length < 2 || content.length > 1000) return invalid("Nội dung bình luận cần từ 2 đến 1000 ký tự.");
    const parentId = typeof input.parentId === "string" && input.parentId ? input.parentId : null;
    if (parentId && !await db.comment.findFirst({ where: { id: parentId, postSlug: slug }, select: { id: true } })) {
      return invalid("Bình luận được trả lời không thuộc bài viết này.");
    }
    const author = typeof input.author === "string" ? cleanText(input.author).slice(0, 50) : "";
    const isAnonymous = input.isAnonymous === true || !author;
    const comment = await db.comment.create({ data: {
      postSlug: slug, parentId, author: isAnonymous ? "Người đọc ẩn danh" : author,
      isAnonymous, isAuthor: false, avatarUrl: null, content, avatarColor: "slate", likes: 0,
    } });
    return NextResponse.json({ ok: true, comment }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: "Không thể lưu bình luận lúc này. Vui lòng thử lại." }, { status: 503 });
  }
}
