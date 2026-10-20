import { db } from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await props.params;
    const body = await req.json().catch(() => null);
    const action = body && typeof body === "object" && !Array.isArray(body) ? body.action : undefined;

    if (!["view", "like", "unlike", "bookmark", "unbookmark"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const post = await db.post.findFirst({ where: { slug, published: true } });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let updateData = {};
    if (action === "view") {
      updateData = { views: { increment: 1 } };
    } else if (action === "like") {
      updateData = { likes: { increment: 1 } };
    } else if (action === "unlike") {
      updateData = { likes: { decrement: 1 } };
    } else if (action === "bookmark") {
      updateData = { bookmarks: { increment: 1 } };
    } else if (action === "unbookmark") {
      updateData = { bookmarks: { decrement: 1 } };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await db.post.updateMany({
      where: { slug, published: true, ...(action === "unlike" ? { likes: { gt: 0 } } : {}), ...(action === "unbookmark" ? { bookmarks: { gt: 0 } } : {}) },
      data: updateData,
    });

    const updatedPost = await db.post.findFirst({ where: { slug, published: true } });

    return NextResponse.json({
      success: true,
      views: updatedPost?.views,
      likes: updatedPost?.likes,
      bookmarks: updatedPost?.bookmarks,
    });
  } catch (error) {
    console.error("[post stats error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
