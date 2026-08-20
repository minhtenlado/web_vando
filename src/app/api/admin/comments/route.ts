import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export async function GET() {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  try {
    const comments = await db.comment.findMany({
      orderBy: { createdAt: "desc" },
    });

    const posts = await db.post.findMany({
      where: { published: true },
      select: { slug: true, title: true, category: true, likes: true, views: true, bookmarks: true },
      orderBy: { createdAt: "desc" },
    });

    // Statistics computation
    const totalComments = comments.length;
    const totalTopLevel = comments.filter((c) => !c.parentId).length;
    const totalReplies = comments.filter((c) => Boolean(c.parentId)).length;
    const totalCommentLikes = comments.reduce((acc, c) => acc + (c.likes || 0), 0);
    const totalPostLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const totalLikes = totalPostLikes + totalCommentLikes;
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

    // Group stats per post slug
    const postStatsMap: Record<
      string,
      {
        title: string;
        postLikes: number;
        postViews: number;
        count: number;
        replyCount: number;
        commentLikes: number;
        lastActivity: string | null;
      }
    > = {};

    for (const p of posts) {
      postStatsMap[p.slug] = {
        title: p.title,
        postLikes: p.likes || 0,
        postViews: p.views || 0,
        count: 0,
        replyCount: 0,
        commentLikes: 0,
        lastActivity: null,
      };
    }

    for (const c of comments) {
      if (!postStatsMap[c.postSlug]) {
        postStatsMap[c.postSlug] = {
          title: c.postSlug,
          postLikes: 0,
          postViews: 0,
          count: 0,
          replyCount: 0,
          commentLikes: 0,
          lastActivity: null,
        };
      }
      postStatsMap[c.postSlug].count += 1;
      postStatsMap[c.postSlug].commentLikes += (c.likes || 0);
      if (c.parentId) {
        postStatsMap[c.postSlug].replyCount += 1;
      }
      if (
        !postStatsMap[c.postSlug].lastActivity ||
        new Date(c.createdAt) > new Date(postStatsMap[c.postSlug].lastActivity!)
      ) {
        postStatsMap[c.postSlug].lastActivity = c.createdAt.toISOString();
      }
    }

    return NextResponse.json({
      ok: true,
      comments,
      posts,
      stats: {
        totalComments,
        totalTopLevel,
        totalReplies,
        totalLikes,
        totalPostLikes,
        totalCommentLikes,
        totalViews,
        postStats: postStatsMap,
      },
    });
  } catch (error: any) {
    console.error("[Admin Comments GET Error]", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Lỗi tải danh sách bình luận" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "reply";

    if (action === "reply") {
      const { postSlug, parentId, content } = body;
      const sanitizedContent = sanitizeText(content || "");

      if (!postSlug || !sanitizedContent || sanitizedContent.length < 2) {
        return NextResponse.json(
          { ok: false, message: "Nội dung phản hồi không hợp lệ." },
          { status: 422 }
        );
      }

      // Fetch site owner profile for real author name & avatar
      const profile = await db.profile.findFirst({
        where: { locale: "vi" },
      });

      const authorName = profile?.name || "Phan Huỳnh Văn Đô";
      const avatarUrl = profile?.avatar || "https://res.cloudinary.com/s4sbshc3/image/upload/v1786817924/web_vando/avatars/eeyk5yoy39vx3iijwnbq.jpg";

      const newReply = await db.comment.create({
        data: {
          postSlug,
          parentId: parentId || null,
          author: authorName,
          isAnonymous: false,
          isAuthor: true,
          avatarUrl,
          content: sanitizedContent,
          avatarColor: "amber",
          likes: 0,
        },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          category: "content",
          action: "create",
          title: `Tác giả trả lời bình luận`,
          detail: `Trả lời trong bài viết: ${postSlug}`,
          resource: postSlug,
          user: "Admin",
          status: "success",
        },
      });

      return NextResponse.json({
        ok: true,
        message: "Đã gửi phản hồi với tư cách Tác giả!",
        comment: newReply,
      });
    }

    return NextResponse.json({ ok: false, message: "Action không hợp lệ." }, { status: 400 });
  } catch (error: any) {
    console.error("[Admin Comments POST Error]", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Lỗi xử lý phản hồi" },
      { status: 500 }
    );
  }
}
