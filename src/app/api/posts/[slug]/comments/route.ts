import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/validation";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rawParams = await params;
    const slug = decodeURIComponent(rawParams.slug);

    const comments = await db.comment.findMany({
      where: { postSlug: slug },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    console.error("[Comments GET Error]", error);
    return NextResponse.json({ ok: false, comments: [], message: String(error) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rawParams = await params;
    const slug = decodeURIComponent(rawParams.slug);
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
    const rawContent = (body.content ?? "").toString().trim();
    const isAnonymous = Boolean(body.isAnonymous);
    let author = (body.author ?? "").toString().trim();

    if (!rawContent || rawContent.length < 2) {
      return NextResponse.json(
        { ok: false, message: "Nội dung bình luận quá ngắn (tối thiểu 2 ký tự)." },
        { status: 422 }
      );
    }

    if (rawContent.length > 1000) {
      return NextResponse.json(
        { ok: false, message: "Nội dung bình luận không được vượt quá 1000 ký tự." },
        { status: 422 }
      );
    }

    if (isAnonymous || !author) {
      author = "Người đọc ẩn danh";
    } else {
      author = author.slice(0, 50);
    }

    // 3. Sanitize HTML
    const sanitizedContent = sanitizeHtml(rawContent);

    // Pick random avatar color
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // 4. Save to Database
    const newComment = await db.comment.create({
      data: {
        postSlug: slug,
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
  } catch (error) {
    console.error("[Comments POST Error]", error);
    return NextResponse.json(
      { ok: false, message: "Không thể lưu bình luận lúc này. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
