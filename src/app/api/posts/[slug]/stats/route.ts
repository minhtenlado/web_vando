import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function POST(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await props.params;
    const body = await req.json();
    const action = body.action; // "view", "like", "unlike", "bookmark", "unbookmark"

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const posts = await db.post.findMany({ where: { slug } });
    
    if (posts.length === 0) {
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
      where: { slug },
      data: updateData,
    });

    const updatedPost = await db.post.findFirst({ where: { slug } });

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
