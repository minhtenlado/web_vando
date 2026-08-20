import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory rate limiting for comments (max 10 actions / min / IP)
const commentRateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_ACTIONS = 10;

const AVATAR_COLORS = ["emerald", "indigo", "rose", "amber", "sky", "purple", "teal", "pink"];

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "") // Strip any HTML tags
    .replace(/javascript:/gi, "")
    .trim();
}

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const decodedSlug = decodeURIComponent(slug);

    const comments = await db.comment.findMany({
      where: { postSlug: decodedSlug },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ ok: true, comments });
  } catch (error: any) {
    console.error("[Comments GET Error]", error);
    return NextResponse.json(
      { ok: false, comments: [], message: error?.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const decodedSlug = decodeURIComponent(slug);
    const ip = getClientIP(req);
    const now = Date.now();

    // 1. Rate Limit Check
    const rateData = commentRateLimit.get(ip) ?? { count: 0, lastReset: now };
    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count += 1;
    }
    commentRateLimit.set(ip, rateData);

    if (rateData.count > MAX_ACTIONS) {
      return NextResponse.json(
        { ok: false, message: "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    // 2. Parse Body
    const body = await req.json().catch(() => ({}));
    const action = body.action || "create";

    // Handle Comment Like Action
    if (action === "like" || action === "unlike") {
      const commentId = body.commentId;
      if (!commentId) {
        return NextResponse.json({ ok: false, message: "Thiếu ID bình luận." }, { status: 400 });
      }

      const updated = await db.comment.update({
        where: { id: commentId },
        data: {
          likes: action === "like" ? { increment: 1 } : { decrement: 1 },
        },
      });

      return NextResponse.json({
        ok: true,
        likes: Math.max(0, updated.likes),
        commentId,
      });
    }

    // Handle Create Comment or Reply
    const rawContent = (body.content ?? "").toString();
    const isAnonymous = Boolean(body.isAnonymous);
    const parentId = body.parentId ? String(body.parentId) : null;
    let author = (body.author ?? "").toString();

    const sanitizedContent = sanitizeText(rawContent);

    if (!sanitizedContent || sanitizedContent.length < 2) {
      return NextResponse.json(
        { ok: false, message: "Nội dung bình luận quá ngắn (tối thiểu 2 ký tự)." },
        { status: 422 }
      );
    }

    if (sanitizedContent.length > 1000) {
      return NextResponse.json(
        { ok: false, message: "Nội dung bình luận không được vượt quá 1000 ký tự." },
        { status: 422 }
      );
    }

    if (isAnonymous || !author.trim()) {
      author = "Người đọc ẩn danh";
    } else {
      author = sanitizeText(author).slice(0, 50);
    }

    // Pick random avatar color
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // 3. Save to Database (Public comments are always regular readers)
    const newComment = await db.comment.create({
      data: {
        postSlug: decodedSlug,
        parentId,
        author,
        isAnonymous,
        isAuthor: false,
        avatarUrl: null,
        content: sanitizedContent,
        avatarColor,
        likes: 0,
      },
    });

    return NextResponse.json({
      ok: true,
      message: parentId ? "Đã gửi phản hồi thành công!" : "Gửi bình luận thành công!",
      comment: newComment,
    });
  } catch (error: any) {
    console.error("[Comments POST Error]", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Không thể lưu bình luận lúc này. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
