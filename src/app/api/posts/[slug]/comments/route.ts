import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory rate limiting for comments (max 5 comments / min / IP)
const commentRateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_COMMENTS = 5;

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
      take: 100,
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

    if (rateData.count > MAX_COMMENTS) {
      return NextResponse.json(
        { ok: false, message: "Bạn đang bình luận quá nhanh. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    // 2. Parse Body
    const body = await req.json().catch(() => ({}));
    const rawContent = (body.content ?? "").toString();
    const isAnonymous = Boolean(body.isAnonymous);
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

    // 3. Save to Database
    const newComment = await db.comment.create({
      data: {
        postSlug: decodedSlug,
        author,
        isAnonymous,
        content: sanitizedContent,
        avatarColor,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Gửi bình luận thành công!",
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
